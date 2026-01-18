/**
 * Email verification template
 */
export const emailVerificationTemplate = (
  userName: string,
  verificationLink: string,
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .verification-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .verification-button:hover {
          opacity: 0.9;
        }
        .alternative-link {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
          word-break: break-all;
          font-size: 12px;
          color: #666;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .footer p {
          margin: 5px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Verify Your Email</h1>
        </div>
        
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          
          <p>Thank you for registering with us! To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="verification-button">
              Verify Email Address
            </a>
          </div>
          
          <div class="warning">
            <p><strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
          </div>
          
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          
          <div class="alternative-link">
            ${verificationLink}
          </div>
          
          <p>If you didn't create an account with us, please ignore this email or contact our support team if you have concerns.</p>
          
          <p>Best regards,<br/>
          <strong>The CMS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© ${new Date().getFullYear()} Centralized Membership System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Plain text version of email verification template
 */
export const emailVerificationTextTemplate = (
  userName: string,
  verificationLink: string,
): string => {
  return `
Hello ${userName},

Thank you for registering with us! To complete your registration and start using your account, please verify your email address by clicking the link below:

${verificationLink}

IMPORTANT: This verification link will expire in 24 hours for security reasons.

If you didn't create an account with us, please ignore this email or contact our support team if you have concerns.

Best regards,
The CMS Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} Centralized Membership System. All rights reserved.
  `.trim();
};



