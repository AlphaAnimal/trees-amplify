import { CustomMessageTriggerHandler } from 'aws-lambda';

/**
 * Custom Lambda function to customize Cognito email messages
 * This allows us to brand the verification emails with "Trees Lab"
 */
export const handler: CustomMessageTriggerHandler = async (event) => {
  // Customize the verification code email
  if (event.triggerSource === 'CustomMessage_SignUp') {
    const { codeParameter } = event.request;
    
    // Custom email subject
    event.response.emailSubject = 'Verify your Trees Lab account';
    
    // Custom email message with Trees Lab branding (HTML format)
    event.response.emailMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .code { font-size: 24px; font-weight: bold; color: #2d5016; text-align: center; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌳 Trees Lab</h1>
    </div>
    <div class="content">
      <h2>Welcome to Trees Lab!</h2>
      <p>Thank you for creating an account. To complete your registration, please use the verification code below:</p>
      <div class="code">${codeParameter}</div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't create an account with Trees Lab, please ignore this email.</p>
      <p>Thank you,<br>The Trees Lab Team</p>
    </div>
    <div class="footer">
      <p>This email was sent by Trees Lab</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
  
  // Customize resend code email
  if (event.triggerSource === 'CustomMessage_ResendCode') {
    const { codeParameter } = event.request;
    
    event.response.emailSubject = 'Your Trees Lab verification code';
    event.response.emailMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .code { font-size: 24px; font-weight: bold; color: #2d5016; text-align: center; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌳 Trees Lab</h1>
    </div>
    <div class="content">
      <h2>Your Verification Code</h2>
      <p>Here is your verification code for Trees Lab:</p>
      <div class="code">${codeParameter}</div>
      <p>This code will expire in 15 minutes.</p>
      <p>Thank you,<br>The Trees Lab Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
  
  // You can also customize other email types here:
  // - CustomMessage_ForgotPassword
  // - CustomMessage_UpdateUserAttribute
  // - CustomMessage_VerifyUserAttribute
  // - CustomMessage_AdminCreateUser
  // - CustomMessage_Authentication
  
  return event;
};

