const pug = require('pug');
// const nodemailer = require('nodemailer');
// const htmlToText = require('html-to-text');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

module.exports = class Email {
    constructor(user, url, emailFrom) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = emailFrom || `Natours Support <${process.env.EMAIL_FROM}>`;
    }

    // Send the actual mail
    send(template, subject) {
        // Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // Send mail
        mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: this.from,
            to: ['bwubca19106@brainwareuniversity.ac.in'],
            subject: subject,
            html: html
        })
            .then(msg => console.log(msg)) // logs response data
            .catch(err => console.log(err));
    }

    sendWelcome() {
        this.send('welcome', 'Welcome to Natours Family!');
    }

    sendPasswordReset() {
        this.send('resetPassword', 'Your password reset token (valid for 10 minutes!');
    }
}

