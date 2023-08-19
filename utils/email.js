const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    // Send mail using personal mail id
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'karticksadhu0@gmail.com',
    //         pass: 'ecuqynnpjplgulgk'
    //     }
    // });

    // Send mail using mailtrap service
    const transporter = nodemailer.createTransport({
        host: process.env.E_H,
        port: processE_P,
        auth: {
            user: process.env.E_U,
            pass: process.env.E_PW
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