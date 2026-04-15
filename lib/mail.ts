import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const fromEmail = process.env.EMAIL_FROM || 'no-reply@koda.com';

export const sendSwapRequestEmail = async (to: string, receiverName: string, senderName: string, message: string) => {
  try {
    await transporter.sendMail({
      from: `"Koda" <${fromEmail}>`,
      to,
      subject: `New Swap Request from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #00FFFF;">New Skill Swap Request!</h2>
          <p>Hi <strong>${receiverName}</strong>,</p>
          <p><strong>${senderName}</strong> wants to swap skills with you on Koda.</p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #00FFFF; margin: 20px 0;">
            <p style="font-style: italic; margin: 0;">"${message}"</p>
          </div>
          <p>Log in to your dashboard to respond to this request.</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #00FFFF; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Dashboard</a>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #999;">You received this because someone initiated a swap with you on Koda.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send swap request email:', error);
  }
};

export const sendSwapAcceptedEmail = async (to: string, senderName: string, receiverName: string) => {
  try {
    await transporter.sendMail({
      from: `"Koda" <${fromEmail}>`,
      to,
      subject: `Swap Request Accepted by ${receiverName}!`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #00FFFF;">Request Accepted!</h2>
          <p>Hi <strong>${senderName}</strong>,</p>
          <p>Great news! <strong>${receiverName}</strong> has accepted your swap request.</p>
          <p>You can now start negotiating the details and schedule your first session in the Session Hub.</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #00FFFF; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px;">Go to Session Hub</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send swap accepted email:', error);
  }
};

export const sendSwapCompletionEmail = async (to: string, userName: string, partnerName: string) => {
  try {
    await transporter.sendMail({
      from: `"Koda" <${fromEmail}>`,
      to,
      subject: `Skill Swap Successfully Completed!`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #FF00FF;">Learning Milestone Reached!</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Congratulations! Your skill swap with <strong>${partnerName}</strong> has been marked as successfully completed.</p>
          <p>Your new skill is now officially verified on your profile. Keep learning and growing!</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 10px 20px; border: 2px solid #FF00FF; border-radius: 20px; color: #FF00FF; font-weight: bold; font-size: 18px;">
              🏆 Verified Completion
            </div>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/settings" style="display: inline-block; background: #FF00FF; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px;">View My Profile</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send swap completion email:', error);
  }
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  try {
    await transporter.sendMail({
      from: `"Koda" <${fromEmail}>`,
      to: email,
      subject: "Verify your Koda account",
      html: `
        <div style="background:#030303;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(0,255,255,0.2);border-radius:16px;">
          <h1 style="color:#00FFFF;font-size:32px;margin-bottom:8px;font-weight:bold;">KODA</h1>
          <h2 style="color:#fff;margin-bottom:16px;">Verify your email, ${name}</h2>
          <p style="color:rgba(255,255,255,0.7);margin-bottom:32px;">Click the button below to verify your email address and activate your account.</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:rgba(0,255,255,0.1);border:1px solid #00FFFF;color:#00FFFF;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
            Verify Email
          </a>
          <p style="color:rgba(255,255,255,0.4);margin-top:32px;font-size:12px;">This link expires in 24 hours.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  try {
    await transporter.sendMail({
      from: `"Koda" <${fromEmail}>`,
      to: email,
      subject: "Reset your Koda password",
      html: `
        <div style="background:#030303;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(255,0,255,0.2);border-radius:16px;">
          <h1 style="color:#FF00FF;font-size:32px;margin-bottom:8px;font-weight:bold;">KODA</h1>
          <h2 style="color:#fff;margin-bottom:16px;">Reset your password, ${name}</h2>
          <p style="color:rgba(255,255,255,0.7);margin-bottom:32px;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:rgba(255,0,255,0.1);border:1px solid #FF00FF;color:#FF00FF;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
            Reset Password
          </a>
          <p style="color:rgba(255,255,255,0.4);margin-top:32px;font-size:12px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};
