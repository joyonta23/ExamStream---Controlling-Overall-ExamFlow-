const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send signup confirmation email
const sendSignupConfirmation = async (userEmail, userName, userRole) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
  } catch (error) {
    console.error("Error sending signup confirmation email:", error);
  }
};

// Send approval email
const sendApprovalEmail = async (userEmail, userName, userRole) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: "ExamStream - Your Account Has Been Approved!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Great News, ${userName}!</h2>
          <p>Your ExamStream account has been <strong style="color: #4caf50;">approved</strong> by the admin!</p>
          <p>You can now log in to your account as a <strong>${userRole}</strong>.</p>
          <p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:3001"}" style="
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
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};

// Send rejection email
const sendRejectionEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};

module.exports = {
  sendSignupConfirmation,
  sendApprovalEmail,
  sendRejectionEmail,
};
