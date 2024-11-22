const { omit } = require('lodash');
const moment = require('moment');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const Op = Sequelize.Op;

const models = require('../models');
const notificationController = require('./notificationController');
const { functions } = require('../../utils');

module.exports = {
    getSchedules: function (req, res) {
        const { job_id, limit, offset } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        let opt = {
            attributes: ["schedule_ids"],
            where: {
                hirer_id: user_id,
                deleted_at: null
            },
            include: [{
                attributes: ["id", "first_name", "last_name", "avatar", "categories", "jobber_type"],
                model: models['users'],
                as: 'jobber'
            }, {
                attributes: ["title"],
                model: models['jobs'],
                as: 'job'
            }, {
                attributes: ["price", "is_hourly"],
                model: models['offers'],
                as: 'offer'
            }],
            limit,
            offset
        };
        if (job_id) {
            opt.where.job_id = job_id;
        }

        return models['contracts'].findAll(opt).then(async (rows) => {
            for (let i = 0; i < rows.length; i ++) {
                rows[i].dataValues.schedules = await models['schedules'].findAll({
                    attributes: ["id", "name", "description"],
                    where: {
                        id: rows[i].schedule_ids
                    },
                    include: [{
                        attributes: ["id", "from", "to"],
                        model: models['time_field'],
                        as: 'time',
                        where: {
                            [Op.or]: {
                                'from': {
                                    [Op.gte]: moment(req.body['from']),
                                    [Op.lte]: moment(req.body['to'])
                                },
                                'to': {
                                    [Op.gte]: moment(req.body['from']),
                                    [Op.lte]: moment(req.body['to'])
                                }
                            }
                        }
                    }]
                });
                rows[i].dataValues = omit(rows[i].dataValues, ['schedule_ids']);
            }

            return res.status(200).json({result: "success", contracts: rows});
        }).catch((err) => console.error(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getSchedulesInTime: async function (req, res) {
        const { start_date, end_date, job_id, contract_id } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        try {
            let user_ids = [user_id];
            let val_where = {
                deleted_at: null
            }
            let job_ids = [];
            if(job_id) {
                job_ids.push(job_id);
                val_where.id = job_ids;
                val_where.owner_id = user_ids;
            }else {
                let val_contract_where = {
                    deleted_at: null
                };
                if(contract_id) {
                    val_contract_where.id = contract_id;
                }else {
                    val_contract_where.jobber_id = user_ids;
                }
                const contracts = await models['contracts'].findAll({
                    attributes: ['job_id'],
                    where: val_contract_where
                });
                job_ids = contracts.map(row => row.job_id)
                val_where[Op.or] = {
                    owner_id: user_ids,
                    id: job_ids
                }
            }

            let jobs = await models['jobs'].findAll({
                attributes: ['id', 'title', 'description', 'address', 'owner_id'],
                where: val_where,
                include: [{
                    model: models['schedules'],
                    as: 'schedules',
                    attributes: ['id', 'name', 'description', 'hirer_id'],
                    where: {
                        deleted_at: null
                    },
                    include: [{
                        attributes: ['from', 'to'],
                        model: models['times'],
                        as: 'time_field',
                        where: {
                            [Op.or]: {
                                'from': {
                                    [Op.gte]: moment(start_date),
                                    [Op.lte]: moment(end_date)
                                },
                                'to': {
                                    [Op.gte]: moment(start_date),
                                    [Op.lte]: moment(end_date)
                                }
                            }
                        }
                    }]
                }, {
                    model: models['users'],
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'avatar', 'company']
                }]
            });
            jobs = await Promise.all(jobs.map(async (job) => {
                job.isEditable = user_id === job.owner_id;
                job.schedules = job.schedules.filter(schedule => schedule.time_field.length > 0);
                job.user.avatar = functions.convertLocalToPublic(job.user.avatar);
                job.schedules = await Promise.all(job.schedules.map(async (schedule) => {
                    schedule.dataValues.jobbers = (await models['contracts'].findAll({
                        attributes: [],
                        where: {
                            job_id: job.id,
                            schedule_ids: {
                                [Op.contains]: [schedule.id]
                            },
                            deleted_at: null
                        },
                        include: [{
                            model: models['users'],
                            attributes: ['id', 'first_name', 'last_name', 'avatar', 'company'],
                            as: 'jobber'
                        }]
                    })).map(contract => ({
                        id: contract.jobber.id,
                        first_name: contract.jobber.first_name,
                        last_name: contract.jobber.last_name,
                        avatar: functions.convertLocalToPublic(contract.jobber.avatar),
                        company: contract.jobber.company
                    }));
                    return schedule;
                }));
                job.schedules = job.schedules.filter(schedule => {
                    if (schedule.hirer_id !== req.session.user.id) {
                        return !!schedule.dataValues.jobbers.find(jobber => jobber.id === req.session.user.id);
                    }

                    return true;
                });

                return job;
            }));
            return res.status(200).json({
                result: "success",
                jobs: jobs.filter(job => job.schedules.length > 0)
            });
        }catch(err) {
            console.error(err);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        }
    },

    updateSchedules: async function (req, res) {
        const { schedules } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        try {
            for (const s of schedules) {
                const assignable = (await models['jobs'].count({
                    where: {
                        id: s.job.id,
                        owner_id: user_id,
                        deleted_at: null,
                    }
                })) > 0;

                if (!assignable) continue;

                for (const jobber of s.jobbers) {
                    const already_assigned = (await models['contracts'].count({
                        where: {
                            job_id: s.job.id,
                            hirer_id: user_id,
                            jobber_id: jobber.id,
                            schedule_ids: {
                                [Op.contains]: [s.id]
                            },
                            deleted_at: null,
                        }
                    })) > 0;

                    if (already_assigned) continue;

                    const user = await models['users'].findByPk(jobber.id);
                    if (!user) continue;

                    if (user.jobber_type === 'full_time_worker' || user.jobber_type === 'casual_worker') {
                        const exisitngContract = await models['contracts'].findOne({
                            where: {
                                 job_id: s.job.id,
                                 hirer_id: user_id,
                                 jobber_id: jobber.id,
                                 deleted_at: null
                            }
                        })

                        let createdContract;

                        let newSchedulesToUpdate;
                        if (exisitngContract) {
                            let newScheduleIds = exisitngContract.schedule_ids.concat(s.id.toString())
                            newSchedulesToUpdate = functions.remove_duplicates(newScheduleIds);
                        }

                        if (exisitngContract) {
                            await models['contracts'].update({
                                schedule_ids: newSchedulesToUpdate,
                            }, {
                                where: {
                                    id: exisitngContract.id
                                },
                            });
                        } else {
                            createdContract = await models['contracts'].create({
                                job_id: s.job.id,
                                hirer_id: user_id,
                                jobber_id: jobber.id,
                                schedule_ids: [s.id],
                            });
                        }

                        const notification = {
                            sender_id: user_id,
                            receiver_id: jobber.id,
                            type: 12,
                            title: "Congratulations!",
                             description: `${req.session.user.first_name} ${req.session.user.last_name} hired you for - ${s.job.title}.`,
                            is_broadcast: false,
                            contract_id: exisitngContract ? exisitngContract.id : createdContract.id,
                            job_id: s.job.id,
                            is_read: false
                        };

                        notificationController.createNotification(notification, jobber.id);

                    } else {
                        let invite = await models['invites'].findOne({
                            where: {
                                job_id: s.job.id,
                                sender_id: user_id,
                                receiver_id: jobber.id,
                            }
                        });
                        if (invite) {
                            if (!invite.schedule_ids.includes(s.id)) {
                                await invite.update({
                                    schedule_ids: [ ...invite.schedule_ids, s.id ]
                                })
                            }
                        } else {
                            {
                                invite = await models['invites'].create({
                                    job_id: s.job.id,
                                    sender_id: user_id,
                                    receiver_id: jobber.id,
                                    status: 1,
                                    schedule_ids: [s.id]
                                });
                            }
                        }
                        const notification = {
                            sender_id: user_id,
                            receiver_id: jobber.id,
                            type: 7,
                            title: '',
                            description: `${req.session.user.first_name} ${req.session.user.last_name} invited you to a job - ${s.job.title}.`,
                            is_broadcast: false,
                            invite_id: invite.id,
                            job_id: s.job.id,
                            is_read: false
                        };

                        notificationController.createNotification(notification, jobber.id);
                    }
                }
            }

            return res.status(200).json({ result: "success" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ result: "error", errorCode: 0 });
        }
    },

    saveSchedule: function (job_id, hirer_id, schedules) {
        return models['jobs'].findOne({
            where: {
                id: job_id
            }
        }).then(async(row) => {
            if (!row)
                return null;

            if (typeof schedules === 'string') {
                schedules = JSON.parse(schedules);
            }

            if (typeof schedules === 'string') {
                schedules = JSON.parse(schedules);
            }
            for (let i = 0; i < schedules.length; i ++) {
                if (!schedules[i].id) {
                    const new_schedule = await models['schedules'].create({
                        hirer_id, job_id,
                        name: schedules[i].name,
                        description: schedules[i].description
                    });
                    for (let j = 0; j < schedules[i].time_field.length; j ++) {
                        await models['times'].create({
                            'schedule_id': new_schedule.id,
                            'from': schedules[i].time_field[j]['from'],
                            'to': schedules[i].time_field[j]['to']
                        });
                    }
                    schedules[i].id = new_schedule.id;
                } else {
                    await models['times'].destroy({
                        where: {
                            schedule_id: schedules[i].id
                        }
                    });
                    for (let j = 0; j < schedules[i].time_field.length; j ++) {
                        await models['times'].create( {
                            'schedule_id': schedules[i].id,
                            'from': schedules[i].time_field[j]['from'],
                            'to': schedules[i].time_field[j]['to']
                        });
                    }
                    await models['schedules'].update(schedules[i], {
                        where: {
                            id: schedules[i].id
                        }
                    });
                }
            }

            return schedules;
        }).catch(err => { throw err });
    },

    deleteSchedule: function (ids) {
        return models['schedules'].destroy({
            where: {
                id: ids
            }
        }).then(() => {
            return models['times'].destroy({
                where: {
                    schedule_id: ids
                }
            });
        }).catch(err => { throw err });
    },

    subscribeSchedules: async function (req, res) {
        const { token } = req.query;
        const jwt = require('jsonwebtoken');
        let user_id;
        try {
            user_id = jwt.verify(token, 'ics_subscribe').foo;
            console.log(user_id);
        } catch(err) {
            return res.send(err.message)
        }

        models['contracts'].findAll({
            where: {
                [Op.or]: [
                    {
                        jobber_id: user_id
                    }, 
                    {
                        hirer_id: user_id
                    }
                ]
            },
            include: [{
                attributes: ["id", "first_name", "last_name", "email", "avatar", "company"],
                model: models['users'],
                as: 'hirer'
            }]
        }).then(async (rows) => {
            const ics = require('ics');
            let events = [];
            await Promise.all((rows.filter(row => (row.schedule_ids && row.schedule_ids.length > 0))).map(async (el) => {
                const shedules = await models['schedules'].findAll({
                    where: {
                        [Op.and]: [
                            {
                                hirer_id: el.hirer_id
                            },
                            {
                                job_id: el.job_id
                            }
                        ]
                    },
                    include: [{
                        attributes: ["id", "from", "to"],
                        model: models['times'],
                        as: 'time_field',
                    }, {
                        attributes: ["id", "title"],
                        model: models['jobs'],
                        as: 'job',
                    }]
                });

                shedules.forEach(schedule => {
                    if (el.schedule_ids.includes(schedule.id.toString())) {
                        const jobTitle = schedule.job.title;
                        const company = el.hirer.company;
                        const name = `${el.hirer.first_name} ${el.hirer.last_name}`;
                        const scheduleName = schedule.name;
                        const arr = user_id == el.hirer_id ? [jobTitle, scheduleName] : [company, name, jobTitle, scheduleName];
                        const title = arr.filter(item => item).join('/');
    
                        schedule.time_field.forEach(field => {
                            events.push({
                                title:  title,
                                start: moment(field.dataValues.from).format('YYYY-M-D-H-m').split("-"),
                                end: moment(field.dataValues.to).format('YYYY-M-D-H-m').split("-")
                            })
                        })
                    }
                })
            }))
            
            let { error, value } = ics.createEvents(
                events 
            );
            
            if (error) {
                console.log(error);
                return
            }
            return res.send(String(value));           
        }).catch((err) => console.error(err) || res.status(500).json({result: err, errorCode: 0}).end());
    },

    getSchedulesLink: async function (req, res) {
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        const token = jwt.sign({ foo: user_id }, 'ics_subscribe');
        const hostname = req.headers.host;
        const value=`https://${hostname}/app/subscribe?token=${token}`;

        return res.send(value);
    },
};

