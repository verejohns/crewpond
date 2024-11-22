const models = require('../models');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
    resumeSubscription: function (req, res){
        const { email, subscription_id } = req.body;
        return models['users'].findOne({
            raw: true,
            where: {
                email
            }
        }).then((user) => {
            if(user) {
                return models['subscriptions'].findOne({
                    where: {
                        user_id: user.id,
                        subscription_id
                    }
                }).then((subscrpition) => {//check subscription id is match with this user
                    if(subscrpition)  {
                        return stripe.subscriptions.retrieve(subscription_id)
                        .then(async (subscriptoin) => {// get subscription's status
                            if(subscriptoin){// reactivate subscription
                                if(subscriptoin.status !== 'active')
                                    try {
                                        await stripe.subscriptions.update(subscription_id, {
                                            cancel_at_period_end: false
                                        });
                                    }catch(err) {
                                        console.log(err);
                                        return res.status(500).json({result: "error", errorCode: 0});
                                    }
                                return res.status(200).json({result: "success"});
                            }else {//no subscription on stripe
                                return res.status(500).json({result: "error", errorCode: 115});    
                            }
                        }).catch((err) => {
                            console.log(err)
                            return res.status(500).json({result: "error", errorCode: 0});
                        });
                    }
                    // no subscription on db
                    return res.status(500).json({result: "error", errorCode: 115});
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({result: "error", errorCode: 0});
                })
            }
            return res.status(500).json({result: "error", errorCode: 1});
        }).catch(err => {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 0});
        })
    },

    createKeyJobberSubscription: function (req, res) {

        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer) {
                return res.status(500).json({result: "error", errorCode: 61}).end();
            }
            const { stripe_id } = st_customer.dataValues;
            const { payment_method_id } = req.body;
            
            return stripe.subscriptions.create(payment_method_id ? {
                customer: stripe_id,
                items: [
                  {
                    plan: process.env.PRODUCT_KEY_JOBBER, //plan_FpLrl8tfClPoFA
                  },
                ],
                default_payment_method: payment_method_id
              } : {
                customer: stripe_id,
                items: [
                  {
                    plan: process.env.PRODUCT_KEY_JOBBER, //plan_FpLrl8tfClPoFA
                  },
                ]
              }
            ).then((subscription) => {
                console.log(`customer stripe id ${subscription}`);

                if(subscription.status === 'cancelled' || subscription.status === 'unpaid'){
                    return res.status(200).json({result: "error", errorCode: 62}).end()
                }
                const subscription_id = subscription.id;
                return Promise.all([
                    models['users'].update({
                        is_key_jobber: true,
                        updatedAt: new Date()
                    }, {
                        where: {
                            id: req.session.user.id
                        }
                    }),
                    models['subscriptions'].create({
                        customer_id: stripe_id,
                        user_id: req.session.user.id,
                        subscription_id: subscription_id,
                        type: 0
                    })
                ]).then(() => {
                    return res.status(200).json({result: "success", subscription_id}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(e => {
                if(e.message.includes("no attached payment source"))
                {
                    return res.status(500).json({result: e + " catch1", errorCode: 61}).end()
                } else if (e.code == 'balance_insufficient' || e.code == 'insufficient_funds') {
                    return res.status(500).json({result: e + " catch2", errorCode: 0}).end()
                } else if ((e.raw.param == "payment_method" || e.raw.param == "default_payment_method") && e.raw.type == "invalid_request_error") {
                    return res.status(500).json({result: e + " catch4", errorCode: 61}).end()
                } else {
                    return res.status(500).json({result: e + " catch5", errorCode: 0}).end()
                }
            });
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    createKeyHirerSubscription: function (req, res) {
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer) {
                return res.status(500).json({result: "error", errorCode: 61}).end();
            }  
            const { stripe_id } = st_customer.dataValues;
            return stripe.subscriptions.create({
                customer: stripe_id,
                items: [
                  {
                    plan: process.env.PRODUCT_WEB_PORTAL, //plan_FpLqYVDd0q6nN0
                  },
                ]
              }
            ).then((subscription) => {
                if(subscription.status === 'cancelled' || subscription.status === 'unpaid'){
                    return res.status(200).json({result: "error", errorCode: 62}).end()
                }
                const subscription_id = subscription.id;
                return Promise.all([
                    models['users'].update({
                        is_key_hirer: true,
                        updatedAt: new Date()
                    }, {
                        where: {
                            id: req.session.user.id
                        }
                    }),
                    models['subscriptions'].create({
                        customer_id: stripe_id,
                        user_id: req.session.user.id,
                        subscription_id: subscription_id,
                        type: 1
                    })
                ]).then(() => {
                    return res.status(200).json({result: "success", subscription_id}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(e => {
                if(e.message.includes("no attached payment source"))
                {
                    return res.status(500).json({result: e + " catch1", errorCode: 61}).end()
                } else if (e.code == 'balance_insufficient' || e.code == 'insufficient_funds') {
                    return res.status(500).json({result: e + " catch2", errorCode: 0}).end()
                } else if ((e.raw.param == "payment_method" || e.raw.param == "default_payment_method") && e.raw.type == "invalid_request_error") {
                    return res.status(500).json({result: e + " catch4", errorCode: 61}).end()
                } else {
                    return res.status(500).json({result: e + " catch5", errorCode: 0}).end()
                }
            });
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    cancelKeyJobberSubscription: function (req, res) {
        console.log('cancel jobber subscription')
        return models['subscriptions'].findOne({
            where: {
                user_id: req.session.user.id,
                type: 0
            }
        }).then((subscription) => {
            if(!subscription)
                return res.status(200).json({result: "success"}).end();

            const subscription_id = subscription.dataValues.subscription_id;
            return stripe.subscriptions.del(subscription_id)
            .then((confirmation) => {
                console.log("check user session" + req.session.user);
                return Promise.all([
                    models['subscriptions'].destroy({
                        where: {
                            user_id: req.session.user.id,
                            type: 0
                        }
                    }),
                    models['users'].update({
                        is_key_jobber: false
                    },
                    {
                        where: {
                            id: req.session.user.id
                        }
                    })
                ]).then(() => {
                    return res.status(200).json({result: "success"}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    cancelKeyHirerSubscription: function (req, res) {
        return models['subscriptions'].findOne({
            where: {
                user_id: req.session.user.id,
                type: 1
            }
        }).then((subscription) => {
            if(!subscription)
                return res.status(200).json({result: "success"}).end();

            const subscription_id = subscription.dataValues.subscription_id;
            return stripe.subscriptions.del(subscription_id)
            .then((confirmation) => {
                return Promise.all([
                    models['subscriptions'].destroy({
                        where: {
                            user_id: req.session.user.id,
                            type: 1
                        }
                    }),
                    models['users'].update({
                        is_key_hirer: false
                    },
                    {
                        where: {
                            id: req.session.user.id
                        }
                    })
                ]).then(() => {
                    return res.status(200).json({result: "success"}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    createSuperUserSubscription: function (req, res) {
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer) => {
            if(!st_customer) {
                return res.status(500).json({result: "st_customer error", errorCode: 61}).end();
            }
                
            const { stripe_id } = st_customer.dataValues;
            const { payment_method_id } = req.body;
            
            return stripe.subscriptions.create(payment_method_id ? {
                customer: stripe_id,
                items: [
                  {
                    plan: process.env.PRODUCT_WEB_PORTAL,
                  },
                ],
                default_payment_method: payment_method_id
              } : {
                customer: stripe_id,
                items: [
                  {
                    plan: process.env.PRODUCT_WEB_PORTAL,
                  },
                ]
              }
            ).then((subscription) => {
                if(subscription.status === 'cancelled' || subscription.status === 'unpaid'){
                    return res.status(200).json({result: "subscription error", errorCode: 62}).end()
                }
                const subscription_id = subscription.id;
                return Promise.all([
                    models['users'].update({
                        is_key_hirer: true,
                        updatedAt: new Date()
                    }, {
                        where: {
                            id: req.session.user.id
                        }
                    }),
                    models['web_users'].create({
                        user_id: req.session.user.id,
                        is_trial: true,
                    }),
                    models['subscriptions'].create({
                        customer_id: stripe_id,
                        user_id: req.session.user.id,
                        subscription_id: subscription_id,
                        type: 2
                    })
                ]).then(() => {
                    return res.status(200).json({result: "success", subscription_id}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: error + " catch", errorCode: 0}).end());
            }).catch(e => {
                if(e.message.includes("no attached payment source"))
                {
                    return res.status(500).json({result: e + " catch1", errorCode: 61}).end()
                } else if (e.code == 'balance_insufficient' || e.code == 'insufficient_funds') {
                    return res.status(500).json({result: e + " catch2", errorCode: 0}).end()
                } else if ((e.raw.param == "payment_method" || e.raw.param == "default_payment_method") && e.raw.type == "invalid_request_error") {
                    return res.status(500).json({result: e + " catch4", errorCode: 61}).end()
                } else {
                    return res.status(500).json({result: e + " catch5", errorCode: 0}).end()
                }
            });
        }).catch(error => console.log(error) || res.status(500).json({result: error + " catch3", errorCode: 0}).end());
    },

    resumeSuperUserSubscription: function (req, res) {
        
        const { email, cardNumber, expiry, cvc, loginErrorCode } = req.body;
        
        return models['users'].findOne({
            raw: true,
            where: {
                email
            }
        }).then(async (user) => {
           
            if (!user) {
                
                return res.status(500).json({result: "error", errorCode: 1});
            }

            let st_customer = await models['st_customers'].findOne({
                where: {
                    user_id: user.id
                }
            });
            
            if (!st_customer) {
                
                const customer = await stripe.customers.create({
                    description: 'Customer for ' + user.email,
                    email: user.email,
                    name: `${user.first_name}, ${user.last_name}`
                });
                st_customer = await models['st_customers'].create({
                    user_id: user.id,
                    stripe_id: customer.id
                })
            }

            if (cardNumber && expiry && cvc) {
                
                const expDate = expiry.split("/");

                const token = await stripe.tokens.create({
                    card: {
                        number: cardNumber,
                        exp_month: expDate[0],
                        exp_year: expDate[1],
                        cvc,
                    },
                });
                await stripe.customers.createSource(
                    st_customer.stripe_id,
                    { source: token.id}
                )
            }

            const subscription = await models['subscriptions'].findOne({
                where: {
                    user_id: user.id,
                    type: 2
                }
            });

            if (subscription) {
                
                const stripeSub = await stripe.subscriptions.retrieve(subscription.subscription_id);

                if (stripeSub) {
                    // if (stripeSub.status !== 'active') {
                    //     await stripe.subscriptions.del(subscription.subscription_id);
                    //     await subscription.destroy();
                    // } else {
                    //     console.log('$$$$$$$$$$$$$$$$$$$');
                    //     console.log('ERROR 7');
                    //     return res.status(500).json({result: "error", errorCode: 61});
                    // }
                    
                    await stripe.subscriptions.del(subscription.subscription_id);
                    await subscription.destroy();
                    
                }
            }

             // const stripeSub = await stripe.subscriptions.create({
            //     customer: st_customer.stripe_id,
            //     items: [
            //         {
            //             plan: process.env.PRODUCT_WEB_PORTAL,
            //         },
            //     ],
            //     trial_period_days: 30
            // });

            let stripeSub = null;

            if (loginErrorCode == 113) {
                stripeSub = await stripe.subscriptions.create({
                    customer: st_customer.stripe_id,
                    items: [
                        {
                            plan: process.env.PRODUCT_WEB_PORTAL,
                        },
                    ],
                    trial_period_days: process.env.FREE_TRIAL_PERIOD
                });
            } else {
                stripeSub = await stripe.subscriptions.create({
                    customer: st_customer.stripe_id,
                    items: [
                        {
                            plan: process.env.PRODUCT_WEB_PORTAL,
                        },
                    ]
                });
            }
           
            
            if (stripeSub.status === 'cancelled' || stripeSub.status === 'unpaid'){
                return res.status(500).json({result: "error stripeSub", errorCode: 62}).end();
            }

            await models['web_users'].create({
                user_id: user.id,
                is_trial: false,
            });
            await models['subscriptions'].create({
                customer_id: st_customer.stripe_id,
                user_id: user.id,
                subscription_id: stripeSub.id,
                type: 2
            });

            return res.status(200).json({result: "success"}).end();
        }).catch(err => {
            console.log(err);
            return res.status(500).json({result: err + " error", errorCode: 0});
        });
    },

    cancelSuperUserSubscription: function (req, res) {
        return models['subscriptions'].findOne({
            where: {
                user_id: req.session.user.id,
                type: 2
            }
        }).then((subscription) => {
            if(!subscription)
                return res.status(200).json({result: "success"}).end();

            const subscription_id = subscription.dataValues.subscription_id;
            return stripe.subscriptions.del(subscription_id)
            .then((confirmation) => {
                return Promise.all([
                    models['subscriptions'].destroy({
                        where: {
                            user_id: req.session.user.id,
                            type: 2
                        }
                    }),
                    models['users'].update({
                        is_key_hirer: false
                    },
                    {
                        where: {
                            id: req.session.user.id
                        }
                    }),
                    models['web_users'].destroy({
                        where: {
                            user_id: req.session.user.id
                        }
                    })
                ]).then(() => {
                    return res.status(200).json({result: "success"}).end();
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },
    listSubscriptions: function (req, res){
        return models['st_customers'].findOne({
            where: {
                user_id: req.session.user.id
            }
        }).then((st_customer)=>{
            if(!st_customer){
                return res.status(200).json({result:{data:{data:[]}}})
            }else{
                return stripe.subscriptions.list({
                    limit: 100,
                    customer: st_customer.dataValues.stripe_id,
                    status: 'all'
                }).then((subscriptions)=>{
                    return res.status(200).json(subscriptions).end();
                });
            }
        });
                
    }
};
