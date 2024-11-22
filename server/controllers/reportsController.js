const {validation, time} = require('../../utils');
const models = require('../models');
const {isEmpty, merge} = require('lodash');
const moment = require('moment/moment');
const Sequelize = require('sequelize');
const paymentController = require('./paymentController');
const Op = Sequelize.Op;

async function getAssignedSchedules(job_id, hirer_id, jobber_id, start_date, end_date) {
    let ms = 0;
    let val_where = {};
    if(job_id) {
        val_where.job_id = job_id;
    }
    if(hirer_id) {
        val_where.hirer_id = hirer_id;
    }
    if(jobber_id) {
        val_where.jobber_id = jobber_id;
    }
    val_where.createdAt = {
        [Op.gte]: moment(start_date),
        [Op.lte]: moment(end_date)
    };
    try {
        const contracts = await models['contracts'].findAll({
            where: val_where
        });
    
        for (let j = 0; j < contracts.length; j ++) {
            const times = await models['times'].findAll({
                raw: true,
                attributes: ['from', 'to'],
                where: {
                    schedule_id: contracts[j].schedule_ids
                }
            });
    
            for(let k = 0; k < times.length; k ++) {
                ms += moment(times[k].to).diff(moment(times[k].from));
            }
        }
        return ms;
    }catch(err) {
        console.log(err);
        return 0;
    }

}

async function getAssignedSchedulesRate(job_id, hirer_id, jobber_id, start_date, end_date) {
    let ms = 0;
    let price = 0;
    let val_where = {};
    if(job_id) {
        val_where.job_id = job_id;
    }
    if(hirer_id) {
        val_where.hirer_id = hirer_id;
    }
    if(jobber_id) {
        val_where.jobber_id = jobber_id;
    }
    val_where.createdAt = {
        [Op.gte]: moment(start_date),
        [Op.lte]: moment(end_date)
    };
    try {
        const contracts = await models['contracts'].findAll({
            where: val_where
        });
    
        for (let j = 0; j < contracts.length; j ++) {
            const times = await models['times'].findAll({
                raw: true,
                attributes: ['from', 'to'],
                where: {
                    schedule_id: contracts[j].schedule_ids
                }
            });
    
            for(let k = 0; k < times.length; k ++) {
                ms += moment(times[k].to).diff(moment(times[k].from));
            }
            const hours = ms / (60 * 60 * 1000);

            price += (contracts[j].price * hours);
        }
        return price;
    }catch(err) {
        console.log(err);
        return 0;
    }    
}

async function getAmountsOfInvites(job_id, sender_id, receiver_id, start_date, end_date) {
    let val_where = {
        [Op.or]: {
            status: 1,
            status: 2
        },
        deleted_at: null,
        createdAt: {
            [Op.gte]: moment(start_date),
            [Op.lte]: moment(end_date)
        }
    };
    if(job_id) {
        val_where.job_id = job_id;
    }

    if(sender_id) {
        val_where.sender_id = sender_id;
    }

    if(receiver_id) {
        val_where.receiver_id = receiver_id;
    }

    try {
        const invites = await models['invites'].count({
            where: val_where
        });
        return invites;
    }catch(err) {
        console.log(err);
        return null;
    }    
}

async function getAmountOfJobByType(owner_id, start_date, end_date, type) {
    let val_where = {
        deleted_at: null,
        createdAt: {
            [Op.gte]: moment(start_date),
            [Op.lte]: moment(end_date)
        }
    };
    if(owner_id) {
        val_where.owner_id = owner_id;
    }

    if(type === 'amount_open_jobs'){
        val_where[Op.and] = {
            is_cancelled: false,
            is_closed: false,
            closed_at: null,
            deleted_at: null
        }
    }
    if(type === 'amount_completed_jobs') {
        val_where.is_completed = true;
    }
    if(type === 'amount_private_jobs') {
        val_where.is_public = false;
    }
    if(type === 'amount_sos_jobs') {
        val_where.is_urgent = true;
    }
    try {
        const jobs = await models['jobs'].count({where: val_where});
        return jobs;
    }catch(err) {
        console.log(err);
        return null;
    }
}

async function getSOSChargePrice(job_id, user_id, start_date, end_date) {
    let price = 0;
    let val_where = {
        charge_type: 'SOS Urgent staff',
        createdAt: {
            [Op.gte]: moment(start_date),
            [Op.lte]: moment(end_date)
        }
    };
    if(job_id) {
        val_where.job_id = job_id;
    }
    if(user_id) {
        val_where.user_id = user_id;
    }
    try {
        const charges = await models['customer_charges'].findAll({
            where: val_where
        });
    
        for (let j = 0; j < charges.length; j ++) {
            if(charges[j].dataValues.charge_id.substring(0, 2) === 'ch'){
                const charge = await paymentController.retrieveCharge(charges[j].dataValues.charge_id);
                price += charge.amount;
            }
    
            if(charges[j].dataValues.charge_id.substring(0, 2) === 'pi'){
                const payment = await paymentController.retrievePaymentIntent(charges[j].dataValues.charge_id);
                price += payment.amount;
            }
        }
        return price;    
    }catch(err) {
        console.log(err);
        return 0;
    }    
}

module.exports = {
    runReport: async function (req, res) {
        const {sel_reports, job, jobber, start_date, end_date, view_mode} = req.body;
        const user =req.session.user;

        let reports = [];
        try {
            for(let i = 0; i < sel_reports.length; i += 1) {
                if(sel_reports[i].type === 'specific') {
                    if(!job) {
                        continue;
                    }
                    if(sel_reports[i].id === 'hours_to_all'){
                        const ms = await getAssignedSchedules(job, user.id, null, start_date, end_date);
                        reports.push({type: 'specific', id: sel_reports[i].id, value: time.hhmmss(ms/1000, true)});
                    }

                    if(sel_reports[i].id === 'hours_to_specific'){
                        if(jobber) {
                            const ms = await getAssignedSchedules(job, user.id, jobber, start_date, end_date);
                            reports.push({type: 'specific', id: sel_reports[i].id, value: time.hhmmss(ms/1000, true)});
                        }                    
                    }

                    if(sel_reports[i].id === 'rates_changed_total'){
                        const price = await getAssignedSchedulesRate(job, user.id, null, start_date, end_date, sel_reports[i].id);
                        reports.push({type: 'specific', id: sel_reports[i].id, value: price.toFixed(2)});
                    }

                    if(sel_reports[i].id === 'rates_changed_specific'){
                        if(jobber) {
                            const price = await getAssignedSchedulesRate(job, user.id, jobber, start_date, end_date, sel_reports[i].id);
                            reports.push({type: 'specific', id: sel_reports[i].id, value: price.toFixed(2)});
                        }
                    }

                    if(sel_reports[i].id === 'sos_charges_all'){
                        const price = await getSOSChargePrice(job, user.id, start_date, end_date);
                        reports.push({type: 'specific', id: sel_reports[i].id, value: price.toFixed(2)});
                    }

                    if(sel_reports[i].id === 'sos_charges_specific'){
                        if(jobber) {
                            let price = 0;
                            const contracts = await models['contracts'].findAll({
                                where: {
                                    job_id: job,
                                    hirer_id: user.id,
                                    jobber_id: jobber,
                                    createdAt: {
                                        [Op.gte]: moment(start_date),
                                        [Op.lte]: moment(end_date)
                                    },
                                }
                            });
                            for(let j = 0; j < contracts.length; j += 1) {
                                price += await getSOSChargePrice(contracts[j].dataValues.job_id, null, start_date, end_date);
                            }
                            reports.push({type: 'specific', id: sel_reports[i].id, value: price.toFixed(2)});
                        }
                    }

                    if(sel_reports[i].id === 'amount_earnt'){
                        
                    }

                    if(sel_reports[i].id === 'amount_invites_all'){
                        const invites = await getAmountsOfInvites(job, user.id, null, start_date, end_date);
                        reports.push({type: 'specific', id: sel_reports[i].id, value: invites});
                    }

                    if(sel_reports[i].id === 'amount_invites_specific'){
                        if(jobber) {
                            const invites = await getAmountsOfInvites(job, user.id, jobber, start_date, end_date);
                            reports.push({type: 'specific', id: sel_reports[i].id, value: invites});
                        }
                    }
                }

                if(sel_reports[i].type === 'all') {
                    if(sel_reports[i].id === 'hours_to_all'){
                        const ms = await getAssignedSchedules(null, user.id, null, start_date, end_date);
                        reports.push({type: 'all', id: sel_reports[i].id, value: time.hhmmss(ms/1000, true)});
                    }

                    if(sel_reports[i].id === 'hours_to_specific'){
                        if(jobber) {
                            const ms = await getAssignedSchedules(null, user.id, jobber, start_date, end_date);
                            reports.push({type: 'all', id: sel_reports[i].id, value: time.hhmmss(ms/1000, true)});
                        }
                    }

                    if(sel_reports[i].id === 'rates_changed_total'){
                        const price = await getAssignedSchedulesRate(null, user.id, null, start_date, end_date);
                        reports.push({type: 'all', id: sel_reports[i].id, value: price.toFixed(2)});
                    }

                    if(sel_reports[i].id === 'rates_changed_specific'){
                        if(jobber) {
                            const price = await getAssignedSchedulesRate(null, user.id, jobber, start_date, end_date);
                            reports.push({type: 'all', id: sel_reports[i].id, value: price.toFixed(2)});
                        }
                    }

                    if(sel_reports[i].id === 'sos_charges'){
                        const price = await getSOSChargePrice(null, user.id, start_date, end_date);
                        reports.push({type: 'all', id: sel_reports[i].id, value: price.toFixed(2)});
                    }

                    if(sel_reports[i].id === 'amount_invites'){
                        const invites = await getAmountsOfInvites(null, user.id, null, start_date, end_date);
                        reports.push({type: 'all', id: sel_reports[i].id, value: invites});
                    }

                    if(sel_reports[i].id === 'amount_open_jobs'){
                        const jobs = await getAmountOfJobByType(user.id, start_date, end_date, sel_reports[i].id);
                        reports.push({type: 'all', id: sel_reports[i].id, value: jobs});
                    }

                    if(sel_reports[i].id === 'amount_completed_jobs'){
                        const jobs = await getAmountOfJobByType(user.id, start_date, end_date, sel_reports[i].id);
                        reports.push({type: 'all', id: sel_reports[i].id, value: jobs});
                    }

                    if(sel_reports[i].id === 'amount_private_jobs'){
                        const jobs = await getAmountOfJobByType(user.id, start_date, end_date, sel_reports[i].id);
                        reports.push({type: 'all', id: sel_reports[i].id, value: jobs});
                    }

                    if(sel_reports[i].id === 'amount_sos_jobs'){
                        const jobs = await getAmountOfJobByType(user.id, start_date, end_date, sel_reports[i].id);
                        reports.push({type: 'all', id: sel_reports[i].id, value: jobs});
                    }

                    if(sel_reports[i].id === 'amount_jobs_completed'){
                        if(jobber) {
                            const jobs = await models['jobs'].findAll({
                                where: {
                                    owner_id: user.id,
                                    is_completed: true,
                                    deleted_at: null,
                                    createdAt: {
                                        [Op.gte]: moment(start_date),
                                        [Op.lte]: moment(end_date)
                                    }
                                }
                            });
                            let completed_jobs = 0;
        
                            for(let k = 0; k < jobs.length; k += 1) {
                                const contracts = await models['contracts'].count({
                                    job_id: jobs[k].id,
                                    jobber_id: jobber
                                });
        
                                completed_jobs += contracts;
                            }
                            reports.push({type: 'all', id: sel_reports[i].id, value: completed_jobs});
                        }
                    }
                }
            }
            return res.status(200).json({result: "success", reports}).end();
        }catch(err) {
            console.log(err)
            return res.status(500).json({result: "error"}).end();
        }
    }
};
