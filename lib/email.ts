import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Koda" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your Koda account",
    html: `
      <div style="background:#030303;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(0,255,255,0.2);border-radius:16px;">
        <h1 style="background:linear-gradient(to right,#00FFFF,#FF00FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:32px;margin-bottom:8px;">KODA</h1>
        <h2 style="color:#fff;margin-bottom:16px;">Verify your email, ${name}</h2>
        <p style="color:rgba(255,255,255,0.7);margin-bottom:32px;">Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,rgba(0,255,255,0.2),rgba(255,0,255,0.2));border:1px solid #00FFFF;color:#00FFFF;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          Verify Email
        </a>
        <p style="color:rgba(255,255,255,0.4);margin-top:32px;font-size:12px;">This link expires in 24 hours. If you didn't create a Koda account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Koda" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset your Koda password",
    html: `
      <div style="background:#030303;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(255,0,255,0.2);border-radius:16px;">
        <h1 style="background:linear-gradient(to right,#00FFFF,#FF00FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:32px;margin-bottom:8px;">KODA</h1>
        <h2 style="color:#fff;margin-bottom:16px;">Reset your password, ${name}</h2>
        <p style="color:rgba(255,255,255,0.7);margin-bottom:32px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,rgba(255,0,255,0.2),rgba(0,255,255,0.2));border:1px solid #FF00FF;color:#FF00FF;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          Reset Password
        </a>
        <p style="color:rgba(255,255,255,0.4);margin-top:32px;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
