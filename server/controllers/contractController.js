const Moment  = require('moment');
const { extendMoment } = require('moment-range');
const moment = extendMoment(Moment);
const notificationController = require('./notificationController');
const paymentController = require('./paymentController');
const {time, functions} = require('../../utils');
const { omit } = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require("../models");

const models = require('../models');

module.exports = {
    createContract: function (req, res) {

        const { offer_id, payment_method_id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        if (!offer_id)
            return res.status(500).json({result: "error", errorCode: 1});

        return models['offers'].findOne({
            where: {
                id: offer_id,
                status: 1,
                deleted_at: null
            },
            include: [{
                model: models['jobs'],
                as: 'job'
            }]
        }).then(async(row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            if (row.dataValues.job.owner_id !== user_id)
                return res.status(500).json({result: "error", errorCode: 1});

            let data = {
                hirer_id: user_id,
                read_hirer: false,
                read_jobber: false,
                offer_id: offer_id,
                jobber_id: row.dataValues.jobber_id,
                schedule_ids: row.dataValues.schedule_ids,
                job_id: row.dataValues.job_id,
                price: row.dataValues.price,
                is_hourly: row.dataValues.is_hourly
            };

            const exisitngContract = await models['contracts'].findOne({
                where: {
                     offer_id: offer_id,
                     hirer_id: user_id,
                     jobber_id: row.dataValues.jobber_id,
                     deleted_at: null
                }
            })
            // if(row.dataValues.schedule_ids){
            //     data.schedule_ids = row.dataValues.schedule_ids;
            //     const contracts = await models['contracts'].findAll({
            //         raw: true,
            //         where: {
            //             jobber_id: row.dataValues.jobber_id
            //         }
            //     });
            //     let contract_schedules = [];
            //     for(let i = 0; i < contracts.length; i += 1) {
            //         contract_schedules = contract_schedules.concat(contracts[i].schedule_ids);
            //     }
            //     const schedule_times = await models['times'].findAll({
            //         raw: true,
            //         where: {
            //             schedule_id: {
            //                 [Op.in]: data.schedule_ids
            //             }
            //         }
            //     });
            //     const all_schedule_times = await models['times'].findAll({
            //         raw: true,
            //         where: {
            //             schedule_id: {
            //                 [Op.in]: contract_schedules
            //             }
            //         }
            //     });

            //     for(let j = 0; j < all_schedule_times.length; j += 1) {
            //         for(let k = 0; k < schedule_times.length; k += 1) {
            //             const range = moment.range(all_schedule_times[j].from, all_schedule_times[j].to);
            //             if(range.contains(schedule_times[k].from) || range.contains(schedule_times[k].to))
            //                 return res.status(500).json({result: "error", errorCode: 59});
            //         }
            //     }
            // }
            // let updateContarctData = {}
            let newScheduleToUpdate;
            if(exisitngContract) {
               let newScheduleIds = exisitngContract.schedule_ids.concat(row.dataValues.schedule_ids) 
               newScheduleToUpdate = functions.remove_duplicates(newScheduleIds);
            }

            const t = await db.sequelize.transaction();

            return Promise.all([ exisitngContract ? models['contracts'].update({
                schedule_ids: newScheduleToUpdate,
            }, {
                where: {
                    id: exisitngContract.id
                },
                returning: true,
                plain: true
            }) : models['contracts'].create(data),
                models['jobs'].update({
                    is_completed: false,
                    is_assigned: true
                }, {
                    where: {
                        id: row.dataValues.job_id
                    }
                })
            ]).then(async([contract]) => {
                contract = exisitngContract ? contract[1] : contract
                if (row.dataValues.job.is_urgent) {
                    try {
                        let result = await paymentController.purchaseSOSUrgentJob(user_id, row.jobber_id, contract.dataValues.job_id, payment_method_id);
                        
                        if (result.status === -1) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 53});//not payment
                        } else if (result.status === -2) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 54});//insufficient
                        } else if (result.status === -3) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 56});//no payout bank
                        } else if (result.status === -4) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 57});//destination account does not have transfer capabilities enabled
                        }
                    } catch(err) {
                        console.error(err);
                        await t.rollback();
                        return res.status(500).json({result: "error", errorCode: 0});
                    }
                }

                await t.commit();

                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.jobber_id,
                    type: 12,
                    title: "Congratulations!",
                    description: `${req.session.user.first_name} ${req.session.user.last_name} hired you for - ${row.dataValues.job.title}.`,
                    is_broadcast: false,
                    contract_id: contract.dataValues.id,
                    job_id: contract.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [row.dataValues.jobber_id]);
                row.update({status: 2, contract_id: contract.dataValues.id});

                return res.status(200).json({result: "success", contract});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    createContractTest: function (req, res) {
        const { offer_id, payment_method_id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        if (!offer_id)
            return res.status(500).json({result: "error", errorCode: 1});

        return models['offers'].findOne({
            where: {
                id: offer_id,
                status: 1,
                deleted_at: null
            },
            include: [{
                model: models['jobs'],
                as: 'job'
            }]
        }).then(async(row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            if (row.dataValues.job.owner_id !== user_id)
                return res.status(500).json({result: "error", errorCode: 1});

            let data = {
                hirer_id: user_id,
                read_hirer: false,
                read_jobber: false,
                offer_id: offer_id,
                jobber_id: row.dataValues.jobber_id,
                schedule_ids: row.dataValues.schedule_ids,
                job_id: row.dataValues.job_id,
                price: row.dataValues.price,
                is_hourly: row.dataValues.is_hourly
            };

            const exisitngContract = await models['contracts'].findOne({
                where: {
                     offer_id: offer_id,
                     hirer_id: user_id,
                     jobber_id: row.dataValues.jobber_id,
                     deleted_at: null
                }
            })
            let newScheduleToUpdate;
            if(exisitngContract) {
               let newScheduleIds = exisitngContract.schedule_ids.concat(row.dataValues.schedule_ids) 
               newScheduleToUpdate = functions.remove_duplicates(newScheduleIds);
            }

            const t = await db.sequelize.transaction();

            return Promise.all([ exisitngContract ? models['contracts'].update({
                schedule_ids: newScheduleToUpdate,
            }, {
                where: {
                    id: exisitngContract.id
                },
                returning: true,
                plain: true
            }) : models['contracts'].create(data),
                models['jobs'].update({
                    is_completed: false,
                    is_assigned: true
                }, {
                    where: {
                        id: row.dataValues.job_id
                    }
                })
            ]).then(async([contract]) => {
                contract = exisitngContract ? contract[1] : contract
                if (row.dataValues.job.is_urgent) {
                    try {
                        let result = await paymentController.purchaseSOSUrgentJobTest(user_id, row.jobber_id, contract.dataValues.job_id, payment_method_id);
                        
                        if (result.status === -1) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 53});//not payment
                        } else if (result.status === -2) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 54});//insufficient
                        } else if (result.status === -3) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 56});//no payout bank
                        } else if (result.status === -4) {
                            await t.rollback();
                            return res.status(500).json({result: result.error, errorCode: 57});//destination account does not have transfer capabilities enabled
                        }
                    } catch(err) {
                        console.error(err);
                        await t.rollback();
                        return res.status(500).json({result: "error", errorCode: 0});
                    }
                }

                await t.commit();

                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.jobber_id,
                    type: 12,
                    title: "Congratulations!",
                    description: `${req.session.user.first_name} ${req.session.user.last_name} hired you for - ${row.dataValues.job.title}.`,
                    is_broadcast: false,
                    contract_id: contract.dataValues.id,
                    job_id: contract.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [row.dataValues.jobber_id]);
                row.update({status: 2, contract_id: contract.dataValues.id});

                return res.status(200).json({result: "success", contract});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getContracts: function (req, res) {
        const { job_id, limit, lastValue } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        console.log(job_id, 'get contracts')
        let val_where = job_id ? {
            deleted_at: null,
            [Op.or]: [{
                hirer_id: user_id,
            }, {
                jobber_id: user_id,
            }]
        } : {
            deleted_at: null,
            [Op.or]: [{
                hirer_id: user_id,
                archive_hirer: false
            }, {
                jobber_id: user_id,
                archive_jobber: false
            }]
        };

        let val_where_update = job_id ? {
            [Op.or]: [{
                hirer_id: user_id
            }, {
                jobber_id: user_id
            }]
        } : {
            [Op.or]: [{
                hirer_id: user_id,
                archive_hirer: false
            }, {
                jobber_id: user_id,
                archive_jobber: false
            }]
        };

        if(job_id) {
            val_where.job_id = job_id;
            val_where_update.job_id = job_id;
        }

        if (lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            };
        }
        
        return Promise.all([
            models['contracts'].findAll({
                where: val_where,
                include: [{
                    attributes: ["id", "first_name", "last_name", "avatar",
                        [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id ="jobber"."id" OR contracts.hirer_id ="jobber"."id") AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']],
                    model: models['users'],
                    as: 'jobber'
                }, {
                    attributes: ["id", "first_name", "last_name", "avatar",
                        [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "hirer"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id ="hirer"."id" OR contracts.hirer_id ="hirer"."id") AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "hirer"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                        [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "hirer"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']],
                    model: models['users'],
                    as: 'hirer'
                }, {
                    attributes: ["id", "title", "due_date", "price", "description", "avatar", "is_hourly", "is_urgent", "is_public", "is_completed"],
                    model: models['jobs'],
                    as: 'job'
                }, {
                    model: models['feedbacks'],
                    as: 'feedbacks'
                }],
                limit,
                order: [
                    ['id', 'DESC']
                ],
            }),

        ]).then(async([rows]) => {
            for(let i = 0; i < rows.length; i += 1) {
                if (rows[i].dataValues.hirer_id === user_id) {
                    rows[i].dataValues.has_updates = !rows[i].dataValues.read_hirer;
                } else if (rows[i].dataValues.jobber_id === user_id) {
                    rows[i].dataValues.has_updates = !rows[i].dataValues.read_jobber;
                }

                rows[i].dataValues.jobber.dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.jobber.dataValues.avatar);
                rows[i].dataValues.hirer.dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.hirer.dataValues.avatar);
                rows[i].dataValues.job.dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.dataValues.avatar);

                const jobber_review = {
                    score: rows[i].dataValues.jobber.dataValues.score,
                    number_of_completed: rows[i].dataValues.jobber.dataValues.number_of_completed,
                    number_of_feedback: rows[i].dataValues.jobber.dataValues.number_of_feedback,
                    number_of_success: rows[i].dataValues.jobber.dataValues.number_of_success,
                };

                const hirer_review = {
                    score: rows[i].dataValues.hirer.dataValues.score,
                    number_of_completed: rows[i].dataValues.hirer.dataValues.number_of_completed,
                    number_of_feedback: rows[i].dataValues.hirer.dataValues.number_of_feedback,
                    number_of_success: rows[i].dataValues.hirer.dataValues.number_of_success,
                };

                rows[i].dataValues.hirer.dataValues = omit(rows[i].dataValues.hirer.dataValues, ['number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
                rows[i].dataValues.jobber.dataValues = omit(rows[i].dataValues.jobber.dataValues, ['number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);

                rows[i].dataValues.hirer.dataValues.review = hirer_review;
                rows[i].dataValues.jobber.dataValues.review = jobber_review;

                const schedule_ids = rows[i].dataValues.schedule_ids;
                const schedules = await models['schedules'].findAll({
                    where:{
                        id: schedule_ids
                    }
                });
                rows[i].dataValues.schedules = schedules;

                if (job_id) {
                    const selectedContract = await models['contracts'].findOne({
                        where: {
                            id: rows[i].dataValues.id
                        }
                    });
                    if (rows[i].dataValues.jobber_id === user_id) {
                        rows[i].dataValues.read_jobber = true;
                        
                        await selectedContract.update({read_hirer: true});
                    } else if (rows[i].dataValues.hirer_id === user_id) {
                        rows[i].dataValues.read_hirer = true;
                        
                        await selectedContract.update({read_hirer: true});
                    }
                }
            }
            
            let retVal = {result: "success", contracts: rows};
            if(!job_id) {
                retVal.lastValue = rows.length ? "" + rows[rows.length - 1].id : null;
            }
            return res.status(200).json(retVal);
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getContractById: function (req, res) {
        const { id } = req.params;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return Promise.all([
            models['contracts'].findOne({
                where: {
                    id: id,
                    deleted_at: null,
                    [Op.or]: [{
                        hirer_id: user_id,
                    }, {
                        jobber_id: user_id,
                    }]
                },
                include: [{
                    attributes: ["id", "first_name", "last_name", "avatar", "company"],
                    model: models['users'],
                    as: 'jobber'
                }, {
                    attributes: ["id", "first_name", "last_name", "avatar", "company"],
                    model: models['users'],
                    as: 'hirer'
                }, {
                    attributes: ["id", "title", "due_date", "price", "description", "avatar", "is_hourly", "is_urgent", "is_public", "is_completed", "is_assigned", "is_closed", "latitude", "longitude", "address", "place_name"],
                    model: models['jobs'],
                    as: 'job'
                }, {
                    model: models['feedbacks'],
                    as: 'feedbacks'
                }]
            }),
            models['contracts'].update({
                read_hirer: true,
            }, {
                where: {
                    id,
                    deleted_at: null,
                    hirer_id: user_id
                }
            }),
            models['contracts'].update({
                read_jobber: true
            }, {
                where: {
                    id,
                    deleted_at: null,
                    jobber_id: user_id
                }
            })
        ]).then(([row]) => {
            if(!row){
                return res.status(500).json({result: "error", errorCode: 3}).end();
            }

            row.dataValues.jobber.avatar = functions.convertLocalToPublic(row.dataValues.jobber.avatar);
            row.dataValues.job.avatar = functions.convertLocalToPublic(row.dataValues.job.avatar);
            row.dataValues.hirer.avatar = functions.convertLocalToPublic(row.dataValues.hirer.avatar);
            row.dataValues.job.dataValues.location = {
                address: row.dataValues.job.address,
                place_name: row.dataValues.job.place_name,
                latitude: row.dataValues.job.latitude,
                longitude: row.dataValues.job.longitude
            };
            row.dataValues.job.dataValues = omit(row.dataValues.job.dataValues, ['address', 'place_name', 'latitude', 'longitude']);
            notificationController.getBadgeCounts([user_id]);
            const schedule_ids = row.dataValues.schedule_ids;
            return models['schedules'].findAll({
                where:{
                    id: schedule_ids
                }
            }).then((schedules) => {
                row.dataValues.schedules = schedules;
                return res.status(200).json({result: "success", contract: row});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateContract: function (req, res) {
        const { id } = req.params,
            data = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['contracts'].findOne({
            where: {
                id: id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            row.update(data).then(() => {
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteContract: function (req, res) {
        const id = req.params.id;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['contracts'].findOne({
            where: {
                id: id,
                hirer_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            row.destroy().then(() => {
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    closeContract: function (req, res) {
        const { id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['contracts'].findOne({
            where: {
                id,
                closed_by: null,
                closed_at: null,
                deleted_at: null
            },
            include: [{
                attributes: ['title'],
                model: models['jobs'],
                as: 'job'
            }]
        }).then((row) => {
            if (!row) {
                return res.status(500).json({result: "error", errorCode: 3});
            } else if (row.dataValues.hirer_id !== user_id && row.dataValues.jobber_id !== user_id) {
                return res.status(500).json({result: "error", errorCode: 1});
            }

            let update_query = {
                closed_by: user_id,
                closed_at: moment()
            };
            if (row.dataValues.hirer_id === user_id) {
                update_query.read_hirer = false;
            } else {
                update_query.read_jobber = false;
            }

            const hirer_id = row.dataValues.hirer_id;

            return row.update(update_query).then(() => {
                return models['contracts'].findAll({
                    where: {
                        job_id: row.dataValues.job_id,
                        closed_by: null,
                        closed_at: null,
                        deleted_at: null
                    }
                }).then(rows => {
                    if (rows.length === 0 && hirer_id === user_id) {
                        models['jobs'].update({
                            is_completed: true,
                            updatedAt: new Date(),
                        }, {
                            where: {
                                id: row.dataValues.job_id
                            }
                        });
                    }

                    let notification = {
                        sender_id: user_id,
                        type: 13,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} closed contract for - ${row.dataValues.job.title}.`,
                        is_broadcast: false,
                        contract_id: row.dataValues.id,
                        job_id: row.dataValues.job_id,
                        is_read: false
                    };

                    if (row.dataValues.hirer_id === user_id) {
                        notification.receiver_id = row.dataValues.jobber_id
                    } else {
                        notification.receiver_id = row.dataValues.hirer_id
                    }
                    notificationController.createNotification(notification, [notification.receiver_id]);

                    return res.status(200).json({result: "success"});
                }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    archiveContract: function (req, res) {
        const { id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['contracts'].findOne({
            where: {
                id,
                deleted_at: null
            }
        }).then((row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3});

            if (row.hirer_id !== user_id && row.jobber_id !== user_id)
                return res.status(500).json({result: "error", errorCode: 1});

            const data = {};
            if (row.hirer_id === user_id) {
                data.archive_hirer = true;
            } else if (row.jobber_id === user_id) {
                data.archive_jobber = true;
            }

            row.update(data).then(() => {
                return res.status(200).json({result: "success"});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    closeContractAll: function (req, res) {
        const { job_id, need_purchase } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['jobs'].findByPk(job_id).then(async(job) => {
            if (!job) {
                return res.status(500).json({result: "error", errorCode: 10});
            } else if (job.owner_id !== user_id) {
                return res.status(500).json({result: "error", errorCode: 20});
            }

            const t = await db.sequelize.transaction();

            return models['contracts'].findAll({
                where: {
                    job_id,
                    hirer_id: user_id,
                    closed_by: null,
                    closed_at: null,
                    deleted_at: null
                }
            }).then(async (rows) => {
                let sos_payment_status = "";

                for (let i = 0; i < rows.length; i ++) {
                    if (need_purchase) {
                        const result = await paymentController.payoutSOSUrgentToJobber(rows[i].jobber_id, job_id, true);
                        
                        if (result.status !== 1) {                            
                            sos_payment_status += result.error + ", ";
                        }
                    }
                    await rows[i].update({
                        closed_by: user_id,
                        closed_at: moment(),
                        read_jobber: false
                    });
                    let notification = {
                        sender_id: user_id,
                        receiver_id: rows[i].jobber_id,
                        type: 13,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} closed contract for - ${job.title}.`,
                        is_broadcast: false,
                        contract_id: rows[i].id,
                        job_id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [notification.receiver_id]);
                }

                if (sos_payment_status !== "") {
                    await t.rollback();
                    
                    return res.status(500).json({result: sos_payment_status + " error sos3", errorCode: 0}).end();
                }

                await job.update({
                    is_completed: true,
                    updatedAt: new Date(),
                });

                await t.commit();

                return res.status(200).json({result: "success"});
            }).catch(error => {
                console.error(error);
                res.status(500).json({result: error + " error sos1", errorCode: 0}).end();
            });
        }).catch(error => {
            console.error(error);
            res.status(500).json({result: error + " error sos2", errorCode: 0}).end();
        });
    },

    closeContractAllTest: function (req, res) {
        const { job_id, need_purchase } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['jobs'].findByPk(job_id).then(async(job) => {
            if (!job) {
                return res.status(500).json({result: "error", errorCode: 10});
            } else if (job.owner_id !== user_id) {
                return res.status(500).json({result: "error", errorCode: 20});
            }

            const t = await db.sequelize.transaction();

            return models['contracts'].findAll({
                where: {
                    job_id,
                    hirer_id: user_id,
                    closed_by: null,
                    closed_at: null,
                    deleted_at: null
                }
            }).then(async (rows) => {
                let sos_payment_status = "";

                for (let i = 0; i < rows.length; i ++) {
                    if (need_purchase) {
                        const result = await paymentController.payoutSOSUrgentToJobberTest(rows[i].jobber_id, job_id, true);
                        
                        if (result.status !== 1) {                            
                            sos_payment_status += result.error + ", ";
                        }
                    }
                    await rows[i].update({
                        closed_by: user_id,
                        closed_at: moment(),
                        read_jobber: false
                    });
                    let notification = {
                        sender_id: user_id,
                        receiver_id: rows[i].jobber_id,
                        type: 13,
                        title: '',
                        description: `${req.session.user.first_name} ${req.session.user.last_name} closed contract for - ${job.title}.`,
                        is_broadcast: false,
                        contract_id: rows[i].id,
                        job_id,
                        is_read: false
                    };
                    notificationController.createNotification(notification, [notification.receiver_id]);
                }

                if (sos_payment_status !== "") {
                    await t.rollback();
                    
                    return res.status(500).json({result: sos_payment_status + " error sos3", errorCode: 0}).end();
                }

                await job.update({
                    is_completed: true,
                    updatedAt: new Date(),
                });

                await t.commit();

                return res.status(200).json({result: "success"});
            }).catch(error => {
                console.error(error);
                res.status(500).json({result: error + " error sos1", errorCode: 0}).end();
            });
        }).catch(error => {
            console.error(error);
            res.status(500).json({result: error + " error sos2", errorCode: 0}).end();
        });
    },

    archiveContractAll: function (req, res) {
        const { job_id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return Promise.all([
            models['contracts'].update(
                {archive_hirer: true},
                {
                    where: {
                        hirer_id: user_id,
                        job_id: job_id,
                        closed_by: {
                            [Op.ne]: null
                        },
                        closed_at: {
                            [Op.ne]: null
                        },
                        deleted_at: null
                    }
                }
            ),
            models['contracts'].update(
                {archive_jobber: true},
                {
                    where: {
                        jobber_id: user_id,
                        job_id: job_id,
                        deleted_at: null
                    }
                }
            ),
        ]).then(() => {
            return res.status(200).json({result: "success"});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    addScheduleToContract: function (req, res) {
        const { schedule_ids, contract_id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        
        return models['contracts'].findOne({
            where: {
                id: contract_id,
                hirer_id: user_id,
                deleted_at: null
            }
        }).then((row) => {
            let old_schedule_ids = row.dataValues.schedule_ids;
            const new_schedule_ids = old_schedule_ids?functions.merge_array(old_schedule_ids, schedule_ids):schedule_ids;

            return row.update({
                schedule_ids: new_schedule_ids,
                read_jobber: false
            }).then(() => {
                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.jobber_id,
                    type: 22,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} assigned you to new schedule.`,
                    is_broadcast: false,
                    contract_id: row.dataValues.id,
                    job_id: row.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [row.dataValues.jobber_id]);
                return res.status(200).json({result: 'success'});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    removeScheduleFromContract: function (req, res) {
        const { schedule_ids, contract_id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        return models['contracts'].findOne({
            where: {
                hirer_id: user_id,
                id: contract_id,
                deleted_at: null
            }
        }).then((row) => {
            let old_schedule_ids = row.dataValues.schedule_ids;
            let new_schedule_ids = []
            if(old_schedule_ids && old_schedule_ids.length > 0)
                new_schedule_ids = functions.remove_from_array(old_schedule_ids, schedule_ids);
            row.update({
                schedule_ids: new_schedule_ids.length > 0?new_schedule_ids:null,
                read_jobber: false
            }).then(() => {
                const notification = {
                    sender_id: user_id,
                    receiver_id: row.dataValues.jobber_id,
                    type: 23,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} unassigned you from a schedule.`,
                    is_broadcast: false,
                    contract_id: row.dataValues.id,
                    job_id: row.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [row.dataValues.jobber_id]);
                return res.status(200).json({result: 'success'});
            }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getArchivedContracts: function (req, res) {
        const { limit, lastValue } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models.sequelize.query(
            `SELECT * FROM (
                SELECT DISTINCT ON (job_id) job_id AS "job_id",
                "contracts"."id", "contracts"."hirer_id", "contracts"."jobber_id", "contracts"."read_hirer", "contracts"."read_jobber", "contracts"."price", "contracts"."is_hourly", "contracts"."due_date", "contracts"."closed_at", "contracts"."createdAt",
                "job"."id" AS "job.id", "job"."avatar" AS "job.avatar", "job"."title" AS "job.title", "job"."is_urgent" AS "job.is_urgent", "job"."is_public" AS "job.is_public",
                "hirer"."id" AS "hirer.id", "hirer"."first_name" AS "hirer.first_name", "hirer"."last_name" AS "hirer.last_name", "hirer"."company" AS "hirer.company", "hirer"."avatar" AS "hirer.avatar",
                "jobber"."id" AS "jobber.id", "jobber"."first_name" AS "jobber.first_name", "jobber"."last_name" AS "jobber.last_name", "jobber"."company" AS "jobber.company", "jobber"."avatar" AS "jobber.avatar"
                FROM "contracts" AS "contracts"
                LEFT OUTER JOIN "jobs" AS "job" ON "contracts"."job_id" = "job"."id"
                LEFT OUTER JOIN "users" AS "hirer" ON "contracts"."hirer_id" = "hirer"."id"
                LEFT OUTER JOIN "users" AS "jobber" ON "contracts"."jobber_id" = "jobber"."id"
                WHERE (("contracts"."hirer_id" = ${user_id} AND "contracts"."archive_hirer" = true) OR ("contracts"."jobber_id" = ${user_id} AND "contracts"."archive_jobber" = true))
                AND "contracts"."deleted_at" IS NULL
            ) t ${lastValue ? `WHERE id < ${lastValue} ` : ''}ORDER BY id DESC LIMIT ${limit};`).then(async (rows) => {
            const contracts = rows[0];
            for (let i = 0; i < contracts.length; i ++) {
                if (contracts[i].hirer_id === user_id) {
                    contracts[i].has_updates = !contracts[i].read_hirer;
                } else if (contracts[i].jobber_id === user_id) {
                    contracts[i].has_updates = !contracts[i].read_jobber;
                }
                contracts[i].job = {
                    id: contracts[i]['job.id'],
                    avatar: functions.convertLocalToPublic(contracts[i]['job.avatar']),
                    title: contracts[i]['job.title'],
                    is_urgent: contracts[i]['job.is_urgent'],
                    is_public: contracts[i]['job.is_public']
                };
                contracts[i].hirer = {
                    id: contracts[i]['hirer.id'],
                    first_name: contracts[i]['hirer.first_name'],
                    last_name: contracts[i]['hirer.last_name'],
                    company: contracts[i]['hirer.company'],
                    avatar: functions.convertLocalToPublic(contracts[i]['hirer.avatar'])
                };
                contracts[i].jobber = {
                    id: contracts[i]['jobber.id'],
                    first_name: contracts[i]['jobber.first_name'],
                    last_name: contracts[i]['jobber.last_name'],
                    company: contracts[i]['jobber.company'],
                    avatar: functions.convertLocalToPublic(contracts[i]['jobber.avatar'])
                };
                contracts[i] = omit(contracts[i], ['read_hirer', 'read_jobber', 'job.id', 'job.avatar', 'job.title', 'job.is_urgent', 'job.is_public', 'hirer.id', 'hirer.first_name', 'hirer.last_name', 'hirer.company', 'hirer.avatar', 'jobber.id', 'jobber.first_name', 'jobber.last_name', 'jobber.company', 'jobber.avatar']);
            }
            return res.status(200).json({result: "success", contracts, lastValue: contracts.length ? "" + contracts[contracts.length - 1].id : null});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getContractByJobber: function (req, res) {
        const { jobId, jobberId } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        return models['contracts'].findOne({
            where: {
                job_id: jobId,
                jobber_id: jobberId
            },
            include: [{
                attributes: ["id", "first_name", "last_name", "avatar",
                    [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id ="jobber"."id" OR contracts.hirer_id ="jobber"."id") AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "jobber"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']],
                model: models['users'],
                as: 'jobber'
            }, {
                attributes: ["id", "first_name", "last_name", "avatar",
                    [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = "hirer"."id" AND feedbacks.deleted_at IS NULL)'), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id ="hirer"."id" OR contracts.hirer_id ="hirer"."id") AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "hirer"."id" AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = "hirer"."id" AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']],
                model: models['users'],
                as: 'hirer'
            }, {
                attributes: ["id", "title", "due_date", "price", "description", "avatar", "is_hourly", "is_urgent", "is_public"],
                model: models['jobs'],
                as: 'job'
            }, {
                model: models['feedbacks'],
                as: 'feedbacks'
            }],

        }).then(async(contract) => {
            if(contract) {
                contract.jobber.dataValues.avatar = functions.convertLocalToPublic(contract.jobber.dataValues.avatar);
                contract.hirer.dataValues.avatar = functions.convertLocalToPublic(contract.hirer.dataValues.avatar);
                contract.job.dataValues.avatar = functions.convertLocalToPublic(contract.job.dataValues.avatar);
    
                const jobber_review = {
                    score: contract.jobber.dataValues.score,
                    number_of_completed: contract.jobber.dataValues.number_of_completed,
                    number_of_feedback: contract.jobber.dataValues.number_of_feedback,
                    number_of_success: contract.jobber.dataValues.number_of_success,
                };
    
                const hirer_review = {
                    score: contract.hirer.dataValues.score,
                    number_of_completed: contract.hirer.dataValues.number_of_completed,
                    number_of_feedback: contract.hirer.dataValues.number_of_feedback,
                    number_of_success: contract.hirer.dataValues.number_of_success,
                };
    
                contract.hirer.dataValues = omit(contract.hirer.dataValues, ['number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
                contract.jobber.dataValues = omit(contract.jobber.dataValues, ['number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
    
                contract.hirer.dataValues.review = hirer_review;
                contract.jobber.dataValues.review = jobber_review;
    
                const schedule_ids = contract.dataValues.schedule_ids;
                const schedules = await models['schedules'].findAll({
                    where:{
                        id: schedule_ids
                    }
                });
                contract.dataValues.schedules = schedules;    
            }
            return res.status(200).json({result: "success", contract});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    findContractJobbers: function (req, res) {
        const { keyword, limit, lastValue } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        let val_where = {};
        if(lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            }
        }

        if(keyword) {
            val_where[Op.or] =  [
                {first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'ILIKE', '%' + keyword + '%')},
                {last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'ILIKE', '%' + keyword + '%')},
            ]
        }

        return models['users'].findAll({
            where: val_where,
            include: [{
                attributes: ["id"],
                model: models['contracts'],
                as: 'jobber_contracts',
                where: {
                    hirer_id: user_id
                }
            }],
            limit: limit
        }).then((rows) => {
            for(let i = 0; i < rows.length; i += 1) {
                rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
            }
            return res.status(200).json({result: "success", jobbers: rows});
        }).catch(error => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },    
};
