const nodeMailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD
    }
  })

  const mailOptions = {
    Port: 993,
    host: "imap.gmail.com",
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  await transporter.sendMail(mailOptions)
}

module.exports.sendMail = sendMail