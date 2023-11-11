const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  pool: true,
  service: process.env.EMAIL_SERVICE,
  port: 2525,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  maxConnections: 1,
});

const sendEmail = async (emailContent, sendTo) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: sendTo,
    html: emailContent.body,
    subject: emailContent.subject,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return { error: true, message: error.message, success: false };

    return { success: true, ...info, error: false };
  });
};

module.exports = sendEmail;
