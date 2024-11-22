const {recaptcha} = require('../../utils');
const models = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { get } = require('lodash');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
   destination: "/home/ubuntu/crew/uploads/",
   filename: function(req, file, cb){
      cb(null,Date.now() + path.extname(file.originalname));
   }
});

const uploadIdentityDocuments = multer({
   storage: storage,
   limits:{fileSize: 1000000},
}).array('identity_documents', 2);

module.exports = {
    createCustomer: function (user_id, email, username) {
        return models['st_customers'].findOne({
            where: {
                user_id
            }
        }).then((exist) => {
            if(!exist) {
                stripe.customers.create({
                    description: 'Customer for ' + email,
                    email: email,
                    name: username
                }).then((customer) => {
                    const st_customer = {
                        user_id: user_id,
                        stripe_id: customer.id
                    }
                    return models['st_customers'].create(st_customer)
                    .then((row) => {
                        return row;
                    }).catch(error => {
                        console.log(error);
                        return null;
                    })
                }).catch(error => {
                    console.log(error);
                    return null;
                })
            }
            return exist;
        }).catch((err) => {
            console.log(err);
            return null;
        })
    },

    updateCustomer: function (req, res) {

    },

    deleteCustomer: function (req, res) {

    },

    createPayment: function (req, res) {
    },

    createKeyCustomer: function (req, res) {
        const stripe_version = req.body.api_version;
        if (!stripe_version) {
          return res.status(500).json({result: "error", errorCode: 1}).end();s
        }
        // This function assumes that some previous middleware has determined the
        // correct customerId for the session and saved it on the request object.
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            const stripe_customer_id = st_customer.dataValues.stripe_id;
            return stripe.ephemeralKeys.create(
                {customer: stripe_customer_id},
                {stripe_version: stripe_version}
              ).then((key) => {
                return res.status(200).json(key).end();
              }).catch((err) => {
                return res.status(500).json({result: "error", errorCode: 0}).end();
              });
        }).catch(err => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    createCard: async function(req, res) {
        const {number, expiry, cvc} = req.body;
        // if(!req.isMobileRequest) {
        //     const recaptchaData = {
        //         response: get(req.body, 'recaptchaToken'),
        //         secret: process.env.RECAPTCHA_SERVER_KEY,
        //     };

        //     try {
        //         await recaptcha.verifyRecaptcha(recaptchaData);
        //     }catch(err) {
        //         console.log(err);
        //         return res.status(500).json({result: "error", errorCode: 27}).end();
        //     }
        // }
        const expDate = expiry.split("/");
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            return stripe.tokens.create(
                {
                  card: {
                    number,
                    exp_month: expDate[0],
                    exp_year: expDate[1],
                    cvc,
                  },
                }
            ).then((token) => {
                const stripe_customer_id = st_customer.dataValues.stripe_id;
                stripe.customers.createSource(
                    stripe_customer_id,
                    { source: token.id}
                ).then((card) => {
                    return res.status(200).json({result: "success", card}).end();
                }).catch((error) => {
                    console.log(error);
                    return res.status(500).json({result: "error", errorCode: 0}).end();
                })
            }).catch((error) => {
                console.log(error);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            })

        }).catch(err => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateCard: async function(req, res) {
        const { number, expiry, cvc } = req.body;
        // if(!req.isMobileRequest) {
        //     const recaptchaData = {
        //         response: get(req.body, 'recaptchaToken'),
        //         secret: process.env.RECAPTCHA_SERVER_KEY,
        //     };

        //     try {
        //         await recaptcha.verifyRecaptcha(recaptchaData);
        //     }catch(err) {
        //         console.log(err);
        //         return res.status(500).json({result: "error", errorCode: 27}).end();
        //     }
        // }
        const { id } = req.params;
        const expDate = expiry.split("/");
        return models['st_customers'].findOne({
            raw: true,
            where: {
                user_id: req.session.user.id
            }
        }).then(async(st_customer) => {
            const stripe_customer_id = st_customer.stripe_id;
            try {
                await stripe.customers.deleteSource(
                    stripe_customer_id,
                    id
                );
            }catch(err) {
                console.log(err);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            }

            return stripe.tokens.create(
                {
                  card: {
                    number,
                    exp_month: expDate[0],
                    exp_year: expDate[1],
                    cvc,
                  },
                }
            ).then((token) => {
                const stripe_customer_id = st_customer.stripe_id;
                stripe.customers.createSource(
                    stripe_customer_id,
                    { source: token.id}
                ).then((card) => {
                    return res.status(200).json({result: "success", card}).end();
                }).catch((error) => {
                    console.log(error);
                    return res.status(500).json({result: "error", errorCode: 0}).end();
                })
            }).catch((error) => {
                console.log(error);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            })
        }).catch(err => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getPaymentsList: function(req, res) {
        if(!req.session.admin)
            return res.status(500).json({result: "error", errorCode: 1}).end();
        const {keyword, offset, limit} = req.query;

        let val_where = {};
        let opt = {};
        if(keyword && keyword.length > 0){
            val_where[Op.or] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user.first_name')), 'ILIKE', '%' + keyword + '%'),
            ];
        }

        if(offset){
            opt.offset = (offset - 1) * limit;
        }

        opt.order = [['updatedAt', 'DESC']];
        opt.limit = limit;
        opt.include = [
            {
                model: models['users'],
                as: 'user'
            },
            {
                model: models['jobs'],
                as: 'job'
            }
        ]
        return Promise.all([
            models['customer_charges'].findAll(opt),
            models['customer_charges'].count(val_where)
        ]).then(([customer_charges, total]) => {
            return res.status(200).json({result: "success", customer_charges, total}).end();
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    findPayments: function (req, res) {
        const { startingAfter, limit } = req.query;

        if(req.session.admin){
            stripe.charges.list({
                limit: limit,
                starting_after: startingAfter }, function(err, charges) {
                // asynchronously called
                if(err)
                    return res.status(500).json({result: "error", msg: "Get Payments failed"}).end();
                return res.status(200).json({result: "success", payments: charges.data, has_more: charges.has_more}).end();
            });
        }else if(req.session.user){
            const user_id = req.session.user.id;
            return models.payments.findOne({
                where: {
                    user_id: user_id
                }
            }).then((payment) => {
                if(!payment)
                    return res.status(500).json({result: "error", errorCode: 3}).end();
                return stripe.payments.list({
                    customer: payment.customer_id,
                    limit: limit,
                    starting_after: startingAfter
                }).then((payments) => {
                    return res.status(200).json({result: "success", payments: payments.data, has_more: payments.has_more}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", msg: "Internal Server Error!"}).end());
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }
    },

    refundPayment: function (req, res) {
        const { id } = req.body;
        stripe.refunds.create({charge: id}, function(err, refund) {
            // asynchronously called
            if(err){
                console.log(err)
                if(err.code === 'charge_already_refunded'){
                    return models['customer_charges'].findOne({
                        where: {
                            charge_id: id
                        }
                    }).then((customer_charge) => {
                        customer_charge.status = true;
                        customer_charge.save();
                        return res.status(200).json({result: "success", msg: "Refund Succeeded"}).end();
                    }).catch((error) => {
                        console.log(error)
                        return res.status(500).json({result: "error", msg: "Internal Server Error"}).end();
                    })
                }else
                    return res.status(500).json({result: "error", msg: "Refund Failed"}).end();
            }

            if(refund.status === 'succeeded'){
                return models['customer_charges'].findOne({
                    where: {
                        charge_id: id
                    }
                }).then((customer_charge) => {
                    customer_charge.status = true;
                    customer_charge.save();
                    return res.status(200).json({result: "success", msg: "Refund Succeeded"}).end();
                }).catch((error) => {
                    console.log(error)
                    return res.status(500).json({result: "error", msg: "Internal Server Error"}).end();
                })
            }else
                return res.status(500).json({result: "error", msg: "Refund Failed"}).end();
        });

    },

    buyConnection: function (user_id, payment_method_id) {
        return Promise.all([
            models['st_customers'].findOne({
                where: {
                    user_id: user_id
                }
            }),
            models['users'].findOne({
                where: {
                    id: user_id
                }
            })
        ]).then(async([st_customer, user]) => {
            let stripe_id = null;
            if(!st_customer || !st_customer.stripe_id){
                const customer = await this.createCustomer(user_id, user.email, user.first_name + ", " + user.last_name);
                const st_customer = {
                    user_id: user_id,
                    stripe_id: customer.id
                };

                models['st_customers'].create(st_customer);

                stripe_id = customer.id;
            }else {
                stripe_id = st_customer.dataValues.stripe_id;
            }

            try {
                const paymentIntent = await stripe['paymentIntents'].create({
                    amount: 5500,
                    currency: 'aud',
                    payment_method_types: ['card'],
                    payment_method: payment_method_id,
                    customer: stripe_id,
                    description: 'Buy Connection',
                    confirm: true
                });

                await models['customer_charges'].create({
                    user_id, job_id: null,
                    charge_type: 'Buy Connection',
                    charge_id: paymentIntent.id
                });

                return {status: 1};
            } catch (e) {
                console.error(e, 'buyconnection');
                if (e.code == 'balance_insufficient' || e.code == 'insufficient_funds') {
                    return {status: -2, error: e.code };
                } else if ((e.raw.param == "payment_method" || e.raw.param == "default_payment_method" || e.code == 'payment_intent_unexpected_state') && e.raw.type == "invalid_request_error") {
                    return {status: -1, error: e.message };
                } else {
                    return {status: -4, error: e.message };
                }
            }
        }).catch(error => {
            return {status: -4, error: err.message };
        });
    },

    purchaseSOSUrgentJob: function (hirer_id, jobber_id, job_id, payment_method_id) {
        return Promise.all([
            models['st_customers'].findOne({
                where: {
                    user_id: hirer_id
                }
            }),
            models['st_customers'].findOne({
                where: {
                    user_id: jobber_id
                }
            })
        ]).then(async ([st_hirer, st_jobber]) => {
            if (!st_hirer || !st_hirer.stripe_id) {
                return {status: -1, error: "error" };
            }
            if (!st_jobber || !st_jobber.account_id) {
                return {status: -3};
            }

            try {
                const paymentIntent = await stripe['paymentIntents'].create({
                    amount: 5500,
                    currency: 'aud',
                    payment_method_types: ['card'],
                    payment_method: payment_method_id,
                    customer: st_hirer.stripe_id,
                    application_fee_amount: 2500,
                    description: 'SOS Urgent staff',
                    on_behalf_of: st_jobber.account_id,
                    transfer_data: {
                        destination: st_jobber.account_id
                    }
                });

                await models['customer_charges'].create({
                    user_id: jobber_id, job_id,
                    charge_type: 'SOS Urgent staff',
                    charge_id: paymentIntent.id
                });

                return {status: 1};
            } catch (e) {
                console.log(e.raw.param, e.raw.type, e.message, e.code, 'purchaseSOSUrgentJob')
                if (e.code == 'balance_insufficient' || e.code == 'insufficient_funds') {
                    return {status: -2, error: e.code };
                } else if ((e.raw.param == "payment_method" || e.raw.param == "default_payment_method") && e.raw.type == "invalid_request_error") {
                    return {status: -1, error: e.message };
                } else {
                    return {status: -4, error: e.message };
                }
            }
        }).catch(err => {
            console.error(err, 'entire');
            return {status: -4, error: err.message };
        });
    },

    purchaseSOSUrgentJobTest: function (hirer_id, jobber_id, job_id, payment_method_id) {
        return Promise.all([
            models['st_customers'].findOne({
                where: {
                    user_id: hirer_id
                }
            }),
            models['st_customers'].findOne({
                where: {
                    user_id: jobber_id
                }
            })
        ]).then(async ([st_hirer, st_jobber]) => {
            if (!st_hirer || !st_hirer.stripe_id) {
                return {status: -1, error: "error" };
            }
            if (!st_jobber || !st_jobber.account_id) {
                return {status: -3};
            }

            try {
                const paymentIntent = await stripe['paymentIntents'].create({
                    amount: 200,
                    currency: 'aud',
                    payment_method_types: ['card'],
                    payment_method: payment_method_id,
                    customer: st_hirer.stripe_id,
                    transfer_group: `SOS-Order-${st_jobber.id}`,
                    description: 'SOS Urgent staff',
                    confirm: true
                });

                await models['customer_charges'].create({
                    user_id: jobber_id, job_id,
                    charge_type: 'SOS Urgent staff',
                    charge_id: paymentIntent.id
                });

                return {status: 1};
            } catch (e) {
                console.log(e.raw.param, e.raw.type, e.message, e.code, 'purchaseSOSUrgentJob')
                if (e.code == 'balance_insufficient' || e.code == 'insufficient_funds') {
                    return {status: -2, error: e.code };
                } else if ((e.raw.param == "payment_method" || e.raw.param == "default_payment_method") && e.raw.type == "invalid_request_error") {
                    return {status: -1, error: e.message };
                } else {
                    return {status: -4, error: e.message };
                }
            }
        }).catch(err => {
            console.error(err, 'entire');
            return {status: -4, error: err.message };
        });
    },

    retrieveCharge: function (charge_id) {
        return stripe.charges.retrieve(charge_id)
        .then((charge) => {
            return charge
        }).catch(error => {
            console.log(error);
            return null;
        })
    },

    retrievePaymentIntent: function (paymentIntent_id) {
        return stripe.paymentIntents.retrieve(paymentIntent_id)
        .then((paymentIntent) => {
            return paymentIntent
        }).catch(error => {
            console.log(error);
            return null;
        })
    },

    payoutSOSUrgentToJobber: function (user_id, job_id, status) {
        return models['customer_charges'].findOne({
            where: {
                user_id, job_id
            }
        }).then(async (row) => {
            if (!row)
                return {status: -1, error: "no error"};
            if (row.status)
                return {status: -2, error: "row status"};
            if (status) {
                const paymentIntent = await stripe['paymentIntents'].confirm(row.charge_id);
                
                if (paymentIntent.status !== "succeeded") return {status: 0, error: paymentIntent.status};
            } else {
                const paymentIntent = await stripe['paymentIntents'].cancel(row.charge_id);
                
                if (paymentIntent.status !== "succeeded") return {status: 0, error: paymentIntent.status};
            }

            await row.update({
                status: true
            });

            return {status: 1};
        }).catch(err => {
            console.error(err);
            return {status: 0, error: err};
        });
    },

    payoutSOSUrgentToJobberTest: function (user_id, job_id, status) {
        return models['customer_charges'].findOne({
            where: {
                user_id, job_id
            }
        }).then(async (row) => {
            if (!row)
                return {status: -1, error: "no error"};
            if (row.status)
                return {status: -2, error: "row status"};
            if (status) {
                const st_jobber = await models['st_customers'].findOne({
                    where: {
                        user_id: row.user_id
                    }
                });
                
                try {
                    const transfer = await stripe.transfers.create({
                        amount: 100,
                        currency: 'aud',
                        destination: st_jobber.account_id,
                        transfer_group: `SOS-Order-${st_jobber.id}`,
                    });
                } catch (e) {
                    console.log(e, 'transfers create error')
                    return {status: 0, error: e.code };
                }
            } else {
                const paymentIntent = await stripe['paymentIntents'].cancel(row.charge_id);
                
                if (paymentIntent.status !== "succeeded") return {status: 0, error: paymentIntent.status};
            }

            await row.update({
                status: true
            });

            return {status: 1};
        }).catch(err => {
            console.error(err);
            return {status: 0, error: err};
        });
    },

    createBankAccount: async function (req, res) {
        const { account_number, routing_number } = req.body;
        // if(!req.isMobileRequest) {
        //     const recaptchaData = {
        //         response: get(req.body, 'recaptchaToken'),
        //         secret: process.env.RECAPTCHA_SERVER_KEY,
        //     };

        //     try {
        //         await recaptcha.verifyRecaptcha(recaptchaData);
        //     }catch(err) {
        //         console.log(err);
        //         return res.status(500).json({result: "error", errorCode: 27}).end();
        //     }
        // }
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer){
                return req.status(500).json({result: "error", errorCode: 1}).end();
            }
            const account_id = st_customer.dataValues.account_id;
            if(!account_id)
                return stripe.accounts.create({
                    type: 'custom',
                    country: 'AU',
                    email: req.session.user.email,
                    capabilities: {
                        card_payments: {requested: true},
                        transfers: {requested: true}
                    },
                }).then((account) => {
                    st_customer.update({account_id: account.id});
                    return stripe.accounts.createExternalAccount(
                        account.id,
                        {
                          external_account: {
                            object: "bank_account",
                            account_number: account_number,
                            routing_number: routing_number,
                            country: "AU",
                            currency: "AUD"
                          },
                        }
                    ).then((bank_account) => {
                        return res.status(200).json(bank_account);
                    }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            else{
                return stripe.accounts.createExternalAccount(
                    account_id,
                    {
                      external_account: {
                        object: "bank_account",
                        account_number: account_number,
                        routing_number: routing_number,
                        country: "AU",
                        currency: "AUD"
                      },
                    }
                ).then((bank_account) => {
                    return res.status(200).json(bank_account);
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    verifyUserAccount: function (req, res) {
        const { refresh_url, return_url } = req.query;

        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer){
                return req.status(500).json({result: "error", errorCode: 1}).end();
            }
            const account_id = st_customer.dataValues.account_id;
            if(!account_id)
                return res.status(500).json({result: "error", errorCode: 1}).end();
            
            return stripe.accountLinks.create({
                account: account_id,
                refresh_url,
                return_url,
                type: 'account_onboarding',
              
            }).then((verify_account_link) => {
                console.log(verify_account_link);
                return res.status(200).json(verify_account_link).end();
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    checkAccountVerified: function (req, res) {
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer){
                return req.status(500).json({result: "error", errorCode: 1,  errorMessage: 'User ID does not exist'}).end();
            }
            const account_id = st_customer.dataValues.account_id;

            if(!account_id)
                return res.status(500).json({result: "error", errorCode: 1, errorMessage: 'Stripe Account ID does not exist'}).end();

            return stripe.accounts.listCapabilities(account_id)
            .then((data) => {
                console.log(data);
                let accounts = data.data;
                let verifiedStatus = null;
                for (let i = 0; i < accounts.length; i++) {
                    if (accounts[i].id == 'transfers') {
                        verifiedStatus = accounts[i].status;
                    }
                }
                return res.status(200).json(verifiedStatus).end();
            }).catch((error) => res.status(500).json({result: "error", errorCode: 0, errorMessage: error}).end());
        }).catch((error) => res.status(500).json({result: "error", errorCode: 0, errorMessage: error}).end());
    },


    getAllBankAccounts: function (req, res) {
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer){
                return req.status(500).json({result: "error", errorCode: 1}).end();
            }
            const account_id = st_customer.dataValues.account_id;
            if(!account_id)
                return res.status(200).json([]).end();
            return stripe.accounts.listExternalAccounts(
                account_id,
                {
                    limit: 100,
                    object: 'bank_account',
                }
            ).then((bank_accounts) => {
                console.log(bank_accounts)
                return res.status(200).json(bank_accounts).end();
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getAllCards: function (req, res) {
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer){
                return req.status(500).json({result: "error", errorCode: 1}).end();
            }
            const stripe_id = st_customer.dataValues.stripe_id;
            if(!stripe_id)
                return res.status(200).json({}).end();

            return stripe.paymentMethods.list(
                {
                    customer:stripe_id,
                    type: 'card'
                }
            ).then((cards) => {
                // const data = cards.data.map((card)=> {return card.card});
                const data = cards.data;
                return res.status(200).json(data).end();
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getStripWebhook: function (req, res) {
        const {type,data} = req.body;
        if(type === "charge.succeeded"){
            if(data.object.statement_descriptor == 'Key Hirer' || data.object.statement_descriptor === 'Key Jobber'){
                const customer_charge = {
                    user_id, charge_type: data.object.statement_descriptor, charge_id: data.object.id
                };
                models['customer_charges'].create(customer_charge);
            }
        }
        if(type === "checkout.session.completed"){
            const { customer, subscription } = data.object;
            if(customer) {
                stripe.customers.retrieve(customer)
                .then((result) => {
                    const email = result.email;
                    models['users'].findOne({
                        raw: true,
                        where: {
                            email
                        }
                    }).then((user) => {
                        models['web_users'].findOne({
                            raw: true,
                            where: {
                                user_id: user.id
                            }
                        }).then((web_user) => {
                            if(!web_user) {
                                models['web_users'].create({
                                    user_id: user.id, is_trial: true
                                }).then((row) => {
                                    console.log(row)
                                });
                            }
                        });


                        models['subscriptions'].create({
                            customer_id: customer,
                            user_id: user.id,
                            subscription_id: subscription,
                            type: 2
                        }).then((row) => {
                            console.log(row);
                        }).catch(err=> {
                            console.log(err)
                        });
                    })
                })
            }
        }

        return res.status(200).send();
    },

    payoutExtraUser: function (req, res) {
        const main_user = req.session.user;

        return models['sub_accounts'].count({
            where: {
                main_user_id: main_user.id
            }
        }).then((counts) => {
            if(!(counts < main_user.sub_accounts)){
                return models['st_customers'].findOne({
                    where: {
                        user_id: main_user.id
                    }
                }).then(async(st_customer) => {
                    let stripe_id = null;
                    if(!st_customer || !st_customer.stripe_id){
                        const customer = await this.createCustomer(main_user.id, main_user.email, main_user.first_name + ", " + main_user.last_name);
                        const st_customer = {
                            user_id: main_user.id,
                            stripe_id: customer.id
                        };

                        models['st_customers'].create(st_customer);
                        stripe_id = customer.id;
                    }else {
                        stripe_id = st_customer.dataValues.stripe_id;
                    }

                    return stripe.customers.retrieve(stripe_id)
                    .then((result) => {
                        const source_id = result.default_source;
                        return stripe.charges.create({
                            amount: 550,
                            currency: "aud",
                            source: source_id, // obtained with Stripe.js
                            customer: stripe_id,
                            description: "Extra User"
                        }
                        ).then((charge) => {
                            const customer_charge = {
                                user_id: main_user.id, charge_type: "Extra User", charge_id: charge.id
                            };
                            models['users'].update({
                                sub_accounts: main_user.sub_accounts + 1,
                                updatedAt: new Date(),
                            }, {
                                where: {
                                    id: main_user.id
                                }
                            });
                            models['customer_charges'].create(customer_charge);
                            return res.status(200).json({result: "success"}).end();
                        }).catch((error) => {
                            console.log(error)
                            return res.status(500).json({result: "error", errorCode: 0}).end();
                        })
                    }).catch((error) => {
                        console.log(error)
                        return res.status(500).json({result: "error", errorCode: 0}).end();
                    })
                }).catch(error => {
                    console.log(error)
                    return res.status(500).json({result: "error", errorCode: 0}).end();
                });
            }else {
                return res.status(200).json({result: "success"}).end();
            }
        }).catch(error => {
            console.log(error)
            return res.status(500).json({result: "error", errorCode: 0}).end();
        });
    },

    deleteCard: function (req, res) {
        const { id } = req.params;
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            const stripe_customer_id = st_customer.dataValues.stripe_id;
            stripe.customers.deleteSource(
                stripe_customer_id,
                id
            ).then(() => {
                return res.status(200).json({result: "success"}).end();
            }).catch((error) => {
                console.log(error);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            })
        }).catch(err => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteBank: function (req, res) {
        const { id } = req.params;
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            const account_id = st_customer.dataValues.account_id;
            stripe.accounts.deleteExternalAccount(
                account_id,
                id
            ).then(() => {
                return res.status(200).json({result: "success"}).end();
            }).catch((error) => {
                console.log(error.raw.message)
                return res.status(500).json({result: "error", errorCode: 0, message: error.raw.message}).end();
            })
        }).catch(err => console.log(err) || res.status(500).json({result: "error", errorCode: 0, message: "Internal Server Error!"}).end());
    },

    updateBank: function (req, res) {
        const { params } = req.body;
        const { id } = req.params;
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            const account_id = st_customer.dataValues.account_id;
            stripe.accounts.updateExternalAccount(
                account_id,
                id,
                JSON.parse(params)
            ).then((result) => {
                return res.status(200).json({result: "success"}).end();
            }).catch((error) => {
                console.log(error.raw.message)
                return res.status(500).json({result: "error", errorCode: 0, message: error.raw.message}).end();
            })
        }).catch(err => console.log(err) || res.status(500).json({result: "error", errorCode: 0, message: "Internal Server Error!"}).end());
    },

    getFreeTrial: function (user_id) {
        return models['subscriptions'].findOne({
            raw: true,
            where: {
                user_id,
                type: 2
            }
        }).then((row) => {
            if(row){
                return stripe.subscriptions.retrieve(
                    row.subscription_id
                ).then((subscription) => {
                    return subscription;
                }).catch((error) => {
                    return null;
                })
            }

        }).catch(err => console.log(err) || null);
    },
};
