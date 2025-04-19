const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // .env'de tanımlanacak
    pass: process.env.EMAIL_PASS, // .env'de tanımlanacak
  },
});

const sendResetPasswordEmail = async (to, token) => {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`; // Bu link frontend ile entegre olacak
  const mailOptions = {
    from: `"TalentHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Şifre Sıfırlama Talebi",
    html: `
      <h3>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</h3>
      <a href="${resetLink}">${resetLink}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };
