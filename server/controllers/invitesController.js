const moment = require('moment');
const Sequelize = require('sequelize');
const { omit } = require('lodash');
const Op = Sequelize.Op;
const notificationController = require('./notificationController');
const models = require('../models');
const { functions } = require('../../utils');

module.exports = {
    createInvite: function (req, res) {
        const { job_id, receiver_ids, schedule_ids } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        if (!job_id) {
            return res.status(500).json({result: "error", errorCode: 10});
        } else if (!receiver_ids) {
            return res.status(500).json({result: "error", errorCode: 11});
        }

        return models['jobs'].findOne({
            where: {
                id: job_id
            }
        }).then((job) => {
            if (!job)
                return res.status(500).json({result: "error", errorCode: 3});
            return models['invites'].findAll({
                raw: true,
                attributes: ['id', 'receiver_id', 'schedule_ids'],
                where: {
                    job_id,
                    sender_id: user_id,
                    receiver_id: {
                        [Op.in]: receiver_ids
                    },
                    deleted_at: null
                }
            }).then(async(invites) => {
                //get invites that started contracts OR already have offer
                const invite_ids = invites.map(el=>el.id);
                let jobber_ids = [];
                if(invite_ids && invite_ids.length > 0){
                    //const offers = await models['offers'].findAll({invite_id: invite_ids, contract_id: {[Op.ne]: null}});
                    const offers = await models['offers'].findAll({invite_id: invite_ids});
                    jobber_ids = offers.map(el=>el.jobber_id);
                }

                //remove user ids that started contract OR already have offer
                let new_receivers = [];
                for(let ri = 0; ri < receiver_ids.length; ri += 1) {
                    const is_exist = jobber_ids.find(el=>el === receiver_ids[ri]);
                    if(!is_exist)
                        new_receivers.push(receiver_ids[ri]);
                }

                for (let i = 0; i < invites.length; i ++) {
                    new_receivers = new_receivers.filter(el=>el != invites[i].receiver_id);
                    if(receiver_ids.includes(invites[i].receiver_id)){
                        let new_schedule = invites[i].schedule_ids;
                        for(let si = 0; si < schedule_ids.length; si += 1) {
                            if(!new_schedule.includes(schedule_ids[si]))
                                new_schedule.push(schedule_ids[si]);
                        }
                        new_schedule = functions.remove_duplicates(new_schedule);

                        models['invites'].update({
                            schedule_ids: new_schedule,
                            status: 1
                        },{
                            where: {
                                job_id: job_id,
                                sender_id: user_id,
                                receiver_id: invites[i].receiver_id,
                                deleted_at: null
                            }
                        });
                        const notification = {
                            sender_id: user_id,
                            receiver_id: invites[i].receiver_id,
                            type: 7,
                            title: '',
                            description: `${req.session.user.first_name} ${req.session.user.last_name} invited you to a job - ${job.dataValues.title}.`,
                            is_broadcast: false,
                            invite_id: invites[i].id,
                            job_id: job_id,
                            is_read: false
                        };

                        notificationController.createNotification(notification, invites[i].receiver_id);
                    }
                }
                for (let i = 0; i < new_receivers.length; i ++) {
                    const data = {
                        job_id: job_id,
                        sender_id: user_id,
                        receiver_id: new_receivers[i],
                        status: 1,
                        schedule_ids: schedule_ids
                    };
                    const invite = await models['invites'].create(data);

                    const notification = {
                        sender_id: user_id,
                        receiver_id: data.receiver_id,
                        type: 7,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} invited you to a job - ${job.dataValues.title}.`,
                        is_broadcast: false,
                        invite_id: invite.dataValues.id,
                        job_id: job_id,
                        is_read: false
                    };

                    notificationController.createNotification(notification, new_receivers[i]);
                }

                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteById: function (req, res) {
        const id = req.params.id;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['invites'].findOne({
            where: {
                id: id,
                sender_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            row.update({
                deleted_at: moment()
            }).then(() => {
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getReceivedInvite: function (req, res) {
        const { job_id } = req.query;
        let val_where = {};
        if (job_id) {
            val_where.job_id = job_id;
        }
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        val_where.receiver_id = user_id;
        val_where.status = 1;
        val_where.deleted_at = null;
        return models['invites'].findAll({
            where: val_where,
            include: [{
                model: models['jobs'],
                as: 'job'
            }, {
                model: models['users'],
                attributes: ['id', 'first_name', 'last_name', 'avatar', 'company'],
                as: 'sender'
            }],
            order: [['updatedAt', 'DESC']],
        }).then(rows => {
            if (!rows || rows.length === 0) {
                if (job_id) {
                    return res.status(200).json({result: "success", invite: {}}).end();
                } else {
                    return res.status(200).json({result: "success", invites: []}).end();
                }
            }
            if (job_id) {
                if (rows[0].dataValues.job && rows[0].dataValues.job.category) {
                    rows[0].dataValues.job.category = rows[0].dataValues.job.category[0];
                }
                rows[0].dataValues.job.avatar = functions.convertLocalToPublic(rows[0].dataValues.job.avatar);
                rows[0].dataValues.sender.avatar = functions.convertLocalToPublic(rows[0].dataValues.sender.avatar);
                return res.status(200).json({result: "success", invite: rows[0]});
            } else {
                for(let i = 0; i < rows.length; i += 1){
                    if (rows[i].dataValues.job && rows[i].dataValues.job.category) {
                        rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                    }
                    rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                    rows[i].dataValues.sender.avatar = functions.convertLocalToPublic(rows[i].dataValues.sender.avatar);
                }
                return res.status(200).json({result: "success", invites: rows});
            }

        }).catch(error => console.error(error) || res.status(500).json({result: "success", errorCode: 0}).end());
    },

    getSentInvite: function (req, res) {
        const { job_id } = req.query;
        let val_where = {};
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        if (job_id) {
            val_where.job_id = job_id;
        }

        val_where.sender_id = user_id;
        val_where.status = 1;
        val_where.deleted_at = null;

        return models['invites'].findAll({
            where: val_where,
            include: [{
                model: models['users'],
                attributes: [
                    "id", "first_name", "last_name", "avatar", "company",
                    [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "receiver"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM jobs WHERE jobs.is_completed = true AND jobs.owner_id ="receiver"."id" AND jobs.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "receiver"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "receiver"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                ],
                as: 'receiver'
            }],
            order: [['id', 'DESC']],
        }).then(async(rows) => {
            if (!rows) {
                return res.status(200).json({result: "success", invites: []}).end();
            }
            const length = rows.length;
            for(let i = 0; i < length; i += 1){
                if (rows[i].dataValues.job && rows[i].dataValues.job.category) {
                    rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                }
                rows[i].dataValues.receiver = rows[i].dataValues.receiver.dataValues;
                rows[i].dataValues.receiver.review = {
                    score: rows[i].dataValues.receiver.score,
                    number_of_completed: rows[i].dataValues.receiver.number_of_completed,
                    number_of_feedback: rows[i].dataValues.receiver.number_of_feedback,
                    number_of_success: rows[i].dataValues.receiver.number_of_success,
                };
                rows[i].dataValues.receiver = omit(rows[i].dataValues.receiver, ['number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
                if(rows[i].dataValues.schedule_ids && rows[i].dataValues.schedule_ids.length > 0) {
                    try {
                        const schedules = await models['schedules']
                            .findAll({
                                where: {
                                    id: {
                                        [Op.in]: rows[i].dataValues.schedule_ids
                                    }
                                },
                                include: [{
                                    model: models['times'],
                                    as: 'time_field',
                                    attributes: ['from', 'to']
                                }]
                            });
    
                        rows[i].dataValues.schedules = schedules;
                        
                    }catch(err) {
                        console.log(err);
                    }    
                }else {
                    rows[i].dataValues.schedules = [];
                }

                rows[i].dataValues.receiver.avatar = functions.convertLocalToPublic(rows[i].dataValues.receiver.avatar);
            }
            return res.status(200).json({result: "success", invites: rows});
        }).catch(error => console.error(error) || res.status(500).json({result: "success", errorCode: 0}).end());
    },

    getInvites: function (req, res) {
        const { job_id, limit, lastValue } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        if (job_id) {
            return models['invites'].findAll({
                where: {
                    job_id: job_id,
                    sender_id: user_id,
                    status: 1,
                    deleted_at: null
                },
                include: [{
                    model: models['jobs'],
                    as: 'job'
                }, {
                    model: models['users'],
                    attributes: ['id', 'first_name', 'last_name', 'avatar', 'company'],
                    as: 'sender'
                }],
            }).then((rows) => {
                for(let i = 0; i < rows.length; i += 1){
                    if (rows[i].dataValues.job && rows[i].dataValues.job.category) {
                        rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                    }
                    rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                    rows[i].dataValues.sender.avatar = functions.convertLocalToPublic(rows[i].dataValues.sender.avatar);
                }
                return res.status(200).json({result: "success", invites: rows})
            }).catch(error=> console.error(error) || res.status(500).json({result: "success", errorCode: 0}).end());
        } else {
            let opt = {
                attributes: ["id"],
                where: {
                    [Op.or] : {
                        sender_id: user_id,
                        receiver_id: user_id
                    },
                    status: 1,
                    deleted_at: null
                },
                include: [{
                    attributes: ["id", "avatar", "title", "price", "is_hourly", "address", "place_name", "latitude", "longitude",
                        [Sequelize.literal('(SELECT COUNT(*) FROM offers WHERE offers.job_id = invites.job_id AND offers.deleted_at IS NULL)'), 'number_of_offers']
                    ],
                    model: models['jobs'],
                    as: 'job'
                }, {
                    model: models['users'],
                    attributes: ['id', 'first_name', 'last_name', 'company'],
                    as: 'sender'
                }],
                order: [['id', 'DESC']],
                limit: limit
            };
            if (lastValue) {
                opt.where.id = {
                    [Op.lt]: lastValue
                };
            }

            return models['invites'].findAll(opt).then((rows) => {
                for (let i = 0; i < rows.length; i ++) {
                    rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                    if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                        rows[i].dataValues.job.dataValues.location = {
                            address: rows[i].dataValues.job.address,
                            place_name: rows[i].dataValues.job.place_name,
                            latitude: rows[i].dataValues.job.latitude,
                            longitude: rows[i].dataValues.job.longitude
                        };
                    }
                    rows[i].dataValues.job.dataValues = omit(rows[i].dataValues.job.dataValues, ['address', 'place_name', 'latitude', 'longitude']);
                }
                return res.status(200).json({result: "success", invites: rows, lastValue: rows.length? rows[rows.length - 1].dataValues.id : null});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }
    },

    getInviteById: function (req, res) {
        const { id } = req.params;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['invites'].findByPk(id, {
            attributes: [],
            include: [{
                model: models['jobs'],
                attributes: ["id", "title", "description", "category", "avatar", "is_public", "is_urgent", "is_assigned", "is_completed"],
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
            }],
        }).then(async (row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            if (row.dataValues.job && row.dataValues.job.category) {
                row.dataValues.job.category = row.dataValues.job.category[0];
            }
            row.dataValues.job.dataValues.schedules = await models['schedules'].findAll({
                attributes: ["id", "name"],
                where: {
                    job_id: row.dataValues.job.id,
                    deleted_at: null
                },
                include: [{
                    model: models['times'],
                    as: 'time_field',
                    attributes: ['from', 'to']
                }]
            });
            row.dataValues.job.user.avatar = functions.convertLocalToPublic(row.dataValues.job.user.avatar);

            let assignees = await models['offers'].findAll({
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
                        'id', "first_name", "last_name", "avatar",
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
            for (let i = 0; i < assignees.length; i ++) {
                assignees[i].dataValues.jobber.avatar = functions.convertLocalToPublic(assignees[i].dataValues.jobber.avatar);
            }
            row.dataValues.job.dataValues.assignees = assignees;

            return res.status(200).json({result: "success", invite: row});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateInvite: function (req, res) {
        const id = req.params.id,
            { status } = req.body,
            sender_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['invites'].findOne({
            where: {
                id, sender_id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            row.update({
                status: status,
                updatedAt: moment()
            }).then(() => {
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    declineInvite: function (req, res) {
        const { id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['invites'].findOne({
            where: {
                id: id,
                receiver_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            row.update({
                status: 4
            }).then(() => {
                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.sender_id,
                    type: 8,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} declined your invitation.`,
                    is_broadcast: false,
                    invite_id: row.dataValues.id,
                    job_id: row.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, row.dataValues.sender_id);
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },
};
