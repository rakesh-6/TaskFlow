import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const getBaseTemplate = (title, content, buttonText, buttonLink) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .logo { font-size: 24px; font-weight: bold; color: #4285F4; text-align: center; margin-bottom: 30px; }
    .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #111827; }
    .content { font-size: 16px; line-height: 1.5; margin-bottom: 30px; color: #4B5563; }
    .btn { display: inline-block; padding: 12px 24px; background: #4285F4; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">TaskFlow</div>
    <div class="title">${title}</div>
    <div class="content">${content}</div>
    ${buttonText ? `<div style="text-align: center;"><a href="${buttonLink}" class="btn" style="color:#fff;">${buttonText}</a></div>` : ''}
    <div class="footer">If you didn't request this, you can safely ignore this email.</div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, token) => {
    const transporter = createTransporter();
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const html = getBaseTemplate(
        'Verify your email address',
        'Welcome to TaskFlow! Please click the button below to verify your email address and get started.',
        'Verify Email',
        link
    );

    await transporter.sendMail({
        from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'TaskFlow - Verify your email',
        html,
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const transporter = createTransporter();
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const html = getBaseTemplate(
        'Reset your password',
        'We received a request to reset your password. Click the button below to choose a new one. This link will expire in 1 hour.',
        'Reset Password',
        link
    );

    await transporter.sendMail({
        from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'TaskFlow - Password Reset',
        html,
    });
};

export const sendTeamInviteEmail = async (email, inviterName, projectName, token) => {
    const transporter = createTransporter();
    const link = `${process.env.CLIENT_URL}/invite?token=${token}`;

    const html = getBaseTemplate(
        'You have been invited to a project!',
        `<b>${inviterName}</b> has invited you to collaborate on the project <b>${projectName}</b> in TaskFlow.`,
        'Accept Invitation',
        link
    );

    await transporter.sendMail({
        from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `TaskFlow - Invitation to ${projectName}`,
        html,
    });
};
