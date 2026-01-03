import {
  Body,
  Controller,
  Post,
  Get,
  ValidationPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import EmailService from './email.service';
import { SendEmailDto, EmailResponseDto } from './dto';

@ApiTags('Email')
@Controller('email')
export default class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({
    summary: 'Send a single email',
    description: 'Sends an email to one or more recipients with customizable content and settings',
  })
  @ApiBody({
    type: SendEmailDto,
    description: 'Email data including recipients, content, and settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
    type: EmailResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid email data or validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number', example: 400,
        },
        message: {
          type: 'string', example: 'Failed to send email',
        },
        error: {
          type: 'string', example: 'Invalid email address format',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error while sending email',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number', example: 500,
        },
        message: {
          type: 'string', example: 'Internal server error while sending email',
        },
        error: {
          type: 'string', example: 'SMTP connection failed',
        },
      },
    },
  })
  async sendEmail(
    @Body(ValidationPipe) sendEmailDto: SendEmailDto,
  ): Promise<EmailResponseDto> {
    try {
      const result = await this.emailService.sendEmail(sendEmailDto);

      if (!result.success) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: result.message,
            error: result.error,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error while sending email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-bulk')
  @ApiOperation({
    summary: 'Send multiple emails in batch',
    description: 'Sends multiple emails with rate limiting to prevent overwhelming the SMTP server',
  })
  @ApiBody({
    type: [SendEmailDto],
    description: 'Array of email data objects to send in batch',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk emails processed (individual results in response array)',
    type: [EmailResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or empty array provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error while processing bulk emails',
  })
  async sendBulkEmails(
    @Body(ValidationPipe) sendEmailDtos: SendEmailDto[],
  ): Promise<EmailResponseDto[]> {
    try {
      if (!Array.isArray(sendEmailDtos) || sendEmailDtos.length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Request body must be a non-empty array of email objects',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emailService.sendBulkEmails(sendEmailDtos);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error while sending bulk emails',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('verify-connection')
  @ApiOperation({
    summary: 'Verify SMTP connection',
    description: 'Tests the SMTP server connection to ensure email service is working properly',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection verification result',
    schema: {
      type: 'object',
      properties: {
        connected: {
          type: 'boolean', example: true,
        },
        message: {
          type: 'string', example: 'SMTP connection is working properly',
        },
      },
    },
  })
  async verifyConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const isConnected = await this.emailService.verifyConnection();

      return {
        connected: isConnected,
        message: isConnected
          ? 'SMTP connection is working properly'
          : 'SMTP connection failed',
      };
    } catch (error) {
      return {
        connected: false,
        message: `Connection verification failed: ${error.message}`,
      };
    }
  }

 
  @Get('health')
  @ApiOperation({
    summary: 'Email service health check',
    description: 'Returns the health status of the email notification service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string', example: 'OK',
        },
        service: {
          type: 'string', example: 'Email Notification Service',
        },
      },
    },
  })
  getHealth(): { status: string; service: string } {
    return {
      status: 'OK',
      service: 'Email Notification Service',
    };
  }
}
