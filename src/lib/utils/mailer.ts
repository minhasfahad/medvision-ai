import nodemailer from 'nodemailer';

// Define an interface for the return status
interface SendMailResult {
  success: boolean;
  messageId?: string;
}

// Create a reusable transporter using Gmail SMTP configurations from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a secure password reset email to a user.
 * @param toEmail - The recipient's email address
 * @param resetToken - The securely generated reset token
 */
export const sendResetEmail = async (toEmail: string, resetToken: string): Promise<SendMailResult> => {
  // Dynamically builds the link using your active environment's base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"MedVision AI Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Your MedVision AI Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">MedVision AI Password Reset</h2>
        <p>You requested a password reset for your MedVision AI account. Click the button below to set a new password. This link will expire after 15 minutes.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="color: #0070f3; font-size: 12px; word-break: break-all;">${resetLink}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email via Nodemailer:', error);
    throw new Error('Failed to send reset email.');
  }
};

/**
 * Sends a contact form message to the admin's email.
 * @param name - The visitor's name
 * @param email - The visitor's email address
 * @param message - The message body
 */
export const sendContactEmail = async (name: string, email: string, message: string) => {
  const mailOptions = {
    // It is sent FROM your own secure server, but uses their name as the label
    from: `"${name} (MedVision Contact)" <${process.env.EMAIL_USER}>`,
    // It goes TO your own inbox
    to: process.env.EMAIL_USER,
    // If you click "Reply" in your Gmail, it will reply to the visitor's email!
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">New Message via MedVision AI</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #444; white-space: pre-wrap;">${message}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Contact email sent successfully. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw new Error('Failed to send contact email.');
  }
};