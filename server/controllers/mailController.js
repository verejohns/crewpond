const Mailgun = require('mailgun-js');
const handlebars = require('handlebars');
const fs = require('fs');
const models = require('../models');
const { paths, constant } = require('../../utils');

const mailgun = new Mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

const readHTMLFile = function (path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

module.exports = {
    send_confirmation_mail: function (receiver, token) {
        // send email confirmation mail
        readHTMLFile(__dirname + '/../templates/auth/confirmation.html', function (err, html) {
            const template = handlebars.compile(html);
            const htmlToSend = template({
                confirmation_url: `${process.env.PROTOCOL}://${process.env.DOMAIN}${paths.client.APP_ACCOUNT_CONFIRM}?token=${token}`
            });

            let mailOptions = {
                'from': process.env.MAINGUN_FROM_EMAIL,
                'to': receiver,
                'subject': 'Crew Pond - Email Confirmation Instructions',
                'html': htmlToSend
            };

            return mailgun.messages().send(mailOptions, (error) => {
                return !error;
            });
        });
    },

    send_verification_code: function (receiver, code) {
        // send email confirmation mail
        readHTMLFile(__dirname + '/../templates/auth/verification_code.html', function (err, html) {
            const template = handlebars.compile(html);
            const htmlToSend = template({
                verification_code: code
            });

            let mailOptions = {
                'from': process.env.MAINGUN_FROM_EMAIL,
                'to': receiver,
                'subject': 'Crew Pond - Apple Signin Confirmation',
                'html': htmlToSend
            };

            return mailgun.messages().send(mailOptions, (error) => {
                return !error;
            });
        });
    },

    send_reset_mail: function (receiver, token) {
        // send password reset confirmation mail
        readHTMLFile(__dirname + '/../templates/auth/reset_password.html', function (err, html) {
            const template = handlebars.compile(html);
            const htmlToSend = template({
                reset_url: `${process.env.PROTOCOL}://${process.env.DOMAIN}${paths.client.APP_RESET_PASSWORD}?token=${token}`,
                receiver: receiver
            });

            return mailgun.messages().send({
                'from': process.env.MAINGUN_FROM_EMAIL,
                'to': receiver,
                'subject': 'Crew Pond - Password Reset Instructions',
                'html': htmlToSend
            }, (error) => {
                if (error) {
                    console.log("send_reset_mail Error: ", error);
                    return false;
                }
                return true;
            });
        })
    },


    send_welcome_mail: function (receiver) {
        // send user registration welcome email
        readHTMLFile(__dirname + '/../templates/auth/welcome.html', function (err, html) {
            const template = handlebars.compile(html);
            const htmlToSend = template({
                mail_content: '<p style="text-align: justify">Thank you for joining Crew Pond. You can find detailed information on our FAQ page (<a href="http://crewpond.com/faq" style="text-decoration: none;color: #0000ff;">here</a>) but these tips will quickly get you started:</p>'
            });

            return mailgun.messages().send({
                'from': process.env.MAINGUN_FROM_EMAIL,
                'to': receiver,
                'subject': 'Welcome to CrewPond',
                'html': htmlToSend
            }, (error, info) => {
                if (error) {
                    console.log("send_welcome_mail Error: ", error);
                    return false;
                }

                return true;
            });
        })
    },

    sendEmail: function (req, res) {
        const { all, users, subject, content } = req.body;
        let user_ids = [];
        for (let i = 0; i < users.length; i ++) {
            user_ids.push(users[i].id);
        }

        readHTMLFile(__dirname + '/../templates/auth/welcome.html', function (err, html) {
            const template = handlebars.compile(html);
            const htmlToSend = template({
                mail_content: `<p style="text-align: justify">${content}</p>`
            });

            if (all) {
                return models['users'].findAll({
                    attributes: [ "email" ],
                    where: {
                        id: {
                            [Op.notIn]: user_ids
                        }
                    }
                }).then((emails) => {
                    if (emails.length > 0) {
                        for (let i = 0; i < emails.length; i ++) {
                            mailgun.messages().send({
                                'from': process.env.MAINGUN_FROM_EMAIL,
                                'to': emails[i].email,
                                'subject': subject,
                                'html': htmlToSend
                            }).then(() => {
                                // return res.status(200).json({result: "success", message: "Sent email to users successfully"}).end();
                            }).catch((error) => {
                                console.log(error)
                                return res.status(400).json({result: "error", message: "Failed to send email"}).end();
                            });
                        }

                        return res.status(200).json({result: "success", message: "Sent email to users successfully"}).end();
                    }else
                        return res.status(400).json({result: "error", message: "User list is empty"}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", message: "Internal Server Error"}));
            } else {
                return models['users'].findAll({
                    attributes: [ "email" ],
                    where: {
                        id: user_ids
                    }
                }).then(emails => {
                    if (emails.length > 0) {
                        for (let i = 0; i < emails.length; i ++) {
                            mailgun.messages().send({
                                'from': process.env.MAINGUN_FROM_EMAIL,
                                'to': emails[i].email,
                                'subject': subject,
                                'html': htmlToSend
                            }).then(() => {
                                // return res.status(200).json({result: "success", message: "Sent email to users successfully"}).end();
                            }).catch((error) => {
                                console.log(error)
                                return res.status(400).json({result: "error", message: "Failed to send email"}).end();
                            });
                        }

                        return res.status(200).json({result: "success", message: "Sent email to users successfully"}).end();
                    }else
                        return res.status(400).json({result: "error", message: "User list is empty"}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", message: "Internal Server Error"}));
            }
        });
    }
};
