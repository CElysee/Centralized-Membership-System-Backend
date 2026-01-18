export interface ApplicationSubmittedEmailData {
  applicantName: string;
  applicantEmail: string;
  applicationNumber: string;
  associationName: string;
  submittedAt: string;
  reviewLink?: string;
}

/**
 * Email template for notifying managers/admins about new membership application
 */
export const applicationSubmittedToManagerTemplate = (
  data: ApplicationSubmittedEmailData,
): { subject: string; html: string; text: string } => {
  const { applicantName, applicantEmail, applicationNumber, associationName, submittedAt, reviewLink } = data;

  return {
    subject: `New Membership Application - ${applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Membership Application</h1>
        </div>
        
        <div style="background-color: #f7fafc; padding: 30px; border: 1px solid #e2e8f0;">
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
            A new membership application has been submitted and requires your review.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h2 style="color: #2d3748; font-size: 18px; margin-top: 0;">Application Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Application Number:</td>
                <td style="padding: 10px 0; color: #2d3748; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Applicant Name:</td>
                <td style="padding: 10px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${applicantName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Applicant Email:</td>
                <td style="padding: 10px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${applicantEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Association:</td>
                <td style="padding: 10px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${associationName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;">Submitted At:</td>
                <td style="padding: 10px 0; color: #2d3748;">${submittedAt}</td>
              </tr>
            </table>
          </div>

          ${reviewLink ? `
          <div style="text-align: center; margin-top: 20px;">
            <a href="${reviewLink}" style="background-color: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Review Application
            </a>
          </div>
          ` : ''}

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            Please review the application and uploaded documents at your earliest convenience.
          </p>
        </div>
        
        <div style="background-color: #edf2f7; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #718096; font-size: 12px; margin: 0;">
            This is an automated notification from the Centralized Membership System.
          </p>
        </div>
      </div>
    `,
    text: `
New Membership Application

A new membership application has been submitted and requires your review.

Application Details:
- Application Number: ${applicationNumber}
- Applicant Name: ${applicantName}
- Applicant Email: ${applicantEmail}
- Association: ${associationName}
- Submitted At: ${submittedAt}

${reviewLink ? `Review the application at: ${reviewLink}` : ''}

Please review the application and uploaded documents at your earliest convenience.

This is an automated notification from the Centralized Membership System.
    `,
  };
};

/**
 * Email template for confirming application submission to the applicant
 */
export const applicationSubmittedToApplicantTemplate = (
  data: ApplicationSubmittedEmailData,
): { subject: string; html: string; text: string } => {
  const { applicantName, applicationNumber, associationName, submittedAt } = data;

  return {
    subject: `Application Received - ${applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #38a169; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Application Received!</h1>
        </div>
        
        <div style="background-color: #f7fafc; padding: 30px; border: 1px solid #e2e8f0;">
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
            Dear ${applicantName},
          </p>
          
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
            Thank you for submitting your membership application. We have received your application and it is now under review.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h2 style="color: #2d3748; font-size: 18px; margin-top: 0;">Your Application Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Application Number:</td>
                <td style="padding: 10px 0; color: #2d3748; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Association:</td>
                <td style="padding: 10px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${associationName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096; border-bottom: 1px solid #e2e8f0;">Status:</td>
                <td style="padding: 10px 0; color: #38a169; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Submitted</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;">Submitted At:</td>
                <td style="padding: 10px 0; color: #2d3748;">${submittedAt}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ebf8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3182ce;">
            <p style="color: #2c5282; font-size: 14px; margin: 0;">
              <strong>What happens next?</strong><br><br>
              Our team will review your application and documents. You will receive an email notification once your application has been processed. This typically takes 3-5 business days.
            </p>
          </div>
        </div>
        
        <div style="background-color: #edf2f7; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #718096; font-size: 12px; margin: 0;">
            If you have any questions, please contact us.<br>
            © ${new Date().getFullYear()} Centralized Membership System
          </p>
        </div>
      </div>
    `,
    text: `
Application Received!

Dear ${applicantName},

Thank you for submitting your membership application. We have received your application and it is now under review.

Your Application Details:
- Application Number: ${applicationNumber}
- Association: ${associationName}
- Status: Submitted
- Submitted At: ${submittedAt}

What happens next?
Our team will review your application and documents. You will receive an email notification once your application has been processed. This typically takes 3-5 business days.

If you have any questions, please contact us.

© ${new Date().getFullYear()} Centralized Membership System
    `,
  };
};


