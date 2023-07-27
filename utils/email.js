const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        service: 'gmail',
        // host: 'smtp.gmail.com',
        // port: 587,
        // secure: true,
        // requireTLS: true,
        auth: {
            // user: process.env.EMAIL_USER,
            // pass: process.env.EMAIL_PASS
            user: 'karticksadhu0@gmail.com',
            pass: 'ecuqynnpjplgulgk'
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Kartick Sadhu <hello@kartick.in>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions)
}
module.exports = sendEmail;