const {validation, time} = require('../../utils');
const models = require('../models');
const {isEmpty, omit, merge} = require('lodash');
const moment = require('moment/moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    createWorkTime: function (req, res) {
        const { contract_id, schedule_id, break_times, from, to, comment } = req.body;

        const user = req.session.user;
        if(!time.compareDate(from, to)){
            return res.status(500).json({result: "error", errorCode: 1}).end();
        }
        return models['contracts'].findOne({
            where: {
                id: contract_id,
                deleted_at: null
            }
        }).then((contract) => {
            if(isEmpty(contract)){
                return res.status(500).json({result: "error", errorCode: 1}).end();
            }

            const new_work_time = {
                jobber_id: user.id,
                contract_id: contract_id,
                comment: comment,
                is_sent: true,
                schedule_id: schedule_id,
                from: from,
                to: to
            };

            return models.work_times.create(new_work_time)
            .then(async(row) => {
                for(let i = 0; i < break_times.length; i += 1){
                    const breaktime = {
                        user_id: user.id,
                        worktime_id: row.dataValues.id,
                        from: break_times[i].from,
                        to: break_times[i].to,
                        type: break_times[i].type
                    }
                    await models.breaktimes.create(breaktime);    
                }
                return res.status(200).json({result: "success", worktime: row}).end();
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getWorkTimes: function (req, res) {
        const { contract_id, limit, orderBy, lastValue } = req.query;

        let val_where = {};

        if(lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            }
        }
        val_where.contract_id = contract_id;
        val_where.deleted_at = null;
        val_where.jobber_id = req.session.user.id;

        let opt = {
            where: val_where,
            order: [
                [orderBy, 'DESC']
            ],
            include: [
                {
                    model: models['breaktimes'],
                    as: 'break_times'
                },
                {
                    model: models['schedules'],
                    as: 'schedule',
                    include: [{
                        model: models['times'],
                        as: 'time_field',
                        attributes: ['from', 'to'],
                        required: false
                    }]
                }
            ]
        };

        if(limit) {
            opt.limit = limit;
        }

        return models.work_times.findAll(opt)
        .then((work_times) => {
            return res.status(200).json({result: "success", work_times}).end();
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateWorkTime: function (req, res) {
        const { id } = req.params;
        const query = req.body;
        const user = req.session.user;
        return models.work_times.findOne({
            where: {
                jobber_id: user.id,
                id: id
            }
        }).then((work_time) => {
            if(isEmpty(work_time)) {
                return res.status(500).json({result: "error", errorCode: 1}).end();
            }
            const w_query = omit(query, ['break_times']);
            return work_time.update(w_query)
            .then(async() => {
                if(query.break_times){
                    await models['breaktimes'].destroy({
                        where: {worktime_id: work_time.dataValues.id}
                    })
    
                    for(let i = 0; i < query.break_times.length; i += 1){
                        const breaktime = {
                            user_id: user.id,
                            worktime_id: work_time.dataValues.id,
                            from: query.break_times[i].from,
                            to: query.break_times[i].to,
                            type: query.break_times[i].type
                        }
                        await models.breaktimes.create(breaktime);    
                    }
                }
                return res.status(200).json({result: "success"}).end();
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteWorkTime: function (req, res) {
        const id = req.params.id;
        const owner_id = req.session.user.id;

        return Promise.all([
            models.work_times.update(
                {deleted_at: new Date()},
                {
                    where: {
                        jobber_id: owner_id,
                        id: id
                    }
                }
            ),
            models.breaktimes.destroy({
                where: {
                    worktime_id: id
                }
            })
        ]).then(() => {
            return res.status(200).json({result: "success"}).end();
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

};
