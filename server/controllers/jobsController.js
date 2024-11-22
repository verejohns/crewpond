const moment = require('moment');
const fs = require('fs');
const xml2js = require('xml2js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { merge, omit, get } = require('lodash');
const { validation, functions, time, recaptcha } = require('../../utils');
const models = require('../models');
const notificationController = require('./notificationController');
const paymentController = require('./paymentController');
const scheduleController = require('./scheduleController');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function getSubUsers(user) {
    let val_where = {};
    let user_ids = [];
    if(user.sub_accounts === 0 || user.sub_accounts === null){
        val_where.main_user_id = user.id;
        user_ids.push(user.id);
    }else {
        const main_user = await models['sub_accounts'].findOne({
            raw: true,
            where: {
                sub_user_id: user.id
            }
        });
        val_where.main_user_id = main_user.main_user_id;
        user_ids.push(main_user.main_user_id);
    }
    const sub_users = await models['sub_accounts'].findAll({
        raw: true,
        where: val_where
    });

    for(let i = 0; i < sub_users.length; i += 1) {
        user_ids.push(sub_users[i].sub_user_id);
    }
    return user_ids;
}

function isJobEditalbe(job, user_ids) { 
    if(user_ids.find(el=>el === job.owner_id))
        return true;
    return false;
}

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
        return {status: 0, subscription: null};
    }
}

module.exports = {
    createJob: async function (req, res) {
        const { title, price, location, is_hourly, is_urgent,
            is_public, due_date, description, category, schedules, is_ext_payment, payment_method_id } = req.body,
            file = req.file;
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
        if(time.inDates(moment().toDate(), moment(req.session.user.createdAt).toDate()) > req.session.user.trial_period){
            return res.status(500).json({result: "error", errorCode: 54});
        }
        if (validation.isEmpty(title))
            return res.status(500).json({result: "error", errorCode: 1});
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        return Promise.all([
            models['users'].findOne({
                where: {
                    id: user_id
                }
            }),
            models['jobs'].count({
                where: {
                    owner_id: user_id,
                    deleted_at: null
                }
            })
        ]) .then(async ([user, job_count]) => {
            const checkTrialForMobile = await checkWebPortal(user);

            if (req.isMobileRequest && !user.dataValues.is_key_hirer && checkTrialForMobile.status !== 1 && job_count >= process.env.FREE_JOBS) {
                if (!is_ext_payment || is_ext_payment === "false")
                    return res.status(500).json({result: "error 11", value: is_ext_payment, pay: payment_method_id, errorCode: 54});

                try {
                    const buy_result = await paymentController.buyConnection(user_id, payment_method_id);
                    if (buy_result.status === -1) {
                        return res.status(500).json({result: buy_result.error, errorCode: 55});//no payment method
                    } else if (buy_result.status === -2) {
                        return res.status(500).json({result: buy_result.error, errorCode: 57});//error
                    } else if (buy_result.status === -4) {
                        return res.status(500).json({result: buy_result.error, errorCode: 57});//error
                    }
                } catch(err) {
                    console.error(err);
                    return res.status(500).json({result: "error 12", errorCode: 0});
                }
            }

            let data = {
                owner_id: user_id,
                title, price, is_hourly, description, is_urgent, is_public
            };

            if (due_date) {
                data.due_date = due_date;
            }
            if (file) {
                data.avatar = file.path;
            }
            if (category && category !== "null") {
                if (typeof category === 'string') {
                    data.category = JSON.parse(category);
                    data.category2 = JSON.parse(category);
                } else {
                    data.category = category;
                    data.category2 = category;
                }
            }
            if (location && location !== "null") {
                let temp_location = null;
                if (typeof location === 'string') {
                    temp_location = JSON.parse(location);
                } else {
                    temp_location = location;
                }

                if (Array.isArray(temp_location)) {
                    data.address = temp_location[0].address;
                    data.place_name = temp_location[0].place_name;
                    data.latitude = temp_location[0].latitude;
                    data.longitude = temp_location[0].longitude;
                } else {
                    data.address = temp_location.address;
                    data.place_name = temp_location.place_name;
                    data.latitude = temp_location.latitude;
                    data.longitude = temp_location.longitude;
                }
            }

            return models['jobs'].create(data).then(async(row) => {
                if (schedules){
                    const result = await scheduleController.saveSchedule(row.dataValues.id, user_id, schedules);
                    row.dataValues.schedules = result;
                }
                if (row.dataValues.category) {
                    row.dataValues.category = row.dataValues.category[0];
                }

                return res.status(200).json({result: "success", job: row});
            }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    findJobs: async function (req, res) {
        const { categories, keyword, location, range, onlySelf, limit, offset, orderBy, lastValue, is_closed } = req.body;

        let val_where = {}, val_attrs;
        val_where.deleted_at = null;

        let owner_where = {
            deleted_at: null
        };

        let opt = {
            include: [{
                model: models['users'],
                attributes: ['id', 'first_name', 'last_name', 'company', 'avatar'],
                where: owner_where,
                as: 'user'
            }],
            order: [
                [orderBy, 'DESC'],
                ['id', 'DESC']
            ],
            limit: limit
        };

        if (offset) {
            opt.offset = (offset - 1) * limit;
        }
        if (lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            };
        }
        if (keyword && keyword.length > 0) {
            val_where[Op.or] = [
                {title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'ILIKE', '%' + keyword + '%')}
            ];
        }
        if (categories && categories.length > 0) {
            //split the incoming query into it's component values
            // const catMain = categories[0].main;
            // var catSub = categories[0].sub;

            // //if many categories are supplied, then the user is searching on ONLY the main category, so we don't need the sub(s)
            // if(categories.length > 1){
            //     catSub = undefined;
            // }

            // //rebuild the query value object
            // var catSearch = {
            //     main: catMain
            // };
            // //if we have a sub category defined, add that to the query obejct
            // if(catSub){
            //     catSearch.sub = catSub;
            // }
            // //add our query object to the existing list of query parameters
            // //val_where.category2 = { [Op.or]: catSearch };
            val_where.category = { [Op.contained]: categories };
        }
        if (location) {
            const latitude = location.latitude || 0,
                  longitude = location.longitude || 0;

            val_where.having = Sequelize.where(Sequelize.literal(`6371 * acos(cos(radians(${latitude})) * cos(radians("jobs"."latitude")) * cos(radians(${longitude}) - radians("jobs"."longitude")) + sin(radians(${latitude})) * sin(radians("jobs"."latitude")))`), '<', range);
        }
        let user_id = null;
        if(req.session.user)
        user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        if (onlySelf === true) {
            val_where.owner_id = user_id;
        } else {
            if (!req.session.admin) val_where.is_public = true;
        }
        if (!req.session.admin) {
            val_where.is_closed = false;
            val_where.is_completed = false;
            val_where.is_cancelled = false;
        }

        val_attrs = ["id", "owner_id", "title", "price", "avatar", "latitude", "longitude", "address", "place_name", "is_assigned", "is_hourly", "is_public", "is_urgent", "due_date", "has_updates", "description", "category", "createdAt"];
        if (req.session.admin) {
            val_attrs = val_attrs.concat(["is_cancelled", "is_closed", "is_completed", "is_hided"]);
        } else if (req.session.user) {
            val_attrs.push([Sequelize.literal('(SELECT COUNT(*) FROM offers WHERE offers.job_id = jobs.id AND offers.status=1 AND offers.deleted_at IS NULL)'), 'number_of_offers']);
            if (onlySelf === true) 
                val_attrs.push([Sequelize.literal('(SELECT COUNT(*) FROM offers WHERE offers.job_id = jobs.id AND offers.read_offer = FALSE AND offers.hirer_id = (' + user_id + ') AND offers.deleted_at IS NULL)'), 'number_of_new_offers']);
            else
                val_attrs.push([Sequelize.literal('(SELECT COUNT(*) FROM offers WHERE offers.job_id = jobs.id AND offers.read_offer = FALSE AND offers.hirer_id != (' + user_id + ') AND offers.deleted_at IS NULL)'), 'number_of_new_offers']);
        }

        if(is_closed) {
            val_where.is_closed = is_closed;
        }

        opt.where = val_where;
        opt.attributes = val_attrs;
        return Promise.all([
            models['jobs'].findAll(opt),
            models['jobs'].count({
                where: val_where
            })
        ]).then(([rows, total]) => {
            for (let i = 0; i < rows.length; i ++) {
                rows[i].dataValues.number_of_offers = parseInt(rows[i].dataValues.number_of_offers);
                rows[i].dataValues.number_of_new_offers = parseInt(rows[i].dataValues.number_of_new_offers);
                if (rows[i].dataValues.category) {
                    rows[i].dataValues.category = rows[i].dataValues.category[0];
                }
                if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                    rows[i].dataValues.location = {
                        address: rows[i].dataValues.address,
                        place_name: rows[i].dataValues.place_name,
                        latitude: rows[i].dataValues.latitude,
                        longitude: rows[i].dataValues.longitude
                    };
                }
                rows[i].dataValues = omit(rows[i].dataValues, ['address', 'place_name', 'latitude', 'longitude']);
                rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
                rows[i].dataValues.user.avatar = functions.convertLocalToPublic(rows[i].dataValues.user.avatar);
                if(req.session.user) {
                    const editable = isJobEditalbe(rows[i], [user_id]);
                    rows[i].dataValues.editable = editable;
                }
            }
            return res.status(200).json({result: 'success', jobs: rows, total, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1].id) : null});
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getJobs: function (req, res) {
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        models['contracts'].findAll({
            where: {
                jobber_id: user_id,
                deleted_at: null
            },
            include: [{
                model: models['users'],
                attributes: ["id", "first_name", "last_name", "avatar", "company"],
                as: 'jobber'
            }]
        }).then(async (contracts) => {
            const createdJobs = await models['jobs'].findAll({
                where: {
                    owner_id: user_id,
                    deleted_at: null
                },
                include: [{
                    model: models['contracts'],
                    as: 'contracts',
                    required: false,
                    include: [{
                        model: models['users'],
                        attributes: ["id", "first_name", "last_name", "avatar", "company"],
                        as: 'jobber'
                    }],
                    where: {
                        deleted_at: null
                    }
                }, {
                    model: models['schedules'],
                    as: 'schedules',
                    include: [{
                        model: models['times'],
                        as: 'time_field',
                        attributes: ['from', 'to']
                    }]
                }, {
                    model: models['users'],
                    attributes: ["id", "first_name", "last_name", "avatar", "company"],
                    as: 'user'
                }]
            });

            let jobs = [];
            for (let i = 0; i < contracts.length; i ++) {
                let workingJob = await models['jobs'].findOne({
                    where: {
                        id: contracts[i].job_id,
                        deleted_at: null
                    },
                    include: [{
                        model: models['schedules'],
                        as: 'schedules',
                        include: [{
                            model: models['times'],
                            as: 'time_field',
                            attributes: ['from', 'to']
                        }]
                    }, {
                        model: models['users'],
                        attributes: ["id", "first_name", "last_name", "avatar", "company"],
                        as: 'user'
                    }]
                });
                workingJob.dataValues.contracts = [contracts[i]];
                jobs.push(workingJob);
            }
            jobs = jobs.concat(createdJobs);

            for (let i = 0; i < jobs.length; i ++) {
                if (jobs[i].dataValues.category) {
                    jobs[i].dataValues.category = jobs[i].dataValues.category[0];
                }
                jobs[i].dataValues.avatar = functions.convertLocalToPublic(jobs[i].dataValues.avatar);
                jobs[i].dataValues.user.avatar = functions.convertLocalToPublic(jobs[i].dataValues.user.avatar);

                if (jobs[i].dataValues.address || jobs[i].dataValues.place_name || jobs[i].dataValues.latitude || jobs[i].dataValues.longitude) {
                    jobs[i].dataValues.location = {
                        address: jobs[i].dataValues.address,
                        place_name: jobs[i].dataValues.place_name,
                        latitude: jobs[i].dataValues.latitude,
                        longitude: jobs[i].dataValues.longitude,
                    };
                }
                jobs[i].dataValues = omit(jobs[i].dataValues, ['address', 'place_name', 'latitude', 'longitude']);
            }
            return res.status(200).json({result: 'success', jobs});
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getJobById: async function (req, res) {
        const { id } = req.params;
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        let attrs = ["id", 'owner_id', "title", "price", "avatar", "is_completed", "is_assigned", "is_hourly", "is_public", "is_urgent", "is_closed", "is_cancelled", "due_date", "description", "category", "address", "latitude", "longitude", "place_name", "closed_at", "createdAt"];
        const user_ids = [user_id];
        if (req.session.user) {
            attrs = attrs.concat([
                [Sequelize.literal('(SELECT COUNT(*) FROM offers WHERE offers.job_id = jobs.id AND jobs.deleted_at IS NULL)'), 'number_of_offers'],
                [Sequelize.literal('(SELECT COUNT(*) FROM offers WHERE offers.job_id = jobs.id AND offers.read_offer = FALSE AND offers.hirer_id IN (' + user_ids + '))'), 'number_of_new_offers']
            ]);
        }

        return Promise.all([
            models['jobs'].findByPk(id, {
                attributes: attrs,
                include: [{
                    model: models['users'],
                    attributes: [
                        "id", "first_name", "last_name", "avatar", "company",
                        [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "user"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id = "user"."id" OR contracts.hirer_id ="user"."id") AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "user"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal(`(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "user"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)`), 'number_of_success'],
                    ],
                    as: 'user'
                }]
            }),
            models['schedules'].findAll({
                attributes: ["id", "name"],
                where: {
                    job_id: id,
                    deleted_at: null
                },
                include: [{
                    model: models['times'],
                    as: 'time_field',
                    attributes: ['from', 'to']
                }]
            }),
            models['offers'].findAll({
                where: {
                    job_id: id
                },
                include: [{
                    model: models['users'],
                    attributes: [
                        "id", "first_name", "last_name", "avatar", "company",
                        [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                    ],
                    as: 'jobber'
                }, {
                    model: models['contracts'],
                    attributes: ["createdAt"],
                    as: 'contract'
                }]
            })
        ]).then(([job, schedules, offers]) => {
            if (!job)
                return res.status(500).json({result: "error", errorCode: 3});

            if (job.dataValues.category) {
                job.dataValues.category = job.dataValues.category[0];
            }
            job.dataValues.avatar = functions.convertLocalToPublic(job.dataValues.avatar);
            job.dataValues.user.dataValues.review = {
                score: job.dataValues.user.dataValues.score,
                number_of_completed: job.dataValues.user.dataValues.number_of_completed,
                number_of_feedback: job.dataValues.user.dataValues.number_of_feedback,
                number_of_success: job.dataValues.user.dataValues.number_of_success,
            };
            job.dataValues.user.dataValues = omit(job.dataValues.user.dataValues, ['number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
            job.dataValues.user.dataValues.avatar = functions.convertLocalToPublic(job.dataValues.user.dataValues.avatar);
            job.dataValues.schedules = schedules;

            let accepted_offers = [];
            let suggested_offers = [];
            let a_id = 0;
            let s_id = 0;
            for (let i = 0; i < offers.length; i ++) {
                // if(req.session.user){
                //     if (!user_ids.find(el=>el === offers[i].dataValues.hirer_id) && user_ids.find(el=>el === offers[i].dataValues.jobber_id))
                //          offers[i].dataValues = omit(offers[i].dataValues, ['price', 'is_hourly']);
                // }

                offers[i].dataValues.jobber = offers[i].dataValues.jobber.dataValues;
                offers[i].dataValues.jobber.review = {
                    score: offers[i].dataValues.jobber.score,
                    number_of_completed: offers[i].dataValues.jobber.number_of_completed,
                    number_of_feedback: offers[i].dataValues.jobber.number_of_feedback,
                    number_of_success: offers[i].dataValues.jobber.number_of_success,
                };
                offers[i].dataValues.jobber = omit(offers[i].dataValues.jobber, ['score', 'number_of_completed', 'number_of_feedback', 'number_of_success']);
                offers[i].dataValues.jobber.avatar = functions.convertLocalToPublic(offers[i].dataValues.jobber.avatar);

                if(offers[i].dataValues.status == 2) {
                    accepted_offers[a_id] = offers[i];
                    a_id += 1;
                }
                if(offers[i].dataValues.status == 1) {
                    suggested_offers[s_id] = offers[i];
                    s_id += 1;
                }
            }
            merge(job.dataValues, {
                accepted_offers,
                suggested_offers
            })

            if (job.dataValues.address || job.dataValues.place_name || job.dataValues.latitude || job.dataValues.longitude) {
                job.dataValues.location = {
                    address: job.dataValues.address,
                    place_name: job.dataValues.place_name,
                    latitude: job.dataValues.latitude,
                    longitude: job.dataValues.longitude
                };
            }
            job.dataValues = omit(job.dataValues, ['address', 'place_name', 'latitude', 'longitude']);
            job.dataValues.isEditable = isJobEditalbe(job, user_ids);
            if (req.session.user && user_ids.find(el=>el === job.owner_id)) {
                return Promise.all([
                    models['offers'].update({
                        is_job_updated: false
                    }, {
                        where: {
                            jobber_id: user_ids,
                            job_id: id
                        }
                    }),
                    models['jobs'].update({
                        has_updates: false
                    }, {
                        where: {
                            id: id
                        }
                    })
                ]).then(() => {
                    if(req.session.user)
                        notificationController.getBadgeCounts(user_ids);

                    return res.status(200).json({result: "success", job: job});
                }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }
            return res.status(200).json({result: "success", job: job});
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getJobsInTime: function (req, res) {
        const { currentDate, timeFilter } = req.query;
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        if (!validation.isDate(currentDate))
            return res.status(500).json({result: "error", errorCode: 1});

        let toDate;
        if (timeFilter === 'month') {
            toDate = moment(currentDate).add(1, "months");
        } else if (timeFilter === 'week') {
            toDate = moment(currentDate).add(7, "days");
        } else if (timeFilter === 'day') {
            toDate = moment(currentDate).add(1, "days");
        } else {
            return res.status(500).json({result: "error", errorCode: 1});
        }

        return models['jobs'].findAll({
            where: {
                updatedAt: {
                    [Op.gt]: moment(currentDate).set({hour: 0, minute: 0, second: 0, millisecond: 0}),
                    [Op.lte]: toDate.set({hour: 23, minute: 59, second: 59})
                },
                deleted_at: null
            }
        }).then(rows => {
            return res.status(200).json({result: "success", jobs: rows});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getAssignedJobs: function (req, res) {
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        return models['jobs'].findOne({
            where: {
                is_assigned: true,
                is_cancelled: false,
                is_closed: false,
                is_completed: false,
                deleted_at: null
            }
        }).then(rows => {
            return res.status(200).json({result: "success", jobs: rows});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getRentpXML: function (req, res) {
        const file = req.file;
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        const parser = new xml2js.Parser();
        fs.readFile(__dirname + '/../../' + file.path, function(err, data) {
            parser.parseString(data, function (err, result) {
                let jobs = [];
                for(let i = 0; i < result.shifts.shift.length; i += 1){
                    const job = {
                        title: result.shifts.shift[i].showname.length > 0?result.shifts.shift[i].showname[0]:'',
                        description: result.shifts.shift[i].resource_description.length > 0?result.shifts.shift[i].resource_description[0]:'',
                        category: result.shifts.shift[i].resource.length > 0?result.shifts.shift[i].resource[0].trim(result.shifts.shift[i].resource[0]):'',
                    };

                    jobs.push(job);
                }

            });
        });
        return res.status(200).send();
    },

    updateJob: async function (req, res) {
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        const id = req.params.id;
        let data = omit(req.body, ['schedules', 'deleted_schedules', 'unassign_schedules']),
            { schedules, unassign_schedules, payment_method_id } = req.body,
            file = req.file;
        let { deleted_schedules } = req.body;

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

        const user_ids = [user_id];
        
        //get job and offers by id
        return Promise.all([
            models['jobs'].findByPk(id),
            models['offers'].findAll({
                attributes: ['jobber_id'],
                where: {
                    job_id: id
                }
            })
        ]).then(async([job_row, offer_rows]) => {
            if (!job_row)
                return res.status(500).json({result: "error", errorCode: 3});
            
            if (!req.session.admin && !user_ids.find(el=>el === job_row.dataValues.owner_id))
                return res.status(500).json({result: "error", errorCode: 1});
            
            const editable = isJobEditalbe(job_row, user_ids);
            
            if(!req.session.admin && !editable)
                return res.status(500).json({result: "error", errorCode: 1});
            if (deleted_schedules) {//check deleted schedules
                deleted_schedules = JSON.parse(deleted_schedules);
                if(unassign_schedules == "false"){
                    let assigned_schedules = [];
                    for(let i = 0; i < deleted_schedules.length; i += 1){
                        const contract = await models['contracts'].findOne({
                            where: {
                                job_id: id,
                                schedule_ids: {
                                    [Op.contains]: [deleted_schedules[i]]
                                }
                            }
                        });

                        if(contract) {
                            if(!assigned_schedules.find(el=>el == deleted_schedules[i]))
                                assigned_schedules.push(deleted_schedules[i]);
                        }
                    }

                    if(assigned_schedules.length > 0){
                        return models['schedules'].findAll({
                            where: {
                                id: assigned_schedules
                            }
                        }).then((rows) => res.status(500).json({result: "error", errorCode: 71, schedules: rows}).end())
                        .catch(error=>console.log(error)||res.status(500).json({result:"error", errorCode: 0}).end())
                    }else{
                        for(let i = 0; i < deleted_schedules.length; i += 1){
                            Promise.all([
                                models['offers'].findAll({
                                    where: {
                                        job_id: id,
                                        schedule_ids: {
                                            [Op.contains]: [deleted_schedules[i]]
                                        }
                                    }
                                }),
                                models['invites'].findAll({
                                    where: {
                                        job_id: id,
                                        schedule_ids: {
                                            [Op.contains]: [deleted_schedules[i]]
                                        }
                                    }
                                })
                            ]).then(([offers, invites]) => {
                                let o_schedules = [];
                                let i_schedules = [];
                                for(let oi = 0; oi < offers.length; oi += 1){
                                    o_schedules.push(offers[oi].dataValues.schedule_ids.filter(el => el != deleted_schedules[i]));
                                }

                                for(let ii = 0; ii < invites.length; ii += 1){
                                    i_schedules.push(invites[ii].dataValues.schedule_ids.filter(el => el != deleted_schedules[i]));
                                }

                                Promise.all([
                                    models['offers'].update(
                                    {schedule_ids: o_schedules},
                                    {
                                        where: {
                                            job_id: id,
                                            schedule_ids: {
                                                [Op.contains]: [deleted_schedules[i]]
                                            }
                                        }
                                    }),
                                    models['invites'].update(
                                    {schedule_ids: i_schedules},
                                    {
                                        where: {
                                            job_id: id,
                                            schedule_ids: {
                                                [Op.contains]: [deleted_schedules[i]]
                                            }
                                        }
                                    })
                                ])
                            })
                        }
                        await scheduleController.deleteSchedule(deleted_schedules);
                    }
                }else{
                    for(let i = 0; i < deleted_schedules.length; i += 1){
                        Promise.all([
                            models['offers'].findAll({
                                where: {
                                    job_id: id,
                                    schedule_ids: {
                                        [Op.contains]: [deleted_schedules[i]]
                                    }
                                }
                            }),
                            models['contracts'].findAll({
                                where: {
                                    job_id: id,
                                    schedule_ids: {
                                        [Op.contains]: [deleted_schedules[i]]
                                    }
                                }
                            }),
                            models['invites'].findAll({
                                where: {
                                    job_id: id,
                                    schedule_ids: {
                                        [Op.contains]: [deleted_schedules[i]]
                                    }
                                }
                            })
                        ]).then(([offers, contracts, invites]) => {
                            for(let oi = 0; oi < offers.length; oi += 1){
                                const o_schedules = offers[oi].dataValues.schedule_ids.filter(el => el != deleted_schedules[i]);

                                models['offers'].update(
                                    {schedule_ids: o_schedules.length===0?null:o_schedules},
                                    {
                                        where: {
                                            job_id: id,
                                            schedule_ids: {
                                                [Op.contains]: [deleted_schedules[i]]
                                        }
                                    }
                                })
                            }

                            for(let ci = 0; ci < contracts.length; ci += 1){
                                const c_schedules = contracts[ci].dataValues.schedule_ids.filter(el => el != deleted_schedules[i]);
                                models['contracts'].update(
                                    {schedule_ids: c_schedules.length===0?null:c_schedules},
                                    {
                                        where: {
                                            job_id: id,
                                            schedule_ids: {
                                                [Op.contains]: [deleted_schedules[i]]
                                        }
                                    }
                                })
                            }
                            for(let ii = 0; ii < invites.length; ii += 1){
                                const i_schedules = invites[ii].dataValues.schedule_ids.filter(el => el != deleted_schedules[i]);
                                models['invites'].update(
                                    {schedule_ids: i_schedules.length===0?null:o_schedules},
                                    {
                                        where: {
                                            job_id: id,
                                            schedule_ids: {
                                                [Op.contains]: [deleted_schedules[i]]
                                            }
                                    }
                                })
                            }
                        })
                    }
                    await scheduleController.deleteSchedule(deleted_schedules);
                }
            }
            if (schedules) {
                await scheduleController.saveSchedule(id, job_row.dataValues.owner_id, schedules);
            }

            if (file) data.avatar = file.path;
            else delete data.avatar;

            // if (data.is_urgent === "true") {
            //     try {
            //         let result = await paymentController.purchaseSOSUrgentJob(req.session.user.id, id);
            //         if (result === -1) {
            //             return res.status(500).json({result: "error", errorCode: 53});
            //         } else if (result === -2) {
            //             return res.status(500).json({result: "error", errorCode: 56});
            //         }
            //     } catch (err) {
            //         console.error(err);
            //         return res.status(500).json({result: "error", errorCode: 0}).end();
            //     }
            // }

            if(data.due_date !== 'null' && data.due_date !== undefined) {
                console.log(`data.due_date`)

                console.log(data.due_date)
                data.due_date = moment(data.due_date).toDate();
            }else {
                data = omit(data, ['due_date']);
            }

            if (data.category && typeof data.category === 'string') {
                data.category = JSON.parse(data.category);
            }
            if (data.location && data.location !== "null") {
                let temp_location = null;
                if(typeof data.location === 'string'){
                    temp_location = JSON.parse(data.location);
                }else{
                    temp_location = data.location;
                }
                const { address, place_name, latitude, longitude } = temp_location;
                data = omit(data, ['location']);

                merge(data, {
                    address: address,
                    place_name: place_name,
                    latitude: latitude,
                    longitude: longitude
                });
            }

            if(data.closed_at && data.closed_at === 'null') {
                data.closed_at = null
            }
            if(data.createdAt)
                data = omit(data, ['createdAt']);
            if(data.updatedAt)
                data = omit(data, ['updatedAt']);
            if(data.deleted_at)
                data = omit(data, ['deleted_at']);
            Promise.all([
                job_row.update(data),
                models['offers'].update({
                    is_job_updated: true
                }, {
                    where: {
                        job_id: id,
                        deleted_at: null
                    }
                }),
                models['schedules'].findAll({
                    where: {
                        job_id: id
                    }
                })
            ]).then(([job, offer, schedules]) => {
                for (let i = 0; i < offer_rows.length; i ++) {
                    const notification = {
                        sender_id: user_id,
                        receiver_id: offer_rows[i].jobber_id,
                        type: 6,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} updated job - ${job.title}.`,
                        is_broadcast: false,
                        job_id: job.dataValues.id,
                        is_read: false
                    };

                    notificationController.createNotification(notification, offer_rows[i].jobber_id);
                }
                job.dataValues.schedules = schedules;
                job.dataValues.avatar = "\\" + job.dataValues.avatar;
                return res.status(200).json({result: "success", job});
            }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteJob: function (req, res) {
        let user_id = null;
        if(!req.session.admin)
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['jobs'].findByPk(req.params.id).then(row => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});
            if (!req.session.admin && user_id !== row.owner_id)
                return res.status(500).json({result: "error", errorCode: 1});

            row.update({deleted_at: moment()}).then(() => {
                return res.status(200).json({result: "success"});
            }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    closeJob: function (req, res) {
        let user_id = null;
        if(!req.session.admin)
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        const { id } = req.body;
        return Promise.all([
            models['jobs'].findOne({
                where: {
                    id,
                    owner_id: user_id
                }
            }),
            models['offers'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    status: 1
                }
            }),
            models['invites'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    status: 1
                }
            }),
            models['contracts'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    closed_at: {
                        [Op.ne]: null
                    }
                }
            }),
        ]).then(([job, offers, invites, contracts]) => {
            if (!job)
                return res.status(500).json({result: "error", errorCode: 3});
            if (!req.session.admin && user_id !== job.owner_id)
                return res.status(500).json({result: "error", errorCode: 1});

            const offer_jobbers = offers.map(el=>el.jobber_id);
            const invite_jobbers = invites.map(el=>el.receiver_id);
            const contract_jobbers = contracts.map(el=>el.jobber_id);

            job.update({is_cancelled: true, closed_at: moment()}).then(() => {
                for(let i = 0; i < offer_jobbers.length; i += 1){
                    models['offers'].update({
                        deleted_at: new Date()
                    }, {where: {
                        job_id: id,
                        jobber_id: offer_jobbers[i]
                    }});
                    const notification = {
                        sender_id: user_id,
                        receiver_id: offer_jobbers[i],
                        type: 25,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} cancelled job - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [offer_jobbers[i]]);
                }

                for(let j = 0; j < invite_jobbers.length; j += 1) {
                    models['invites'].update({
                        deleted_at: new Date()
                    }, {where: {
                        job_id: id,
                        receiver_id: invite_jobbers[j]
                    }});
                    const notification = {
                        sender_id: user_id,
                        receiver_id: invite_jobbers[j],
                        type: 25,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} cancelled invite - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [invite_jobbers[j]]);
                }

                for(let k = 0; k < contract_jobbers.length; k += 1) {
                    models['contracts'].update({
                        deleted_at: new Date()
                    }, {where: {
                        job_id: id,
                        jobber_id: contract_jobbers[k]
                    }});
                    const notification = {
                        sender_id: user_id,
                        receiver_id: contract_jobbers[k],
                        type: 13,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} cancelled contract - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [contract_jobbers[k]]);
                }

                return res.status(200).json({result: "success"});
            }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    completeJob: function (req, res) {
        const { id } = req.body;
        
        return Promise.all([
            models['jobs'].findOne({
                where: {
                    id
                }
            }),
            models['offers'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    status: 1
                }
            }),
            models['invites'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    status: 1
                }
            }),
            models['contracts'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    closed_by: null,
                    closed_at: null,
                    deleted_at: null
                }
            }),
        ]).then(([job, offers, invites, contracts]) => {
            if (!job)
                return res.status(500).json({result: "error", errorCode: 3});
            if (!req.session.admin)
                return res.status(500).json({result: "error", errorCode: 1});

            const offer_jobbers = offers.map(el=>el.jobber_id);
            const invite_jobbers = invites.map(el=>el.receiver_id);
            const contract_jobbers = contracts.map(el=>el.jobber_id);

            job.update({is_completed: true, updatedAt: moment()}).then(() => {
                const notification = {
                    sender_id: 0,
                    receiver_id: job.owner_id,
                    type: 25,
                    title: '',
                    description: `Admin completed job - ${job.title}.`,
                    is_broadcast: true,
                    job_id: id,
                    is_read: false
                };
                notificationController.createNotification(notification, [job.owner_id]);

                for(let i = 0; i < offer_jobbers.length; i += 1){
                    models['offers'].update({
                        deleted_at: new Date()
                    }, {where: {
                        job_id: id,
                        jobber_id: offer_jobbers[i]
                    }});
                    const notification = {
                        sender_id: 0,
                        receiver_id: offer_jobbers[i],
                        type: 25,
                        title: '',
                        description: `Admin cancelled offer for - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [offer_jobbers[i]]);
                }

                for(let j = 0; j < invite_jobbers.length; j += 1) {
                    models['invites'].update({
                        deleted_at: new Date()
                    }, {where: {
                        job_id: id,
                        receiver_id: invite_jobbers[j]
                    }});
                    const notification = {
                        sender_id: 0,
                        receiver_id: invite_jobbers[j],
                        type: 25,
                        title: '',
                        description: `Admin cancelled invite for - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [invite_jobbers[j]]);
                }

                for(let k = 0; k < contract_jobbers.length; k += 1) {
                    models['contracts'].update({
                        closed_at: new Date(),
                        closed_by: 0,
                        read_jobber: false
                    }, {where: {
                        job_id: id,
                        jobber_id: contract_jobbers[k]
                    }});
                    const notification = {
                        sender_id: 0,
                        receiver_id: contract_jobbers[k],
                        type: 13,
                        title: '',
                        description: `Admin closed contract for - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [contract_jobbers[k]]);
                }

                return res.status(200).json({result: "success"});
            }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    uncompleteJob: function (req, res) {
        const { id } = req.body;
        
        return Promise.all([
            models['jobs'].findOne({
                where: {
                    id
                }
            }),
            models['offers'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    status: 1,
                    deleted_at: {
                        [Op.ne]: null
                    }
                }
            }),
            models['invites'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    status: 1,
                    deleted_at: {
                        [Op.ne]: null
                    }
                }
            }),
            models['contracts'].findAll({
                raw: true, 
                where: {
                    job_id: id,
                    closed_at: {
                        [Op.ne]: null
                    },
                    closed_by: {
                        [Op.ne]: null
                    }
                }
            }),
        ]).then(([job, offers, invites, contracts]) => {
            if (!job)
                return res.status(500).json({result: "error", errorCode: 3});
            if (!req.session.admin)
                return res.status(500).json({result: "error", errorCode: 1});

            const offer_jobbers = offers.map(el=>el.jobber_id);
            const invite_jobbers = invites.map(el=>el.receiver_id);
            const contract_jobbers = contracts.map(el=>el.jobber_id);

            job.update({is_completed: false, updatedAt: moment()}).then(() => {
                const notification = {
                    sender_id: 0,
                    receiver_id: job.owner_id,
                    type: 25,
                    title: '',
                    description: `Admin uncompleted job - ${job.title}.`,
                    is_broadcast: true,
                    job_id: id,
                    is_read: false
                };
                notificationController.createNotification(notification, [job.owner_id]);

                for(let i = 0; i < offer_jobbers.length; i += 1){
                    models['offers'].update({
                        deleted_at: null
                    }, {where: {
                        job_id: id,
                        jobber_id: offer_jobbers[i]
                    }});
                    const notification = {
                        sender_id: 0,
                        receiver_id: offer_jobbers[i],
                        type: 25,
                        title: '',
                        description: `Admin recovered offer for - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [offer_jobbers[i]]);
                }

                for(let j = 0; j < invite_jobbers.length; j += 1) {
                    models['invites'].update({
                        deleted_at: null
                    }, {where: {
                        job_id: id,
                        receiver_id: invite_jobbers[j]
                    }});
                    const notification = {
                        sender_id: 0,
                        receiver_id: invite_jobbers[j],
                        type: 25,
                        title: '',
                        description: `Admin recovered invite for - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [invite_jobbers[j]]);
                }

                for(let k = 0; k < contract_jobbers.length; k += 1) {
                    models['contracts'].update({
                        closed_at: null,
                        closed_by: null,
                        read_jobber: true
                    }, {where: {
                        job_id: id,
                        jobber_id: contract_jobbers[k]
                    }});
                    const notification = {
                        sender_id: 0,
                        receiver_id: contract_jobbers[k],
                        type: 13,
                        title: '',
                        description: `Admin recovered contract for - ${job.title}.`,
                        is_broadcast: true,
                        job_id: id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [contract_jobbers[k]]);
                }

                return res.status(200).json({result: "success"});
            }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getJobbers: function (req, res) {
        const { id } = req.params;
        const user_id = req.session.main_user ? req.session.main_user.id : req.session.user ? req.session.user.id : req.session.admin.id;

        return models['offers'].findAll({
            where: {
                job_id: id,
                contract_id: {
                    [Op.ne]: null
                }
            },
            include: [{
                model: models['users'],
                attributes: [
                    "id", "first_name", "last_name", "avatar", "company",
                    [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                ],
                as: 'jobber'
            }]
        }).then(async(offers) => {
            let jobbers = [];
            for (let i = 0; i < offers.length; i ++) {
                if(req.session.user){
                    if (offers[i].hirer_id !== user_id && offers[i].jobber_id !== user_id)
                        offers[i].dataValues = omit(offers[i].dataValues, ['price', 'is_hourly']);
                }

                offers[i].dataValues.jobber = offers[i].dataValues.jobber.dataValues;
                offers[i].dataValues.jobber.review = {
                    score: offers[i].dataValues.jobber.score,
                    number_of_completed: offers[i].dataValues.jobber.number_of_completed,
                    number_of_feedback: offers[i].dataValues.jobber.number_of_feedback,
                    number_of_success: offers[i].dataValues.jobber.number_of_success,
                };
                offers[i].dataValues.jobber = omit(offers[i].dataValues.jobber, ['score', 'number_of_completed', 'number_of_feedback', 'number_of_success']);
                offers[i].dataValues.jobber.avatar = functions.convertLocalToPublic(offers[i].dataValues.jobber.avatar);

                let is_favorite = false;
                const favorite = await models['favorites'].findOne({
                    where: {
                        from_user_id: user_id,
                        to_user_id: offers[i].dataValues.jobber_id,
                        deleted_at: null
                    }
                });
                if(favorite)
                    is_favorite = true;
                else
                    is_favorite = false;
                
                jobbers[i] = offers[i].dataValues.jobber;
                jobbers[i].is_favorite = is_favorite;
            }
            return res.status(200).json({result: "success", jobbers});
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },
};
