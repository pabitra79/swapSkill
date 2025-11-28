import dotenv from "dotenv";
import nodemailer from 'nodemailer';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;


const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};


const transporter = nodemailer.createTransport(emailConfig);


transporter.verify((error:any) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});


export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; message: string }> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"SkillSwap" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};

export const welcomeEmailTemplate = (
  name: string,
  email: string,
  temporaryPassword: string,
  verificationToken: string
): { subject: string; html: string; text: string } => {
  const verificationLink = `${BACKEND_URL}/api/verify-email?token=${verificationToken}`;

  return {
    subject: "Welcome to SkillSwap - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .credentials { 
            background-color: #fff; 
            padding: 15px; 
            border-left: 4px solid #4CAF50; 
            margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SkillSwap!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining SkillSwap - the platform where you can exchange skills through time-based knowledge trading!</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
            </div>

            <p><strong>⚠️ Important:</strong> Please verify your email address to activate your account.</p>
            
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #4CAF50;">${verificationLink}</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <h3>What's Next?</h3>
            <ol>
              <li>Verify your email using the link above</li>
              <li>Log in with your credentials</li>
              <li>Complete your profile with skills you can teach and want to learn</li>
              <li>Start swapping skills with the community!</li>
            </ol>

            <p><strong>Pro Tip:</strong> We recommend changing your password after first login for security.</p>
          </div>
          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to SkillSwap!

Hi ${name},

Thank you for joining SkillSwap - the platform where you can exchange skills through time-based knowledge trading!

Your Login Credentials:
Email: ${email}
Temporary Password: ${temporaryPassword}

Important: Please verify your email address to activate your account.

Verification Link: ${verificationLink}

What's Next?
1. Verify your email using the link above
2. Log in with your credentials
3. Complete your profile with skills you can teach and want to learn
4. Start swapping skills with the community!

Pro Tip: We recommend changing your password after first login for security.

If you didn't create this account, please ignore this email.

© 2025 SkillSwap. All rights reserved.
    `,
  };
};

export const verificationSuccessTemplate = (
  name: string
): { subject: string; html: string; text: string } => {
  return {
    subject: "Email Verified Successfully - SkillSwap",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .success-icon { font-size: 48px; text-align: center; color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verified!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✓</div>
            <h2>Hi ${name},</h2>
            <p>Your email has been successfully verified! Your account is now active.</p>
            <p>You can now log in and start exploring SkillSwap.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Email Verified!

Hi ${name},

Your email has been successfully verified! Your account is now active.

You can now log in and start exploring SkillSwap.`,
  };
};


export const passwordResetTemplate = (
  name: string,
  resetToken: string
): { subject: string; html: string; text: string } => {
const resetLink = `http://localhost:5000/api/reset-password?token=${resetToken}`;
  return {
    subject: "Password Reset Request - SkillSwap",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #FF9800; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .warning { 
            background-color: #fff3cd; 
            border-left: 4px solid #FF9800; 
            padding: 15px; 
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password for your SkillSwap account.</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #FF9800;">${resetLink}</p>

            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request

Hi ${name},

We received a request to reset your password for your SkillSwap account.

Reset Password Link: ${resetLink}

Security Notice:
- This link will expire in 1 hour
- If you didn't request this, please ignore this email
- Your password won't change until you create a new one`,
};
};
