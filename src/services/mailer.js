const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send_email = async (to, subject, text) => {
  const info = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return await transporter.sendMail(info);
};

module.exports = {
  send_email,
};
