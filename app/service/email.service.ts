import { transporter } from "../config/emailConfig";
import {
  welcomeEmailTemplate,
  verificationSuccessTemplate,
  passwordResetTemplate,
} from "../utils/emailTemplates.utils";

const EMAIL_FROM = process.env.EMAIL_FROM || "barikpabitra101@gmail.com";


export const sendWelcomeEmail = async (
  email: string,
  name: string,
  temporaryPassword: string,
  verificationToken: string
): Promise<void> => {
  try {
    console.log("📧 Preparing welcome email for:", email);

    const emailContent = welcomeEmailTemplate(
      name,
      email,
      temporaryPassword,
      verificationToken
    );

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Welcome email sent successfully:", info.messageId);
  } catch (error) {
    console.error(" Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};


//   Send verification success email
 
export const sendVerificationSuccessEmail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    console.log("📧 Sending verification success email to:", email);

    const emailContent = verificationSuccessTemplate(name);

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Verification success email sent:", info.messageId);
  } catch (error) {
    console.error(" Error sending verification success email:", error);
    // Don't throw error here, verification already succeeded
  }
};

//  Send password reset email
 
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  try {
    console.log("📧 Sending password reset email to:", email);

    const emailContent = passwordResetTemplate(name, resetToken);

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Password reset email sent:", info.messageId);
  } catch (error) {
    console.error(" Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};