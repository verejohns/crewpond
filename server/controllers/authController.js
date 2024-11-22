const moment = require('moment');
const { omit } = require('lodash');
const Sequelize = require('sequelize');
const axios = require('axios');
const appleSignin = require("apple-signin");
const { get } = require('lodash');

const models = require('../models');
const { validation, hash, tokens, paths, functions, time, recaptcha } = require('../../utils');
const paymentController = require("./paymentController");
const mailController = require("./mailController");
const viewController = require("./viewController");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function checkWebPortal(user) {
    try {
        const web_user = await models['web_users'].findOne({
            where: {
                user_id: user.id
            }
        });

        if(web_user){ // this user registered for web portal already
            //check subscription
            const subscriptions = await models['subscriptions'].findAll({
                raw: true,
                where: {
                    user_id: user.id
                }
            });

            //check if user previously had a web portal subscription that was cancelled
            const stUserId = await models['st_customers'].findOne({
                where: {
                    user_id: user.id
                }
            });

            let stripeSubscriptionsList = null;

            if (stUserId.dataValues.stripe_id) {
                stripeSubscriptionsList = await stripe.subscriptions.list(
                {
                    limit: 10,
                    customer: stUserId.dataValues.stripe_id,
                    status: 'all'
                });

                stripeSubscriptionsList = stripeSubscriptionsList.data;
            }

            let alreadyUsedFreeTrial = false;

            for (let i = 0; i < stripeSubscriptionsList.length; i++) {
                if (stripeSubscriptionsList[i].plan.id === process.env.PRODUCT_WEB_PORTAL && stripeSubscriptionsList[i].status === 'canceled') {
                    alreadyUsedFreeTrial = true;
                }
            }

            for (let i = 0; i < subscriptions.length; i += 1) {
                const subscription_id = subscriptions[i].subscription_id;
                const subscription = await stripe.subscriptions.retrieve(subscription_id);
                if (subscription) {
                    if((subscription.status === 'active' || subscription.status === 'trialing') &&  subscription.plan.id === process.env.PRODUCT_WEB_PORTAL){
                        return {status: 1, subscription};
                    } else if((subscription.status !== 'active' && subscription.status !== 'trialing') &&  subscription.plan.id === process.env.PRODUCT_WEB_PORTAL) {
                        //subscription is not active for web portal product
                        return {status: -2, subscription};
                    }
                } else if (alreadyUsedFreeTrial) {
                    return {status: -2, subscription: null};
                }
            }

            //there is no subscription for web portal.
            return {status: -3, subscription: null};
        }else {//if the user has no permission for web portal, need to check if this sub user
            if(user.sub_accounts === 1) {
                const sub_user = await models['sub_accounts'].findOne({
                    where: {
                        sub_user_id: user.id
                    }
                })
                if(sub_user)
                    return {status: 1, subscription: null};
            }
        }

        // check if user had previously cancelled a subscription with a free trial
        const stUserId = await models['st_customers'].findOne({
            where: {
                user_id: user.id
            }
        });

        let stripeSubscriptionsList = null;

        if (stUserId.dataValues.stripe_id) {
            stripeSubscriptionsList = await stripe.subscriptions.list(
            {
                limit: 10,
                customer: stUserId.dataValues.stripe_id,
                status: 'all'
            });
            stripeSubscriptionsList = stripeSubscriptionsList.data;
        }

        let alreadyUsedFreeTrial = false;

        for (let i = 0; i < stripeSubscriptionsList.length; i++) {
            if (stripeSubscriptionsList[i].plan.id === process.env.PRODUCT_WEB_PORTAL && stripeSubscriptionsList[i].status === 'canceled') {
                alreadyUsedFreeTrial = true;
            }
        }

        if (alreadyUsedFreeTrial) {
            return {status: -2, subscription: null};
        }

        //first web portal
        return {status: -1, subscription: null};
    }catch(err) {
        console.log(err);
        return {status: 0, subscription: null, error: err};
    }
}

async function setSession(req, res, row, errorCodeNo) {
    const device_token = req.headers['x-user-key'];
    let resp = {};
    const session_token = hash.authentication(tokens.generate(), row.id);

    if(device_token){
        await models['user_tokens'].destroy({
            where: {
                device_token
            }
        });
    }else if(!req.isMobileRequest) {
        // await models['user_tokens'].destroy({
        //     where: {
        //         user_id: row.id,
        //         platform: 'web'
        //     }
        // });
    }

    let data = {
        user_id: row.id,
        session_token,
        device_token,
        generatedAt: moment()
    }

    if(!req.isMobileRequest) {
        data.platform = "web";
    } else data.platform = req.body.platform;

    await models['user_tokens'].create(data);
    resp.token = session_token;

    const subscription = await paymentController.getFreeTrial(row.id);

    return models['users'].findByPk(req.session.user.id, {
        attributes: ["id", "avatar", "first_name", "last_name", "email", "availability", "company", "jobber_type", "birthday", "experience_from", "experience_years", "experience_months", "is_key_hirer", "is_key_jobber", "description", "categories", "address", "place_name", "latitude", "longitude", "createdAt", "sub_accounts",
            [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'score'],
            [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']]
    }).then(user => {
        if (user.dataValues.address || user.dataValues.place_name || user.dataValues.latitude || user.dataValues.longitude) {
            user.dataValues.location = {
                address: user.dataValues['address'],
                place_name: user.dataValues['place_name'],
                latitude: user.dataValues['latitude'],
                longitude: user.dataValues['longitude'],
            };
        }
        user.dataValues.review = {
            score: user.dataValues['score'],
            number_of_completed: user.dataValues['number_of_completed'],
            number_of_feedback: user.dataValues['number_of_feedback'],
            number_of_success: user.dataValues['number_of_success'],
        };
        user.dataValues.avatar = functions.convertLocalToPublic(user.dataValues.avatar);
        user.dataValues = omit(user.dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_completed', 'number_of_feedback', 'score']);

        let returnVal = {result: "success", user, ...resp};

        if(subscription && subscription.status === "trialing") {
            console.log(moment(subscription.trial_end * 1000).toDate())
            returnVal.trialPeirod = time.inDates(moment().toDate(), moment(subscription.trial_end * 1000).toDate());
        }
        req.session.user.session_token = session_token;
        
        if (errorCodeNo === 113) {
            return res.status(500).json({result: "error", errorCode: 113, user, ...resp});
        } else if (errorCodeNo === 114) {
            return res.status(500).json({result: "error", errorCode: 114, user, ...resp});
        } else if (errorCodeNo === 115) {
            return res.status(500).json({result: "error", errorCode: 115, user, ...resp});
        }

        return res.status(200).json(returnVal);
    }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
}

async function checkPrivateEmail (email, identity_token) {
    const isPrivateEmail = email.includes('@privaterelay.appleid.com')?true:false;
    if(isPrivateEmail) {// this is private email
        try {
            const apple_email = await models['apple_emails'].findOne({raw: true, where: {email}});
            if(apple_email) {
                if(apple_email.user_id !== null && apple_email.confirmation_code !== null && apple_email.confirmed_at !== null) {//private email
                    const user = await models['users'].findByPk(apple_email.user_id);
                    return user.email;
                }else {
                    await models['apple_emails'].update({identity_token}, {where: {email}});
                    return null;
                }
            }else {
                await models['apple_emails'].create({email, identity_token});
                return null;
            }
        }catch(err) {
            console.log(err);
            return null;
        }
    }else{
        return email;
    }
}

module.exports = {
    adminLogin: async function (req, res) {
        const { email, password } = req.body;
        const recaptchaData = {
            response: get(req.body, 'g-recaptcha-response'),
            secret: process.env.RECAPTCHA_SERVER_KEY,
        };
        try {
            await recaptcha.verifyRecaptcha(recaptchaData);
        }catch(err) {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 27}).end();
        }
        if (!validation.isValidEmail(email))
            return res.status(500).json({result: "error", errorCode: 10});
        if (validation.isEmpty(password))
            return res.status(500).json({result: "error", errorCode: 11});

        return models['admin'].findOne({
            where: {
                email: email
            }
        }).then(row => {
            if(!row)
                return res.status(500).json({result: "error", errorCode: 3});
            if(row.password !== hash.password(row.salt, password))
                return res.status(500).json({result: "error", errorCode: 11});

            req.session.admin = row;
            return res.status(200).json({result: "success", admin: row});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    adminLogout: function (req, res) {
        req.session.admin = null;
        return res.redirect(paths.client.ADMIN_LOGOUT);
    },

    login: async function (req, res) {
        const { email, password, access_token, identity_token, first_name, last_name } = req.body;
        let dataFromSocial, isSocial = false;
        if(!req.isMobileRequest) {
            const recaptchaData = {
                response: get(req.body, 'g-recaptcha-response'),
                secret: process.env.RECAPTCHA_SERVER_KEY,
            };

            try {
                await recaptcha.verifyRecaptcha(recaptchaData);
            }catch(err) {
                console.log(err);
                return res.status(500).json({result: "error", errorCode: 27}).end();
            }

        }

        if (access_token) {
            try {
                const { data } = await axios.get(`https://graph.facebook.com/me?fields=email,first_name,last_name&access_token=${access_token}`);

                dataFromSocial =  {
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name
                };
                isSocial = true;
            } catch (error) {
                console.error(error);
                return res.status(500).json({result: "error", errorCode: 12}).end()
            }
        } else if (identity_token) {
            try {
                const result = await appleSignin.verifyIdToken(identity_token, process.env.APP_BUNDLE_ID);
                const email = await checkPrivateEmail(result.email, identity_token);
                // return res.status(500).json({result: "error", errorCode: 19}).end();
                if(email) {
                    dataFromSocial =  {
                        email: result.email,
                        first_name, last_name
                    };
                    isSocial = true;
                }else {
                    return res.status(500).json({result: "error", errorCode: 19}).end();
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({result: "error", errorCode: 12}).end()
            }
        } else if (!validation.isValidEmail(email)) {
            return res.status(500).json({result: "error", errorCode: 10});
        } else if (validation.isEmpty(password)) {
            return res.status(500).json({result: "error", errorCode: 11});
        }

        return models['users'].findOne({
            raw: true,
            where: {
                email: email || dataFromSocial.email
            }
        }).then(async (row) => {
            if (isSocial) {
                if (!row) {
                    return models['users'].create({
                        ...dataFromSocial,
                        confirmed_at: moment(),
                        login_count: 1,
                        last_login_time: moment()
                    }).then(async(user) => {
                        if(!req.isMobileRequest){
                            try{
                                const result = await checkWebPortal(user);
                                if(result.status === 0) {
                                    return res.status(500).json({result: result.error + "error 1", errorCode: 0});
                                }else if(result.status === -1) {
                                    //first web portal
                                    paymentController.createCustomer(user.id, user.email, `${user.first_name}, ${user.last_name}`);
                                    req.session.user = user;
                                    return setSession(req, res, user, true);
                                    // return res.status(500).json({result: "error", errorCode: 113});
                                }else if(result.status === -2) {
                                    //subscription is not active for web portal product
                                    return res.status(500).json({result: "error", errorCode: 114, subscription: result.subscription});
                                }else if(result.status === -3) {
                                    //there is no subscription for web portal.
                                    return res.status(500).json({result: "error", errorCode: 115});
                                }
                            }catch(err) {
                                return res.status(500).json({result: err + "error 2", errorCode: 0});
                            }
                        }
                        paymentController.createCustomer(user.id, user.email, `${user.first_name}, ${user.last_name}`);
                        req.session.user = user;
                        return setSession(req, res, user);
                    }).catch((error) => console.error(error) || res.status(500).json({result: error + "error 3", errorCode: 0}).end());
                }
            } else {
                if (!row) {
                    return res.status(500).json({result: "error", errorCode: 3});
                } else if (row.password !== hash.password(row.salt, password)) {
                    return res.status(500).json({result: "error", errorCode: 11});
                }
            }

            if (!row.confirmed_at) {
                return res.status(500).json({result: "error", errorCode: 20});
            } else if (row.is_closed) {
                return res.status(500).json({result: "error", errorCode: 21});
            } else if (row.is_suspended) {
                return res.status(500).json({result: "error", errorCode: 22});
            } else if (row.deleted_at) {
                return res.status(500).json({result: "error", errorCode: 23});
            }
            paymentController.createCustomer(row.id, row.email, `${row.first_name}, ${row.last_name}`);

            if(!req.isMobileRequest){
                try {
                    const result = await checkWebPortal(row);
                    console.log(result);
                    if(result.status === 0) {
                        return res.status(500).json({result: result.error + " error 4", errorCode: 0});
                    }else if(result.status === -1) {
                        //first web portal
                        req.session.user = row;
                        return models['users'].update({
                            login_count: row.login_count + 1,
                            last_login_time: moment()
                        }, {
                            where: {
                                id: row.id
                            }
                        }).then(() => {
                            return setSession(req, res, row, 113);
                        }).catch((error) => console.error(error) || res.status(500).json({result: error + "error 5", errorCode: 0}).end());

                        // return res.status(500).json({result: "error", errorCode: 113, userDetails: row});
                    }else if(result.status === -2) {
                        //subscription is not active for web portal product
                        req.session.user = row;
                        return models['users'].update({
                            login_count: row.login_count + 1,
                            last_login_time: moment()
                        }, {
                            where: {
                                id: row.id
                            }
                        }).then(() => {
                            return setSession(req, res, row, 114);
                        }).catch((error) => console.error(error) || res.status(500).json({result: error + "error error 6", errorCode: 0}).end());
                        
                        //return res.status(500).json({result: "error", errorCode: 114, subscription: result.subscription});
                    }else if(result.status === -3) {
                        //there is no subscription for web portal.
                        req.session.user = row;
                        return models['users'].update({
                            login_count: row.login_count + 1,
                            last_login_time: moment()
                        }, {
                            where: {
                                id: row.id
                            }
                        }).then(() => {
                            return setSession(req, res, row, 115);
                        }).catch((error) => console.error(error) || res.status(500).json({result: error + "error 7", errorCode: 0}).end());
                        //return res.status(500).json({result: "error", errorCode: 115});
                    }
                }catch(err) {
                    return res.status(500).json({result: err + "error 8", errorCode: 0});
                }
            }
            

            req.session.user = row;
            return models['users'].update({
                login_count: row.login_count + 1,
                last_login_time: moment()
            }, {
                where: {
                    id: row.id
                }
            }).then(() => {
                return setSession(req, res, row);
            }).catch((error) => console.error(error) || res.status(500).json({result: error + "error 9", errorCode: 0}).end());
        }).catch((error) => console.error(error) || res.status(500).json({result: error + "error 10", errorCode: 0}).end());
    },

    switchAccount: function (req, res) {
        const { switch_id } = req.body;

        if(req.session.user.sub_accounts === 0)
            return res.status(500).json({result: "error", errorCode: 0}).end();

        if(!switch_id) {
            req.session.main_user = null;
            return res.status(200).json({result: "success"}).end();
        }
        return models['sub_accounts'].findOne({
            where: {
                main_user_id: switch_id,
                sub_user_id: req.session.user.id
            }
        }).then((sub_user) => {
            if(!sub_user)
                return res.status(500).json({result: "error", errorCode: 323}).end();
            return models['users'].findOne({
                raw: true,
                where: {
                    id: switch_id
                }
            }).then((row) => {
                req.session.main_user = row;
                return res.status(200).json({result: "success"}).end();
            }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    addUser: async function (req, res) {
        const { first_name, last_name, email, password, address, place_name, latitude, longitude, jobber_type, linkedin } = req.body;

        let categories = "";

        if (req.body.categories && req.body.categories !== "null") {
            if (typeof req.body.categories === 'string') categories = JSON.parse(req.body.categories);
            else categories = req.body.categories;
        }

        if(!req.isMobileRequest) {
            const recaptchaData = {
                response: get(req.body, 'g-recaptcha-response'),
                secret: process.env.RECAPTCHA_SERVER_KEY,
            };

            try {
                await recaptcha.verifyRecaptcha(recaptchaData);
            }catch(err) {
                console.log(err);
                return res.status(500).json({result: "error", errorCode: 27}).end();
            }
        }

        if (!validation.isValidEmail(email))
            return res.status(500).json({result: "error", errorCode: 10});
        if (validation.isEmpty(password))
            return res.status(500).json({result: "error", errorCode: 11});
        if (validation.isEmpty(first_name))
            return res.status(500).json({result: "error", errorCode: 12});
        if (validation.isEmpty(last_name))
            return res.status(500).json({result: "error", errorCode: 13});

        return models['users'].findOne({
            where: { email }
        }).then((row) => {
            const salt = tokens.generate();
            const data = {
                first_name,
                last_name,
                email,
                address,
                place_name,
                latitude,
                longitude,
                categories,
                jobber_type,
                salt: salt,
                password: hash.password(salt, password),
                availability: true,
                confirmation_token: hash.authentication(salt, email),
                confirmation_sent_at: moment(),
                deleted_at: null,
                linkedin: linkedin ? linkedin : ''
            };

            if (row) {
                if (!row.dataValues.deleted_at)
                    return res.status(500).json({result: "error", errorCode: 14});

                return models['users'].update(data, {
                    where: { email }
                }).then(() => {
                    mailController.send_confirmation_mail(data.email, data.confirmation_token);
                    return res.status(200).json({result: "success"});
                }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            } else {
                return models['users'].create(data).then((new_user) => {
                    mailController.send_confirmation_mail(data.email, data.confirmation_token);
                    paymentController.createCustomer(new_user.id, email, first_name + " " +last_name);
                    return res.status(200).json({result: "success"});
                }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    confirmAccount: function (req, res) {
        const { token } = req.query;

        if(validation.isEmpty(token))
            return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=10');

        return models['users'].findOne({
            where: {
                confirmation_token: token
            }
        }).then(row => {
            if(!row)
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=3');

            row.update({
                login_count: row.login_count + 1,
                last_login_time: moment(),
                confirmation_token: null,
                confirmation_sent_at: null,
                confirmed_at: moment()
            }).then(() => {
                // req.session.user = row;
                mailController.send_welcome_mail(row.email);
                return res.redirect(/*paths.client.APP_BASE + */'/?successCode=0');
            }).catch(() => res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=0'));
        }).catch(() => res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=0'));
    },

    forgotPassword: function(req, res) {
        const { email } = req.body;
        console.log(email);
        if (!validation.isValidEmail(email))
            return res.status(500).json({result: "error", errorCode: 10});

        return models['users'].findOne({
            where: { email }
        }).then(row => {
            if(!row) {
                return res.status(500).json({result: "error", errorCode: 3});
            } else if (!row.dataValues.confirmed_at) {
                return res.status(500).json({result: "error", errorCode: 20});
            } else if (row.dataValues.is_closed) {
                return res.status(500).json({result: "error", errorCode: 21});
            } else if (row.dataValues.is_suspended) {
                return res.status(500).json({result: "error", errorCode: 22});
            } else if (row.dataValues.deleted_at) {
                return res.status(500).json({result: "error", errorCode: 23});
            }

            const token = hash.authentication(tokens.generate(), row.dataValues.id);
            row.update({
                password_reset_token: token,
                password_reset_sent_at: moment(),
                updatedAt: moment(),
            }).then(() => {
                mailController.send_reset_mail(email, token);
                return res.status(200).json({result: "success"});
            }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    gotoReset:  function (req, res) {
        const { token } = req.query;

        if (!token)
            return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=10');

        return models['users'].findOne({
            where: {
                password_reset_token: token
            }
        }).then(row => {
            if(!row) {
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=3');
            } else if (moment().diff(moment(row.password_reset_sent_at), "minutes") > 10) {
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=4');
            } else if (!row.confirmed_at) {
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=20');
            } else if (row.is_closed) {
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=21');
            } else if (row.is_suspended) {
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=22');
            } else if (row.deleted_at) {
                return res.redirect(/*paths.client.APP_LOGIN + */'/?errorCode=23');
            }

            return viewController.renderApp(req, res);
        }).catch(() => res.redirect(paths.client.APP_LOGIN + '/?errorCode=0'));
    },

    resetPassword: async function (req, res) {
        const { token, password } = req.body;

        if (validation.isEmpty(token))
            return res.status(500).json({result: "error", errorCode: 10});
        if (validation.isEmpty(password))
            return res.status(500).json({result: "error", errorCode: 11});

        if (!req.isMobileRequest) {
            const recaptchaData = {
                response: get(req.body, 'g-recaptcha-response'),
                secret: process.env.RECAPTCHA_SERVER_KEY,
            };

            try {
                await recaptcha.verifyRecaptcha(recaptchaData);
            } catch(err) {
                console.log(err);
                return res.status(500).json({ result: "error", errorCode: 24 }).end();
            }
        }

        models['users'].findOne({
            where: {
                password_reset_token: token
            }
        }).then(row => {
            if (!row) {
                return res.status(500).json({result: "error", errorCode: 3});
            } else if (moment().diff(moment(row.password_reset_sent_at), "minutes") > 10) {
                return res.status(500).json({result: "error", errorCode: 4});
            } else if (!row.confirmed_at) {
                return res.status(500).json({result: "error", errorCode: 20});
            } else if (row.is_closed) {
                return res.status(500).json({result: "error", errorCode: 21});
            } else if (row.is_suspended) {
                return res.status(500).json({result: "error", errorCode: 22});
            } else if (row.deleted_at) {
                return res.status(500).json({result: "error", errorCode: 23});
            }

            const salt = tokens.generate();
            row.update({
                salt,
                password: hash.password(salt, password),
                password_reset_token: null,
                password_reset_sent_at: null
            }).then(() => {
                // logout from all logged in devices
                models['user_tokens'].destroy({
                    where: {
                        user_id: row.id
                    }
                });

                return res.status(200).json({result: "success"});
            }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    clearFcmToken: function (req, res) {
        const { platform, token } = req.body;

        return models['user_tokens'].destroy({
            where: {
                platform: platform,
                session_token: token,
                user_id: req.session.user.id
            }
        }).then(() => {
            return res.status(200).json({result: "success"});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    setFcmToken: function (req, res) {
        const { platform, token } = req.body;
        const session_token = req.headers['authentication'];
        const device_token = req.headers['x-user-key'];
        if(platform === 'ios' || platform === 'android'){
            if (!session_token || !device_token) {
                return res.status(500).json({result: "error 5", errorCode: 2});
            } else if (platform !== 'android' && platform !== 'ios') {
                return res.status(500).json({result: "error", errorCode: 10});
            }
        }
        if (!token) {
            return res.status(500).json({result: "error", errorCode: 11});
        }

        models['user_tokens'].destroy({
            where: {
                device_token
            }
        }).then(async (user_token) => {
        }).catch(err => console.log(err));

        return models['user_tokens'].create({
            user_id: req.session.user.id,
            device_token, session_token, token, platform,
            generatedAt: moment()
        }).then(async (user_token) => {
            return res.status(200).json({result: "success"});
        }).catch((err)=> {
            console.log(err);
            res.status(500).json({result: err + " error 21", errorCode: 0}).end()});
    },

    resendVerifyEmail: function (req, res) {
        const { email } = req.body;
        return models['users'].findOne({
            where: {
                email,
                deleted_at: null,
                is_closed: false,
                is_suspended: false,
                confirmed_at: null
            }
        }).then((row) => {
            if(!row)
                return res.status(500).json({result: "error", errorCode: 3});

            const salt = tokens.generate();
            const confirmation_token = hash.authentication(salt, email);

            return row.update({
                confirmation_token,
                confirmation_sent_at: moment()
            }).then(() => {
                mailController.send_confirmation_mail(email, confirmation_token);
                return res.status(200).json({result: "success"});
            }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    logout: async function (req, res) {
        const user = req.session.user;
        
        req.session.main_user = null;
        req.session.user = null;
        
        if (!req.isMobileRequest) {
            await models['user_tokens'].destroy({
                where: {
                    user_id: user.id,
                    platform: 'web',
                    session_token: user.session_token
                }
            });
        
            return res.redirect(paths.client.APP_LOGIN);
        }

        const session_token = req.headers['authentication'];
        const device_token = req.headers['x-user-key'];

        if (!session_token || !device_token) {
            return res.status(500).json({result: "error 4", errorCode: 2});
        }

        return models['user_tokens'].destroy({
            where: {
                device_token: device_token,
                session_token: session_token
            }
        }).then(() => {
            return res.status(200).json({result: "success"});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    //when login via apple id, if the email is privacy email, send verification code to privacy email
    sendVerificationCode: function (req, res) {
        const { email, identity_token } = req.body;
        //check user is exist and apple email is exist
        return Promise.all([
            models['users'].findOne({
                raw: true,
                where: {
                    email
                }
            }),
            models['apple_emails'].findOne({
                where: {
                    identity_token
                }
            })
        ]) .then(async([user, apple_email]) => {
            if(!apple_email) {//identity token is invalid
                return res.status(500).json({result: "error", errorCode: 1}).end();
            }

            if(!user) {//this is new user
                dataFromSocial =  {
                    email,
                    first_name: "", last_name: ""
                };
                user = await models['users'].create({
                    ...dataFromSocial,
                });
                paymentController.createCustomer(user.id, user.email, `${user.first_name}, ${user.last_name}`);
            }

            const salt = tokens.generate();
            const verification_code = hash.generateOTP();
            const confirmation_code = hash.authentication(salt, verification_code);
            return apple_email.update({
                user_id: user.id,
                confirmation_code,
                salt
            }).then(() => {
                mailController.send_verification_code(email, verification_code);
                return res.status(200).json({result: "success"}).end();
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            })
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        })
    },

    //check verifciation code from privacy email
    checkVerificationCode: function (req, res) {
        const { verification_code, identity_token } = req.body;

        return models['apple_emails'].findOne({
            where: {
                identity_token
            }
        }).then((apple_email) => {
            if(apple_email) {
                const salt = apple_email.salt;
                const confirmation_code = hash.authentication(salt, verification_code);
                if(confirmation_code !== apple_email.confirmation_code)
                    return res.status(500).json({result: "error", errorCode: 1}).end();
                return Promise.all([
                    apple_email.update({
                        confirmed_at: new Date()
                    }),
                    models['users'].findByPk(apple_email.user_id)
                ]).then(async ([updated, user]) => {
                    if(!user.confirmed_at) {
                        await user.update({confirmed_at: new Date()});
                    }
                    req.session.user = user;
                    return setSession(req, res, user);
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({result: "error", errorCode: 0}).end();
                });
            }
            return res.status(500).json({result: "error", erroroCode: 1}).end();
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        });
    },

    validateSessionToken: function (req, res, next) {
        const session_token = req.headers['authentication'];
        const device_token = req.headers['x-user-key'];
        if (!session_token) {
            req.session.main_user = null;
            req.session.user = null;
            return this.checkAccessibility(req, res, next);
        }
        return models['user_tokens'].findOne({
            raw: true,
            where: {
                device_token: device_token,
                session_token: session_token
            }
        }).then(row => {
            if (!row) {
                req.session.main_user = null;
                req.session.user = null;
                return this.checkAccessibility(req, res, next);
            } else if (row.deletedAt) {
                return res.status(500).json({result: "error", errorCode: 4});
            }

            const duration = moment.duration(moment().diff(moment(row.generatedAt)));

            if (duration.asMonths() >= 1) {
                return models['user_tokens'].update({
                    deletedAt: moment()
                }, {
                    where: {
                        id: row.id
                    }
                }).then(() => {
                    return res.status(500).json({result: "error", errorCode: 4});
                }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
            }

            return models['user_tokens'].update({
                generatedAt: moment()
            }, {
                where: {
                    id: row.id
                }
            }).then(() => {
                return models['users'].findOne({
                    raw: true,
                    where: {
                        id: row.user_id
                    }
                }).then(user => {
                    req.session.user = user;
                    return this.checkAccessibility(req, res, next);
                }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    checkAccessibility: function (req, res, next) {
                if (req.accessLevel === 1) {
            // requires user or admin login
                        if (req.session.user && req.path.includes('/app') || req.session.admin && req.path.includes('/admin') || (req.session.user || req.session.admin) && req.path.startsWith('/api')) {
                if(!req.isMobileRequest) {//web request. this need to check if user logged into web portal on other browser.
                    if(req.session.user){
                        return models['user_tokens'].findOne({
                            where: {
                                user_id: req.session.user.id,
                                session_token: req.session.user.session_token,
                                platform: 'web'
                            }
                        }).then((user_token) => {
                            if(user_token)
                                return next();
                            else{
                                req.session.main_user = null;
                                req.session.user = null;
                                return res.status(200).json({result: "error", errorCode: 225}).end();
                            }
                        }).catch((err) => {
                            req.session.main_user = null;
                            req.session.user = null;
                            return res.status(200).json({result: "error", errorCode: 225}).end();
                        })
                    }
                }
                return next();
            } else if (req.path.startsWith('/api')) {
                return res.status(500).json({result: "error 1", errorCode: 2});
            } else if (req.path.startsWith('/admin')) {
                return res.redirect(paths.client.ADMIN_LOGIN);
            }

            return res.redirect(paths.client.APP_LOGIN);
        } else if (req.accessLevel === -1) {
            // requires user logout
            if (req.session.user) {
                
                if (req.path === '/api/app/super-user/subscription' || req.path === '/api/app/login' || req.path === '/api/app/register') {
                    return next();
                } else if (req.path.startsWith('/api')) { 
                    return res.status(500).json({result: "error 2", errorCode: 2});
                }

                //return res.redirect(paths.client.APP_BASE);
            }

            return next();
        } else if (req.accessLevel === -2) {
            // requires admin logout
            if (req.session.admin) {
                if (req.path.startsWith('/api') && req.path != '/api/app/login') {
                    return res.status(500).json({result: "error 3", errorCode: 2});
                }

                return res.redirect(paths.client.ADMIN_DASHBOARD);
            }

            return next();
        }else if (req.accessLevel === -3) {
            return next();
        }else
            return next();
    }
};