const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getFromAddress = () => {
  const emailUser = process.env.EMAIL_USER;
  if (emailUser) {
    return `ExamStream <${emailUser}>`;
  }
  return process.env.EMAIL_FROM || "noreply@examstream.com";
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
  try {
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

    await transporter.sendMail(mailOptions);
    console.log(`Signup confirmation sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending signup confirmation email:", error);
    return false;
  }
};

// Send approval email
const sendApprovalEmail = async (userEmail, userName, userRole) => {
  try {
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

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending approval email:", error);
    return false;
  }
};

// Send rejection email
const sendRejectionEmail = async (userEmail, userName) => {
  try {
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

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending rejection email:", error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
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

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

module.exports = {
  sendSignupConfirmation,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetEmail,
};
