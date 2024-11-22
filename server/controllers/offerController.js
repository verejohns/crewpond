const { omit } = require('lodash');
const { functions } = require('../../utils');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const notificationController = require('./notificationController');
const models = require('../models');


module.exports = {
    createOffer: function (req, res) {
        const { job_id, price, is_hourly, cover_letter, due_date, schedule_ids } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        return models['jobs'].findOne({
            where: {
                id: job_id,
                deleted_at: null
            }
        }).then((job) => {
            if (!job)
                return res.status(500).json({result: "error", errorCode: 3});

            return Promise.all([
                models['offers'].findOne({
                    where: {
                        job_id: job_id,
                        jobber_id: user_id
                    }
                }),
                models['invites'].findOne({
                    where: {
                        job_id: job_id,
                        receiver_id: user_id
                    }
                }),
                models['users'].findByPk(user_id)
            ]).then(async([offer, invite, jobber]) => {
                if(!jobber)
                    return res.status(500).json({result: "error", errorCode: 0});
                let data = {
                    job_id, price, is_hourly, invite_id: invite?invite.dataValues.id:null, schedule_ids, cover_letter,
                    jobber_id: user_id,
                    hirer_id: job.dataValues.owner_id,
                    status: 1
                };

                if(job.dataValues.is_hourly)
                    jobber.update({hourly_price: price});

                if(due_date) {
                    data.due_date = due_date;
                }

                try {
                    if(offer)// if exist offer already, only update
                        await models['offers'].update(data, {
                            where: {id: offer.id}
                        });
                    else    // not exist, create new offer
                        offer = await models['offers'].create(data);
                }catch (err) {
                    console.log(err);
                    return res.status(500).json({result: "error", errorCode: 0}).end();
                }

                    
                if(invite){
                    return Promise.all([
                        invite.update({accepted_date: moment().toDate(), status: 2}),
                        job.update({has_updates: true}, {where: {id: job_id}}),
                    ]).then(([invite, job]) => {
                        const notification = {
                            sender_id: user_id,
                            receiver_id: offer.dataValues.hirer_id,
                            type: 10,
                            title: '',
                            description: `${req.session.user.first_name} ${req.session.user.last_name} accepted your invitation to - ${job.title}`,
                            is_broadcast: false,
                            offer_id: offer.dataValues.id,
                            job_id: job_id,
                            is_read: false
                        };

                        notificationController.createNotification(notification, [offer.dataValues.hirer_id]);
                        return res.status(200).json({result: "success", offer: offer});
                    }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
                }else{
                    return job.update({has_updates: true}, {where: {id: job_id}})
                    .then(() => {
                        const notification = {
                            sender_id: user_id,
                            receiver_id: offer.dataValues.hirer_id,
                            type: 10,
                            title: '',
                            description: `${req.session.user.first_name} ${req.session.user.last_name} sent you an offer to - ${job.title}`,
                            is_broadcast: false,
                            offer_id: offer.dataValues.id,
                            job_id: offer.dataValues.job_id,
                            is_read: false
                        };

                        notificationController.createNotification(notification, [offer.dataValues.hirer_id]);
                        return res.status(200).json({result: "success", offer: offer});
                    }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
                }
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getOffers: function (req, res) {
        const { job_id, limit, orderBy, lastValue } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        if (job_id) {//read offers by jobber

            let val_where = {
                job_id,
                deleted_at: null,
                status: 1,
                [Op.or]: [{
                    hirer_id: user_id,
                }, {
                    jobber_id: user_id,
                }]
            };

            if (lastValue) {
                val_where.id = {
                    [Op.lt]: lastValue
                }
            }
            return Promise.all([
                models['offers'].findAll({
                    where: val_where,
                    include: [{
                        model: models['users'],
                        attributes: ["id", "first_name", "last_name", "avatar", "company",
                            [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                            [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id ="jobber"."id" OR contracts.hirer_id ="jobber"."id") AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']],
                        as: 'jobber'
                    }],
                    limit: limit
                }),
                models['offers'].update({
                    read_offer: true
                }, {
                    where: {
                        job_id,
                        deleted_at: null,
                    }
                })
            ]).then(([rows]) => {
                for(let i = 0; i < rows.length; i ++){
                    rows[i].dataValues.jobber.dataValues.review = {
                        score: rows[i].dataValues.jobber.dataValues.score,
                        number_of_completed: rows[i].dataValues.jobber.dataValues.number_of_completed,
                        number_of_feedback: rows[i].dataValues.jobber.dataValues.number_of_feedback,
                        number_of_success: rows[i].dataValues.jobber.dataValues.number_of_success,
                    };

                    if(rows[i].dataValues.schedule_ids){
                        for(let si = 0; si < rows[i].dataValues.schedule_ids.length; si += 1){
                            rows[i].dataValues.schedule_ids[si] = parseInt(rows[i].dataValues.schedule_ids[si]);
                        }
                    }
                    rows[i].dataValues.jobber.dataValues = omit(rows[i].dataValues.jobber.dataValues, ['score', 'number_of_feedback', 'number_of_completed', 'number_of_success']);
                    rows[i].dataValues.jobber.avatar = functions.convertLocalToPublic(rows[i].dataValues.jobber.avatar);
                }
                return res.status(200).json({result: 'success', offers: rows, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1].dataValues.id) : null});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        } else {
            let opt = {
                where: {
                    [Op.or]: [
                        {
                            jobber_id: user_id,
                        }, 
                        {
                            hirer_id: user_id,
                        }
                    ],
                    is_archived: false,
                    status: 1,
                    contract_id: null,
                    deleted_at: null
                },
                order: [
                    [orderBy, 'DESC']
                ],
                include: [{
                    model: models['jobs'],
                    attributes: ["id", "avatar", "category", "title"],
                    as: 'job'
                }, {
                    model: models['users'],
                    attributes: ["id", "first_name", "last_name", "company", "avatar"],
                    as: 'hirer'
                }],
                limit: limit
            };
            if (lastValue) {
                opt.where.id = {
                    [Op.lt]: lastValue
                }
            }

            return models['offers'].findAll(opt).then((rows) => {
                for(let i = 0; i < rows.length; i ++) {
                    if (rows[i].dataValues.job.category) {
                        rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                    }
                    rows[i].dataValues.job.location = {
                        address: rows[i].dataValues.job.address,
                        place_name: rows[i].dataValues.job.place_name,
                        latitude: rows[i].dataValues.job.latitude,
                        longitude: rows[i].dataValues.job.longitude,
                    };
                    if(rows[i].dataValues.schedule_ids){
                        for(let si = 0; si < rows[i].dataValues.schedule_ids.length; si += 1){
                            rows[i].dataValues.schedule_ids[si] = parseInt(rows[i].dataValues.schedule_ids[si]);
                        }
                    }
                    rows[i].dataValues.job = omit(rows[i].dataValues.job.dataValues, ['address', 'place_name', 'latitude', 'longitude']);
                    rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                    if(rows[i].dataValues.hirer)
                        rows[i].dataValues.hirer.avatar = functions.convertLocalToPublic(rows[i].dataValues.hirer.avatar);
                }
                return res.status(200).json({result: 'success', offers: rows, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1].dataValues.id) : null});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }
    },

    getOfferById: function (req, res) {
        const { id } = req.params;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['offers'].findOne({
            attributes: ["id", "price", "cover_letter", "is_hourly", "schedule_ids", "due_date", "status", "job_id", "contract_id"],
            where: {
                id: id,
                [Op.or]: {
                    jobber_id: user_id,
                    hirer_id: user_id
                },
                deleted_at: null
            },
            include: [{
                model: models['jobs'],
                attributes: ["id", "title", "is_public", "avatar", "is_urgent", "is_assigned", "is_completed"],
                include: [{
                    model: models['users'],
                    attributes: [
                        "id", "first_name", "last_name", "avatar", "company",
                        [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "job"."owner_id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="job"."owner_id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "job"."owner_id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "job"."owner_id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                    ],
                    as: 'user'
                }],
                as: 'job'
            },{
                model: models['users'],
                attributes: [
                    "id", "first_name", "last_name", "avatar", "company",
                    [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                ],
                as: 'jobber'
            }]
        }).then(async (row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});
                
            models['offers'].update({
                read_offer: true
            }, {
                 where: {
                    id: id,
                    deleted_at: null,
                }
            })
            
            row.dataValues.schedules = await models['schedules'].findAll({
                attributes: ["id", "name"],
                where:{
                    id: row.schedule_ids
                },
                include: [{
                    model: models['times'],
                    as: 'time_field',
                    attributes: ['from', 'to']
                }]
            });
            row.dataValues = omit(row.dataValues, ['schedule_ids']);
            row.dataValues.job.dataValues.assignees = await models['offers'].findAll({
                attributes: [],
                where: {
                    job_id: row.dataValues.job.id,
                    status: 2,
                    contract_id: {
                        [Op.ne]: null
                    },
                    deleted_at: null
                },
                include: [{
                    model: models['users'],
                    attributes: [
                        "id", "first_name", "last_name", "avatar", "company",
                        [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                    ],
                    as: 'jobber'
                }, {
                    model: models['contracts'],
                    attributes: ["id", "createdAt"],
                    as: 'contract'
                }]
            });
            let offers = await models['offers'].findAll({
                attributes: ["price", "is_hourly", "createdAt"],
                where: {
                    job_id: row.dataValues.job.id,
                    status: 1,
                    contract_id: null,
                    deleted_at: null
                },
                include: [{
                    model: models['users'],
                    attributes: [
                        "id", "first_name", "last_name", "avatar", "company",
                        [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                    ],
                    as: 'jobber'
                }]
            });
            for (let i = 0; i < offers.length; i ++) {
                offers[i].dataValues.jobber.avatar = functions.convertLocalToPublic(offers[i].dataValues.jobber.avatar);
                if (offers[i].jobber.id !== user_id) {
                    offers[i].dataValues = omit(offers[i].dataValues, ["price", "is_hourly"]);
                }
            }

            for(let ii = 0; ii < row.dataValues.job.dataValues.assignees.length; ii += 1) {
                row.dataValues.job.dataValues.assignees[ii].jobber.avatar = functions.convertLocalToPublic(row.dataValues.job.dataValues.assignees[ii].jobber.avatar);
            }
            row.dataValues.job.dataValues.offers = offers;
            row.dataValues.job.user.avatar = functions.convertLocalToPublic(row.dataValues.job.user.avatar);
            row.dataValues.job.avatar= functions.convertLocalToPublic(row.dataValues.job.avatar);
            row.dataValues.jobber.avatar= functions.convertLocalToPublic(row.dataValues.jobber.avatar);
            return res.status(200).json({result: "success", offer: row});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateOffer: function (req, res) {
        const { id } = req.params,
            data = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        console.log(user_id)
        console.log(id)
        return Promise.all([
            models['offers'].findOne({
                where: {
                    id,
                    jobber_id: user_id
                }
            }),
            models['contracts'].findOne({
                where: {
                    offer_id: id
                }
            })
        ]).then(([offer, contract]) => {
            console.log(offer)
            if (!offer)
                return res.status(500).json({result: "error", errorCode: 3});
            console.log(contract)
            if(contract) 
                return res.status(500).json({result: "error", errorCode: 72});
            if(offer.dataValues.status === 3) {
                return res.status(500).json({result: "error", errorCode: 73});
            }

            return Promise.all([
                models['invites'].update({
                    accepted_date: new Date(),
                    status: 2
                }, {
                    where: {
                        job_id: offer.dataValues.job_id,
                        receiver_id: user_id
                    }
                }),
                offer.update(data)
            ]).then(() => {
                const notification = {
                    sender_id: user_id,
                    receiver_id: offer.dataValues.hirer_id,
                    type: 11,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} updated offer.`,
                    is_broadcast: false,
                    offer_id: offer.dataValues.id,
                    job_id: offer.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [offer.dataValues.hirer_id]);

                return models['offers'].findOne({
                    attributes: ["id", "price", "cover_letter", "is_hourly", "schedule_ids", "due_date", "status"],
                    where: {
                        id: id,
                        jobber_id: user_id,
                        deleted_at: null
                    },
                    include: [{
                        model: models['jobs'],
                        attributes: ["id", "title", "is_public", "avatar", "is_urgent", "is_assigned", "is_completed"],
                        include: [{
                            model: models['users'],
                            attributes: [
                                "id", "first_name", "last_name", "avatar", "company",
                                [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "job"."owner_id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                                [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="job"."owner_id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                                [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "job"."owner_id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                                [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "job"."owner_id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                            ],
                            as: 'user'
                        }],
                        as: 'job'
                    },{
                        model: models['users'],
                        attributes: [
                            "id", "first_name", "last_name", "avatar", "company",
                            [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                            [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                        ],
                        as: 'jobber'
                    }]
                }).then(async (row) => {
                    if (!row)
                        return res.status(500).json({result: "error", errorCode: 3});
        
                    row.dataValues.schedules = await models['schedules'].findAll({
                        attributes: ["id", "name"],
                        where:{
                            id: row.schedule_ids
                        },
                        include: [{
                            model: models['times'],
                            as: 'time_field',
                            attributes: ['from', 'to']
                        }]
                    });
                    row.dataValues = omit(row.dataValues, ['schedule_ids']);
                    row.dataValues.job.dataValues.assignees = await models['offers'].findAll({
                        attributes: [],
                        where: {
                            job_id: row.dataValues.job.id,
                            status: 2,
                            contract_id: {
                                [Op.ne]: null
                            },
                            deleted_at: null
                        },
                        include: [{
                            model: models['users'],
                            attributes: [
                                "id", "first_name", "last_name", "avatar", "company",
                                [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
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
                    });
                    let offers = await models['offers'].findAll({
                        attributes: ["price", "is_hourly", "createdAt"],
                        where: {
                            job_id: row.dataValues.job.id,
                            status: 1,
                            contract_id: null,
                            deleted_at: null
                        },
                        include: [{
                            model: models['users'],
                            attributes: [
                                "id", "first_name", "last_name", "avatar", "company",
                                [Sequelize.literal('(SELECT AVG(score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                                [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="jobber"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                                [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                                [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                            ],
                            as: 'jobber'
                        }]
                    });
                    for (let i = 0; i < offers.length; i ++) {
                        offers[i].dataValues.jobber.avatar = functions.convertLocalToPublic(offers[i].dataValues.jobber.avatar);
                        if (offers[i].jobber.id !== user_id) {
                            offers[i].dataValues = omit(offers[i].dataValues, ["price", "is_hourly"]);
                        }
                    }
        
                    for(let ii = 0; ii < row.dataValues.job.dataValues.assignees.length; ii += 1) {
                        row.dataValues.job.dataValues.assignees[ii].jobber.avatar = functions.convertLocalToPublic(row.dataValues.job.dataValues.assignees[ii].jobber.avatar);
                    }
                    row.dataValues.job.dataValues.offers = offers;
                    row.dataValues.job.user.avatar = functions.convertLocalToPublic(row.dataValues.job.user.avatar);
                    row.dataValues.job.avatar= functions.convertLocalToPublic(row.dataValues.job.avatar);
                    row.dataValues.jobber.avatar= functions.convertLocalToPublic(row.dataValues.jobber.avatar);
                    return res.status(200).json({result: "success", offer: row});
                }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteOffer: function (req, res) {
        const { id } = req.params;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['offers'].findOne({
            where: {
                id,
                jobber_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row) return res.status(500).json({result: "error", errorCode: 3});

            row.destroy().then(() => {
                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.hirer_id,
                    type: 26,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} has cancelled their offer.`,
                    is_broadcast: false,
                    offer_id: row.dataValues.id,
                    job_id: row.dataValues.job_id,
                    is_read: false
                };
                
                notificationController.createNotification(notification, [row.dataValues.hirer_id]);
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error, 'error1') || res.status(500).json({result: error, errorCode: 1}).end());
        }).catch(error => console.error(error, 'error2') || res.status(500).json({result: error, errorCode: 0}).end());
    },

    archiveOffer: function (req, res) {
        const {offer_id} = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['offers'].findOne({
            where: {
                id: offer_id,
                jobber_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            if(!row) {
                return res.status(500).json({result: 'error', errorCode: 1}).end();
            }

            return row.update({
                is_archived: true
            }).then(() => {
                return res.status(200).json({result: "success"}).end();
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getArchivedOffers: function (req, res) {
        const { limit, lastValue, orderBy } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        let opt = {
            where: {
                jobber_id: user_id,
                is_archived: true,
                status: 1,
                contract_id: null,
                deleted_at: null
            },
            order: [
                [orderBy, 'DESC']
            ],
            include: [{
                model: models['jobs'],
                attributes: ["id", "avatar", "category", "title"],
                as: 'job'
            }, {
                model: models['users'],
                attributes: ["id", "first_name", "last_name", "company"],
                as: 'hirer'
            }],
            limit: limit
        };
        if (lastValue) {
            opt.where.id = {
                [Op.lt]: lastValue
            }
        }

        return models['offers'].findAll(opt).then((rows) => {
            for(let i = 0; i < rows.length; i ++) {
                if (rows[i].dataValues.job.category) {
                    rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                }
                rows[i].dataValues.job.location = {
                    address: rows[i].dataValues.job.address,
                    place_name: rows[i].dataValues.job.place_name,
                    latitude: rows[i].dataValues.job.latitude,
                    longitude: rows[i].dataValues.job.longitude,
                };
                if(rows[i].dataValues.schedule_ids){
                    for(let si = 0; si < rows[i].dataValues.schedule_ids.length; si += 1){
                        rows[i].dataValues.schedule_ids[si] = parseInt(rows[i].dataValues.schedule_ids[si]);
                    }
                }
                rows[i].dataValues.job = omit(rows[i].dataValues.job.dataValues, ['address', 'place_name', 'latitude', 'longitude']);
                rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                rows[i].dataValues.hirer = rows[i].dataValues.hirer.dataValues;
            }
            return res.status(200).json({result: 'success', offers: rows, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1].dataValues.id) : null});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    declineOffer: function (req, res) {
        const {offer_id} = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['offers'].findOne({
            where: {
                id: offer_id,
                hirer_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            row.update({
                status: 3
            }).then(() => {
                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.jobber_id,
                    type: 27,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} declined your offer.`,
                    is_broadcast: false,
                    offer_id: row.dataValues.id,
                    job_id: row.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [row.dataValues.jobber_id]);
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getLastOffer: function (req, res) {
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['users'].findOne({
            raw: true,
            attributes: ['hourly_price'],
            where: {
                id: user_id
            }
        }).then((user) => {
            if (!user)
                return res.status(500).json({result: "error", errorCode: 3});
            return res.status(200).json({result: "success", price: user.hourly_price === 0?null:user.hourly_price}).end();
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },
};
