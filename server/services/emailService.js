const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('Nodemailer Gmail transporter initialized successfully.');
} else {
  console.warn('WARNING: EMAIL_USER and EMAIL_PASS are not defined in environment variables. Password reset emails will fallback to server console logs.');
}

/**
 * Sends a password reset email to the specified user.
 * @param {string} email - Receiver email address
 * @param {string} name - Receiver name
 * @param {string} resetUrl - Password reset URL
 */
async function sendPasswordResetEmail(email, name, resetUrl) {
  if (!transporter) {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║         PASSWORD RESET LINK (dev mode)          ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  To: ${name} <${email}>`);
    console.log(`║  Link: ${resetUrl}`);
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    return;
  }

  const mailOptions = {
    from: `"SkillSwap Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'SkillSwap - Reset Your Password',
    text: `Hi ${name},\n\nYou requested to reset your password. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nSkillSwap Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fcfcfc;">
        <h2 style="color: #C84B31; text-align: center;">SkillSwap</h2>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested to reset your password. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #C84B31; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 13px; color: #C84B31; word-break: break-all;"><a href="${resetUrl}" style="color: #C84B31;">${resetUrl}</a></p>
        <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">SkillSwap - Trade what you know. Learn what you don't.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
};
