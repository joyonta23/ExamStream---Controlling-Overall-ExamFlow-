const nodemailer = require("nodemailer");

const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS || 30000);
let lastEmailError = null;

const getLastEmailError = () => lastEmailError;

// Create Brevo SMTP transporter (works on Render - designed for server sending)
const createTransporter = () => {
  const key = (process.env.BREVO_SMTP_KEY || "").trim();
  const user = (
    process.env.BREVO_SMTP_USER ||
    process.env.EMAIL_USER ||
    ""
  ).trim();
  if (!key || !user) {
    console.warn(
      "BREVO_SMTP_KEY or BREVO_SMTP_USER missing. Email sending disabled.",
    );
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: { user, pass: key },
    connectionTimeout: 15000,
    socketTimeout: EMAIL_TIMEOUT_MS,
  });
};

const sendMailWithTimeout = async (mailOptions, emailType) => {
  lastEmailError = null;

  const transporter = createTransporter();
  if (!transporter) {
    lastEmailError = "BREVO_CREDENTIALS_MISSING";
    console.error(
      `Error sending ${emailType} email: Brevo credentials not configured`,
    );
    return false;
  }

  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(`${emailType} email timed out after ${EMAIL_TIMEOUT_MS}ms`),
        );
      }, EMAIL_TIMEOUT_MS);
    });

    await Promise.race([transporter.sendMail(mailOptions), timeoutPromise]);
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    lastEmailError = (error && error.message) || "UNKNOWN_EMAIL_ERROR";
    console.error(`Error sending ${emailType} email:`, lastEmailError);
    return false;
  }
};

const getFromAddress = () => {
  return (
    process.env.EMAIL_FROM ||
    process.env.BREVO_SMTP_USER ||
    process.env.EMAIL_USER ||
    "noreply@examstream.com"
  ).trim();
};

const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    process.env.PUBLIC_FRONTEND_URL ||
    "https://exam-stream-controlling-overall-exa.vercel.app"
  );
};

// Send signup confirmation email
const sendSignupConfirmation = async (userEmail, userName, userRole) => {
  const mailOptions = {
    from: getFromAddress(),
    to: userEmail,
    subject: "ExamStream - Account Registration Confirmation",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Welcome to ExamStream, ${userName}!</h2>
          <p>Thank you for registering as a <strong>${userRole}</strong> on ExamStream.</p>
          <p>Your account has been created and is <strong>pending admin approval</strong>.</p>
          <p>You will receive another email once your account is approved. This usually takes 24-48 hours.</p>
          <p>If you have any questions, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© 2026 ExamStream. All rights reserved.</p>
        </div>
      `,
  };

  const sent = await sendMailWithTimeout(mailOptions, "signup confirmation");
  if (sent) {
    console.log(`Signup confirmation sent to ${userEmail}`);
  }
  return sent;
};

// Send approval email
const sendApprovalEmail = async (userEmail, userName, userRole) => {
  const mailOptions = {
    from: getFromAddress(),
    to: userEmail,
    subject: "ExamStream - Your Account Has Been Approved!",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Great News, ${userName}!</h2>
          <p>Your ExamStream account has been <strong style="color: #4caf50;">approved</strong> by the admin!</p>
          <p>You can now log in to your account as a <strong>${userRole}</strong>.</p>
          <p>
            <a href="${getFrontendUrl()}" style="
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            ">Go to ExamStream</a>
          </p>
          <p>If you have any issues logging in, please contact support.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© 2026 ExamStream. All rights reserved.</p>
        </div>
      `,
  };

  const sent = await sendMailWithTimeout(mailOptions, "approval");
  if (sent) {
    console.log(`Approval email sent to ${userEmail}`);
  }
  return sent;
};

// Send rejection email
const sendRejectionEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: getFromAddress(),
    to: userEmail,
    subject: "ExamStream - Account Registration Status",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">ExamStream Account Update</h2>
          <p>Hello ${userName},</p>
          <p>Unfortunately, your ExamStream account registration could not be approved at this time.</p>
          <p>If you have any questions or believe this is an error, please contact our support team.</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            We appreciate your interest in ExamStream!
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© 2026 ExamStream. All rights reserved.</p>
        </div>
      `,
  };

  const sent = await sendMailWithTimeout(mailOptions, "rejection");
  if (sent) {
    console.log(`Rejection email sent to ${userEmail}`);
  }
  return sent;
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  const mailOptions = {
    from: getFromAddress(),
    to: userEmail,
    subject: "ExamStream - Password Reset Request",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset the password for your ExamStream account.</p>
          <p style="color: #d9534f; font-weight: bold;">This link expires in 10 minutes.</p>
          <p>
            <a href="${resetLink}" style="
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            ">Reset Your Password</a>
          </p>
          <p style="color: #666; font-size: 13px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
          <p style="color: #666; font-size: 13px;">
            If you're having trouble clicking the button, copy and paste this link in your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© 2026 ExamStream. All rights reserved.</p>
        </div>
      `,
  };

  const sent = await sendMailWithTimeout(mailOptions, "password reset");
  if (sent) {
    console.log(`Password reset email sent to ${userEmail}`);
  }
  return sent;
};

module.exports = {
  sendSignupConfirmation,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetEmail,
  getLastEmailError,
};
