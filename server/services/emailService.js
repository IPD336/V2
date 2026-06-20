const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Resend email client initialized successfully.');
} else {
  console.warn('WARNING: RESEND_API_KEY is not defined in environment variables. Password reset emails will fallback to server console logs.');
}

/**
 * Sends a password reset email to the specified user using Resend.
 * @param {string} email - Receiver email address
 * @param {string} name - Receiver name
 * @param {string} resetUrl - Password reset URL
 */
async function sendPasswordResetEmail(email, name, resetUrl) {
  if (!resend) {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║         PASSWORD RESET LINK (dev mode)           ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  To: ${name} <${email}>`);
    console.log(`║  Link: ${resetUrl}`);
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    return;
  }

  const htmlContent = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      // Resend free tier requires sending from this onboarding domain unless you verify a custom domain
      from: 'SkillSwap Support <onboarding@resend.dev>',
      to: email,
      subject: 'SkillSwap - Reset Your Password',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API returned an error:', error);
      throw error;
    }

    console.log(`Password reset email sent successfully via Resend to ${email}. ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
};
