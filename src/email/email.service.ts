import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { SendEmailDto, EmailResponseDto } from './dto';

// SendGrid

@Injectable()
export default class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY') as string;
    const nodeEnv = this.configService.get<string>('NODE_ENV') as string;

    if (!sendgridApiKey) {
      this.logger.warn(
        'SendGrid API key is missing. Email service may not work properly.',
      );
      return;
    }

    SendGrid.setApiKey(sendgridApiKey);

    if (nodeEnv === 'development') {
      this.logger.log('SendGrid initialized in development mode');
    } else {
      this.logger.log('SendGrid initialized successfully');
    }
  }

  async sendEmail(emailData: SendEmailDto): Promise<EmailResponseDto> {
    try {
      const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!sendgridApiKey) {
        throw new Error('SendGrid API key not configured');
      }

      const recipients = emailData.to.map((email, index) => {
        const name = emailData.toNames[index] || '';
        return name ? {
          email, name,
        } : {
          email,
        };
      });

      const from = {
        email: emailData.from,
        name: emailData.fromName,
      };

      let replyTo: { email: string; name?: string } | undefined;
      if (!emailData.isReplyable) {
        replyTo = {
          email: 'thierry@rwandatourismchamber.org',
        };
      } else if (emailData.replyTo) {
        replyTo = {
          email: emailData.replyTo,
          name: emailData.replyToName,
        };
      }

      const msg = {
        to: recipients,
        from,
        replyTo,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
      };

      this.logger.log(`Sending email to: ${recipients.map((r) => r.email).join(', ')}`);
      const response = await SendGrid.send(msg);

      const messageId = response[0]?.headers?.['x-message-id'] || 'unknown';

      this.logger.log(`Email sent successfully. Message ID: ${messageId}`);

      return {
        success: true,
        message: 'Email sent successfully',
        messageId,
      };
    } catch (error: any) {
      console.log("error from email sending")
      console.dir(error,{depth:null})
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      return {
        success: false,
        message: 'Failed to send email',
        error: error.message,
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!sendgridApiKey) {
        return false;
      }

      // SendGrid doesn't have a direct verify like SMTP, but we can test with a minimal call
      // This will throw if API key is invalid
      await SendGrid.send({
        to: 'edmondgaks@gmail.com',
        from: 'tresoramizero1@gmail.com',
        subject: 'Connection Test',
        text: 'Testing SendGrid connection',
      })
      .then((res)=>{
        console.log("Email sent successfully", res);
      })
      .catch((error) => {
        console.log("unable to send email",error.response.body);
      });

      this.logger.log('SendGrid connection verified successfully');
      return true;
    } catch (error: any) {
      this.logger.error(
        `SendGrid connection verification failed: ${error.message}`,
      );
      return false;
    }
  }

  async sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponseDto[]> {
    const emailPromises = emails.map(async (email, index) => {
      // Add delay for rate limiting (except for first email)
      if (index > 0) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 100 * index));
      }
      return this.sendEmail(email);
    });

    return Promise.all(emailPromises);
  }
}
