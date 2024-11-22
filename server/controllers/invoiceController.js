const moment = require('moment');
const Sequelize = require('sequelize');
const handlebars = require('handlebars');
const fs = require('fs');
const pdf = require('html-pdf');

const { validation, functions } = require('../../utils');
const models = require('../models');
const notificationController = require('./notificationController');

const Op = Sequelize.Op;

const readHTMLFile = function (path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

module.exports = {
    createInvoice: function (req, res) {
        const { job_id, contract_id, invoice_no, jobber_type, is_gst_registered, purchase_order,
            sender_trading_name, sender_abn, sender_username, sender_email, sender_company,
            invoice_date, due_date, worktime_ids, account_nubmer, bsb, acc_name } = req.body;

        return models['jobs'].findOne({
            where: {
                id: job_id
            },
            include: [{
                attributes: ['id', 'first_name', 'last_name', 'email', 'company'],
                model: models['users'],
                as: 'user'
            }]
        }).then(job => {
            if (!job) {
                return res.status(500).json({result: "error", errorCode: 3});
            }

            return Promise.all([
                models['invoices'].create({
                    job_id, contract_id, invoice_no, jobber_type, is_gst_registered, purchase_order,
                    sender_trading_name: (jobber_type === 'Company' || jobber_type === 'Full Time Worker')?sender_company:sender_username, sender_abn, sender_username, sender_email, sender_company,
                    invoice_date, due_date, worktime_ids, acc_number: account_nubmer, bsb, acc_name,
                    sender_id: req.session.user.id,
                    receiver_id: job.dataValues.user.id,
                    receiver_name: job.dataValues.user.first_name + " " + job.dataValues.user.last_name,
                    receiver_email: job.dataValues.user.email,
                    receiver_company: job.dataValues.user.company,
                }),
                models['contracts'].update({
                    read_hirer: false
                }, {
                    where: {
                        id: contract_id,
                        jobber_id: req.session.user.id
                    }
                })
            ]).then(([row]) => {
                const notification = {
                    sender_id: row.sender_id,
                    receiver_id: row.receiver_id,
                    type: 24,
                    title: '',
                    description: `${row.sender_username} sent an invoice or time sheet - ${job.title}`,
                    is_broadcast: false,
                    invoice_id: row.id,
                    contract_id: contract_id,
                    job_id: job_id,
                    is_read: false,
                };

                notificationController.createNotification(notification, row.receiver_id);
                return res.status(200).json({result: "success", invoice: row});
            }).catch((err) => console.error(err) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((err) => console.error(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getContractInvoices: function (req, res) {
        const { contract_id, limit, orderBy, lastValue } = req.query;
        let val_where = {};
        if (lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            }
        }
        val_where.contract_id = contract_id;

        return models['invoices'].findAll({
            where: val_where,
            limit: limit,
            order: [
                [orderBy, "DESC"]
            ],
            include: [{
                attributes: ['price', 'is_hourly'],
                model: models['contracts'],
                as: 'in_contract'
            }]
        }).then(async (invoices) => {
            for (let i = 0; i < invoices.length; i ++) {
                let total_worktime_seconds = 0, total_breaktime_seconds = 0,
                    date_from = null, date_to = null;

                const work_times = await models['work_times'].findAll({
                    where: {
                        id: invoices[i].dataValues.worktime_ids
                    },
                    include: [{
                        attributes: ['from', 'to', 'type'],
                        model: models['breaktimes'],
                        as: 'break_times'
                    }]
                });

                if (work_times.length > 0) {
                    date_from = work_times[0].dataValues.from;
                    date_to = work_times[0].dataValues.to;
                    for (let j = 0; j < work_times.length; j ++) {
                        if (!moment(date_from).isBefore(moment(work_times[j].dataValues.from))) {
                            date_from = work_times[j].dataValues.from;
                        }
                        if (moment(date_to).isBefore(moment(work_times[j].dataValues.to))) {
                            date_to = work_times[j].dataValues.to;
                        }

                        const duration = moment.duration(moment(work_times[j].dataValues.to).diff(moment(work_times[j].dataValues.from)));
                        total_worktime_seconds += duration.asSeconds();
                        for (let k = 0; k < work_times[j].dataValues['break_times'].length; k ++) {
                            const bk_duration = moment.duration(moment(work_times[j].dataValues['break_times'][k].to).diff(moment(work_times[j].dataValues['break_times'][k].from)));
                            total_breaktime_seconds += bk_duration.asSeconds();
                        }
                    }
                }

                invoices[i].dataValues.total_price = ((total_worktime_seconds - total_breaktime_seconds) / 3600) * invoices[i].dataValues['in_contract'].price;
                invoices[i].dataValues.work_times = work_times;
                invoices[i].dataValues.total_worktime_seconds = total_worktime_seconds;
                invoices[i].dataValues.total_breaktime_seconds = total_breaktime_seconds;
                invoices[i].dataValues.date_from = date_from;
                invoices[i].dataValues.date_to = date_to;
            }

            return res.status(200).json({result: "success", invoices});
        }).catch((error) => console.error(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getJobInvoices: function (req, res) {
        const { job_id, limit, orderBy, lastValue } = req.query;
        if (!validation.isNumber(job_id)) {
            return res.status(500).json({result: "error", errorCode: 1});
        }

        let val_where = {};
        if (lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            }
        }
        val_where.job_id = job_id;

        return models['invoices'].findAll({
            where: val_where,
            limit: limit,
            order: [
                [orderBy, "DESC"]
            ],
            include: [{
                attributes: ['price', 'is_hourly'],
                model: models['contracts'],
                as: 'in_contract'
            }, {
                attributes: ['title'],
                model: models['jobs'],
                as: 'in_job'
            }]
        }).then(async (invoices) => {
            for (let i = 0; i < invoices.length; i ++) {
                let total_worktime_seconds = 0, total_breaktime_seconds = 0;

                const work_times = await models['work_times'].findAll({
                    where: {
                        id: invoices[i].dataValues.worktime_ids
                    },
                    include: [{
                        attributes: ['from', 'to', 'type'],
                        model: models['breaktimes'],
                        as: 'break_times'
                    }]
                });

                let date_from = null, date_to = null;
                if (work_times.length > 0) {
                    date_from = work_times[0].dataValues.from;
                    date_to = work_times[0].dataValues.to;
                    for(let j = 0; j < work_times.length; j += 1){
                        if(!moment(date_from).isBefore(moment(work_times[j].dataValues.from))){
                            date_from = work_times[j].dataValues.from;
                        }

                        if(moment(date_to).isBefore(moment(work_times[j].dataValues.to))){
                            date_to = work_times[j].dataValues.to;
                        }
                        const duration = moment.duration(moment(work_times[j].dataValues.to).diff(moment(work_times[j].dataValues.from)));
                        total_worktime_seconds += duration.asSeconds();
                        for(let k = 0; k < work_times[j].dataValues.break_times.length; k += 1){
                            const bk_duration = moment.duration(moment(work_times[j].dataValues.break_times[k].to).diff(moment(work_times[j].dataValues.break_times[k].from)));
                            total_breaktime_seconds += bk_duration.asSeconds();
                        }
                    }
                }
                invoices[i].dataValues.total_worktime_seconds = total_worktime_seconds;
                invoices[i].dataValues.total_breaktime_seconds = total_breaktime_seconds;
                invoices[i].dataValues.total_price = ((total_worktime_seconds - total_breaktime_seconds) / 3600) * invoices[i].dataValues.in_contract.price;
                invoices[i].dataValues.work_times = work_times;
                invoices[i].dataValues.date_from = date_from;
                invoices[i].dataValues.date_to = date_to;
                invoices[i].dataValues.job_title = invoices[i].dataValues.in_job.title;
            }
            return res.status(200).json({result: "success", invoices: invoices, lastValue: invoices.length>0?invoices[invoices.length - 1].dataValues.id:null}).end();
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getReceivedInvoices: function (req, res) {
        const { limit, orderBy, lastValue } = req.query;

        let val_where = {};
        if(lastValue){
            val_where.id = {
                [Op.lt]: lastValue
            }
        }

        val_where.receiver_id = req.session.user.id;

        return models['invoices'].findAll({
            where: val_where,
            limit: limit,
            order: [
                [orderBy, "DESC"]
            ],
            include: [
                {
                    attributes: ['price', 'is_hourly'],
                    model: models['contracts'],
                    as: 'in_contract'
                },
                {
                    attributes: ['title'],
                    model: models['jobs'],
                    as: 'in_job'
                }
            ]
        }).then(async(invoices) => {
            for(let i = 0; i < invoices.length; i += 1) {
                let total_worktime_seconds = 0;
                let total_breaktime_seconds = 0;

                const sender = await models['users'].findByPk(invoices[i].dataValues.sender_id);

                const work_times = await models['work_times'].findAll({
                    where: {
                        id: invoices[i].dataValues.worktime_ids
                    },
                    include: [
                        {
                            attributes: ['from', 'to', 'type'],
                            model: models['breaktimes'],
                            as: 'break_times'
                        }
                    ]
                });

                let date_from = null;
                let date_to = null;
                if(work_times.length > 0){
                    date_from = work_times[0].dataValues.from;
                    date_to = work_times[0].dataValues.to;
                    for(let j = 0; j < work_times.length; j += 1){
                        if(!moment(date_from).isBefore(moment(work_times[j].dataValues.from))){
                            date_from = work_times[j].dataValues.from;
                        }

                        if(moment(date_to).isBefore(moment(work_times[j].dataValues.to))){
                            date_to = work_times[j].dataValues.to;
                        }
                        const duration = moment.duration(moment(work_times[j].dataValues.to).diff(moment(work_times[j].dataValues.from)));
                        total_worktime_seconds += duration.asSeconds();
                        for(let k = 0; k < work_times[j].dataValues.break_times.length; k += 1){
                            const bk_duration = moment.duration(moment(work_times[j].dataValues.break_times[k].to).diff(moment(work_times[j].dataValues.break_times[k].from)));
                            total_breaktime_seconds += bk_duration.asSeconds();
                        }
                    }
                }

                const notification = await models['notifications'].findOne({
                    where: {
                        receiver_id: req.session.user.id,
                        type: 24,
                        invoice_id: invoices[i].id
                    }
                });

                if (notification) {
                    invoices[i].dataValues.is_read = notification.is_read;
                }

                invoices[i].dataValues.total_worktime_seconds = total_worktime_seconds;
                invoices[i].dataValues.total_breaktime_seconds = total_breaktime_seconds;
                invoices[i].dataValues.total_price = ((total_worktime_seconds - total_breaktime_seconds) / 3600) * invoices[i].dataValues.in_contract.price;
                invoices[i].dataValues.work_times = work_times;
                invoices[i].dataValues.date_from = date_from;
                invoices[i].dataValues.date_to = date_to;
                invoices[i].dataValues.job_title = invoices[i].dataValues.in_job.title;
                invoices[i].dataValues.sender_avatar = functions.convertLocalToPublic(sender.dataValues.avatar);
                invoices[i].dataValues.sender_company = sender.dataValues.company;
                invoices[i].dataValues.sender_type = sender.dataValues.jobber_type;
            }
            return res.status(200).json({result: "success", invoices: invoices, lastValue: invoices.length>0?invoices[invoices.length - 1].dataValues.id:null}).end();
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getAllReceivedInvoices: function (req, res) {
        const { orderBy, jobId, contractId } = req.query;
        let val_where = {};
        val_where = {
            [Op.and]: [
                {job_id: jobId},
                {contract_id: contractId}
            ]
        }
        val_where.receiver_id = req.session.user.id;

        return models['invoices'].findAll({
            where: val_where,
            order: [
                [orderBy, "DESC"]
            ],
            include: [
                {
                    attributes: ['price', 'is_hourly'],
                    model: models['contracts'],
                    as: 'in_contract'
                },
                {
                    attributes: ['title'],
                    model: models['jobs'],
                    as: 'in_job'
                }
            ]
        }).then(async(invoices) => {
            for(let i = 0; i < invoices.length; i += 1) {
                let total_worktime_seconds = 0;
                let total_breaktime_seconds = 0;

                const work_times = await models['work_times'].findAll({
                    where: {
                        id: invoices[i].dataValues.worktime_ids
                    },
                    include: [
                        {
                            attributes: ['from', 'to', 'type'],
                            model: models['breaktimes'],
                            as: 'break_times'
                        }
                    ]
                });

                let date_from = null;
                let date_to = null;
                if(work_times.length > 0){
                    date_from = work_times[0].dataValues.from;
                    date_to = work_times[0].dataValues.to;
                    for(let j = 0; j < work_times.length; j += 1){
                        if(!moment(date_from).isBefore(moment(work_times[j].dataValues.from))){
                            date_from = work_times[j].dataValues.from;
                        }

                        if(moment(date_to).isBefore(moment(work_times[j].dataValues.to))){
                            date_to = work_times[j].dataValues.to;
                        }
                        const duration = moment.duration(moment(work_times[j].dataValues.to).diff(moment(work_times[j].dataValues.from)));
                        total_worktime_seconds += duration.asSeconds();
                        for(let k = 0; k < work_times[j].dataValues.break_times.length; k += 1){
                            const bk_duration = moment.duration(moment(work_times[j].dataValues.break_times[k].to).diff(moment(work_times[j].dataValues.break_times[k].from)));
                            total_breaktime_seconds += bk_duration.asSeconds();
                        }
                    }
                }
                invoices[i].dataValues.total_worktime_seconds = total_worktime_seconds;
                invoices[i].dataValues.total_breaktime_seconds = total_breaktime_seconds;
                invoices[i].dataValues.total_price = ((total_worktime_seconds - total_breaktime_seconds) / 3600) * invoices[i].dataValues.in_contract.price;
                invoices[i].dataValues.work_times = work_times;
                invoices[i].dataValues.date_from = date_from;
                invoices[i].dataValues.date_to = date_to;
                invoices[i].dataValues.job_title = invoices[i].dataValues.in_job.title;
            }
            return res.status(200).json({result: "success", invoices: invoices, lastValue: invoices.length>0?invoices[invoices.length - 1].dataValues.id:null}).end();
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getSentInvoices: function (req, res) {
        const { limit, orderBy, lastValue, contractId } = req.query;
        let val_where = {};
        if(lastValue){
            val_where.id = {
                [Op.lt]: lastValue
            }
        }

        if(contractId) {
            val_where.contract_id = contractId;
        }

        val_where.sender_id = req.session.user.id;

        return models['invoices'].findAll({
            where: val_where,
            limit: limit,
            order: [
                [orderBy, "DESC"]
            ],
            include: [
                {
                    attributes: ['price', 'is_hourly'],
                    model: models['contracts'],
                    as: 'in_contract'
                },
                {
                    attributes: ['title'],
                    model: models['jobs'],
                    as: 'in_job'
                }
            ]
        }).then(async(invoices) => {
            for(let i = 0; i < invoices.length; i += 1) {
                let total_worktime_seconds = 0;
                let total_breaktime_seconds = 0;

                const work_times = await models['work_times'].findAll({
                    where: {
                        id: invoices[i].dataValues.worktime_ids
                    },
                    include: [
                        {
                            attributes: ['from', 'to', 'type'],
                            model: models['breaktimes'],
                            as: 'break_times'
                        }
                    ]
                });

                let date_from = null;
                let date_to = null;
                if(work_times.length > 0){
                    date_from = work_times[0].dataValues.from;
                    date_to = work_times[0].dataValues.to;
                    for(let j = 0; j < work_times.length; j += 1){
                        if(!moment(date_from).isBefore(moment(work_times[j].dataValues.from))){
                            date_from = work_times[j].dataValues.from;
                        }

                        if(moment(date_to).isBefore(moment(work_times[j].dataValues.to))){
                            date_to = work_times[j].dataValues.to;
                        }
                        const duration = moment.duration(moment(work_times[j].dataValues.to).diff(moment(work_times[j].dataValues.from)));
                        total_worktime_seconds += duration.asSeconds();
                        for(let k = 0; k < work_times[j].dataValues.break_times.length; k += 1){
                            const bk_duration = moment.duration(moment(work_times[j].dataValues.break_times[k].to).diff(moment(work_times[j].dataValues.break_times[k].from)));
                            total_breaktime_seconds += bk_duration.asSeconds();
                        }
                    }
                }
                invoices[i].dataValues.total_worktime_seconds = total_worktime_seconds;
                invoices[i].dataValues.total_breaktime_seconds = total_breaktime_seconds;
                invoices[i].dataValues.total_price = ((total_worktime_seconds - total_breaktime_seconds) / 3600) * invoices[i].dataValues.in_contract.price;
                invoices[i].dataValues.work_times = work_times;
                invoices[i].dataValues.date_from = date_from;
                invoices[i].dataValues.date_to = date_to;
                invoices[i].dataValues.job_title = invoices[i].dataValues.in_job.title;
            }

            return res.status(200).json({result: "success", invoices: invoices, lastValue: invoices.length>0?invoices[invoices.length - 1].dataValues.id:null}).end();
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getAllSentInvoices: function (req, res) {
        const {orderBy, lastValue, contractId } = req.query;
        let val_where = {};
        if(lastValue){
            val_where.id = {
                [Op.lt]: lastValue
            }
        }

        if(contractId) {
            val_where.contract_id = contractId;
        }

        val_where.sender_id = req.session.user.id;

        return models['invoices'].findAll({
            where: val_where,
            order: [
                [orderBy, "DESC"]
            ],
            include: [
                {
                    attributes: ['price', 'is_hourly'],
                    model: models['contracts'],
                    as: 'in_contract'
                },
                {
                    attributes: ['title'],
                    model: models['jobs'],
                    as: 'in_job'
                }
            ]
        }).then(async(invoices) => {
            for(let i = 0; i < invoices.length; i += 1) {
                let total_worktime_seconds = 0;
                let total_breaktime_seconds = 0;

                const work_times = await models['work_times'].findAll({
                    where: {
                        id: invoices[i].dataValues.worktime_ids
                    },
                    include: [
                        {
                            attributes: ['from', 'to', 'type'],
                            model: models['breaktimes'],
                            as: 'break_times'
                        }
                    ]
                });

                let date_from = null;
                let date_to = null;
                if(work_times.length > 0){
                    date_from = work_times[0].dataValues.from;
                    date_to = work_times[0].dataValues.to;
                    for(let j = 0; j < work_times.length; j += 1){
                        if(!moment(date_from).isBefore(moment(work_times[j].dataValues.from))){
                            date_from = work_times[j].dataValues.from;
                        }

                        if(moment(date_to).isBefore(moment(work_times[j].dataValues.to))){
                            date_to = work_times[j].dataValues.to;
                        }
                        const duration = moment.duration(moment(work_times[j].dataValues.to).diff(moment(work_times[j].dataValues.from)));
                        total_worktime_seconds += duration.asSeconds();
                        for(let k = 0; k < work_times[j].dataValues.break_times.length; k += 1){
                            const bk_duration = moment.duration(moment(work_times[j].dataValues.break_times[k].to).diff(moment(work_times[j].dataValues.break_times[k].from)));
                            total_breaktime_seconds += bk_duration.asSeconds();
                        }
                    }
                }
                invoices[i].dataValues.total_worktime_seconds = total_worktime_seconds;
                invoices[i].dataValues.total_breaktime_seconds = total_breaktime_seconds;
                invoices[i].dataValues.total_price = ((total_worktime_seconds - total_breaktime_seconds) / 3600) * invoices[i].dataValues.in_contract.price;
                invoices[i].dataValues.work_times = work_times;
                invoices[i].dataValues.date_from = date_from;
                invoices[i].dataValues.date_to = date_to;
                invoices[i].dataValues.job_title = invoices[i].dataValues.in_job.title;
            }

            return res.status(200).json({result: "success", invoices: invoices, lastValue: invoices.length>0?invoices[invoices.length - 1].dataValues.id:null}).end();
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getInvoiceById: function (req, res) {
        const { id } = req.params;
        let { tz } = req.query;
        tz = parseInt(tz);

        return models['invoices'].findByPk(id, {
            include: [{
                model: models['contracts'],
                as: 'in_contract',
                include: [{
                    attributes: ['title'],
                    model: models['jobs'],
                    as: 'job'
                }]
            }]
        }).then(async(invoice) => {
            if(!invoice)
                return res.status(500).json({result: "error", errorCode: 1}).end();

            const notification = await models['notifications'].findOne({
                where: {
                    receiver_id: req.session.user.id,
                    type: 24,
                    invoice_id: invoice.id,
                    is_read: false
                }
            });

            if (notification) {
                const updateNotification = notification.update({
                    is_read: true,
                    updatedAt: new Date()
                });
            }
            
            const worktime_ids = invoice.dataValues.worktime_ids;
            return models['work_times'].findAll({
                where: {
                    id: worktime_ids
                },
                include: [{
                    model: models['breaktimes'],
                    as: 'break_times'
                }, {
                    attributes: ['name'],
                    model: models['schedules'],
                    as: 'schedule'
                }]
            }).then((worktimes) => {
                invoice.dataValues.worktimes = worktimes;
                invoice.dataValues.price = invoice.dataValues.in_contract.price;
                invoice.dataValues.is_hourly = invoice.dataValues.in_contract.is_hourly;

                let invoice_total = 0;
                let invoice_subtotal = 0;
                let invoice_gst = 0;

                let total_worktime_seconds = 0;
                let total_breaktime_seconds = 0;

                const wk_table = worktimes.map((worktime, key) => {
                    let total_bks = 0;
                    worktime.dataValues.break_times.forEach(element => {
                        const duration = moment.duration(moment(element.to).diff(moment(element.from)));
                        const secs = duration.asSeconds();
                        total_breaktime_seconds += secs;
                        total_bks += secs;
                    });
                    const wk_duration = moment.duration(moment(worktime.dataValues.to).diff(moment(worktime.dataValues.from))).asSeconds();
                    total_worktime_seconds += wk_duration;
                    const total_wks = wk_duration - total_bks;
                    let invoice_price = (total_wks / 3600) * invoice.dataValues.in_contract.price;
                    invoice_total += invoice_price;
                    let startTime = moment(worktime['from']).utc(), endTime = moment(worktime['to']).utc();
                    if (tz > 0) {
                        startTime = startTime.add(tz, 'seconds');
                        endTime = endTime.add(tz, 'seconds');
                    } else {
                        startTime = startTime.subtract(-tz, 'seconds');
                        endTime = endTime.subtract(-tz, 'seconds');
                    }

                    return `
                        <tr class="invoice-tr">
                            <td>${startTime.format('L')}</td>
                            <td>${worktime.schedule.name}</td>
                            <td>${startTime.format('HH:mm') + ' - ' + endTime.format('HH:mm')}</td>
                            <td>${worktime['break_times'].map(bk => {
                                return bk.type;
                            }).join('<br>')}</td>
                            <td>${worktime.dataValues['break_times'].map(bk => {
                                let start_at = moment(bk['from']).utc(), end_at = moment(bk['to']).utc();
                                if (tz > 0) {
                                    start_at = start_at.add(tz, 'seconds');
                                    end_at = end_at.add(tz, 'seconds');
                                } else {
                                    start_at = start_at.subtract(-tz, 'seconds');
                                    end_at = end_at.subtract(-tz, 'seconds');
                                }
                                return (start_at.format('HH:mm') + ' - ' + end_at.format('HH:mm'))
                            }).join('<br>')}</td>
                            <td>${(total_bks/3600).toFixed(2)}</td>
                            <td>${invoice.dataValues['in_contract'].is_hourly && (invoice.jobber_type === 'Sole Trader' || invoice.jobber_type === 'Company') ?('$' + invoice.dataValues['in_contract'].price):''}</td>
                            <td>${(total_wks/3600).toFixed(2)}</td>
                            <td>${!invoice.dataValues['in_contract'].is_hourly?('$' + invoice.dataValues['in_contract'].price):''}</td>
                            <td>${invoice.jobber_type === 'Sole Trader' || invoice.jobber_type === 'Company' ? '$' + invoice_price : (total_wks/3600).toFixed(2)}</td>
                        </tr>`;
                    }
                );

                invoice_gst = invoice_total / 10;
                invoice_subtotal = invoice_total - invoice_gst;
                return readHTMLFile(__dirname + '/../templates/invoice/invoice_format.html', function (error, html) {
                    if(error){
                        return res.status(500).json({result: "error", msg: "Internal Server Error"}).end();
                    }
                    let template = handlebars.compile(html);
                    let replacements = {
                        isAgency: invoice.jobber_type === 'Sole Trader' || invoice.jobber_type === 'Company',
                        sender_trading_name: invoice.dataValues.sender_trading_name,
                        sender_username: invoice.dataValues.sender_username,
                        sender_email: invoice.dataValues.sender_email,
                        invoice_no: invoice.dataValues.invoice_no,
                        invoice_date: moment(invoice.dataValues.createdAt).format('DD/MM/YYYY'),
                        sender_abn: invoice.dataValues.sender_abn,
                        due_date: moment(invoice.dataValues.due_date).format('DD/MM/YYYY'),
                        bill_to: invoice.dataValues.receiver_name,
                        receiver_name: invoice.dataValues.receiver_name,
                        receiver_email: invoice.dataValues.receiver_email,
                        invoice_for: invoice['in_contract'].job.title,
                        purchase_order: invoice.purchase_order,
                        has_purchase_order: !!invoice.purchase_order,
                        invoice_subtotal: '$' + invoice_subtotal,
                        is_gst_registered: invoice.is_gst_registered && (invoice.jobber_type === 'Sole Trader' || invoice.jobber_type === 'Company'),
                        invoice_gst: '$' + invoice_gst,
                        invoice_total: invoice.jobber_type === 'Sole Trader' || invoice.jobber_type === 'Company' ?
                            '$' + invoice_total : ((total_worktime_seconds - total_breaktime_seconds)/3600).toFixed(2),
                        account_name: invoice.dataValues.acc_name,
                        invoice_bsb: invoice.dataValues.bsb,
                        invoice_acc: invoice.dataValues.acc_number,
                        table_content: wk_table
                    };

                    let htmlPdf = template(replacements);
                    const download_link = './static/downloads/' + moment().unix() + '.pdf';
                    return pdf.create(htmlPdf, {height: '210mm', width: '297mm'}).toFile(download_link, function(err, response) {
                        if (err){
                            console.log(err);
                            return res.status(500).json({result: "error", msg: "Failed to download invoice"}).end();
                        }
                        invoice.dataValues.total_price = invoice_total;
                        invoice.dataValues.total_worktime_seconds = total_worktime_seconds;
                        invoice.dataValues.total_breaktime_seconds = total_breaktime_seconds;
                        invoice.dataValues.download_link = process.env.PROTOCOL + '://' + process.env.DOMAIN + download_link.substring(1);

                        return res.status(200).json({result: "success", invoice, download_link});
                      });
                })
            }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((error) => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateInvoice: async function (req, res) {
        let query = req.body;
        const id = req.params;

        if(query.job_id){
            try{
                const job_info = await models['jobs'].findOne({
                    where: {
                        id: job_id
                    },
                    include: [
                        {
                            attributes: ['id', 'first_name', 'last_name', 'email', 'company'],
                            model: models['users'],
                            as: 'hirer'
                        }
                    ]
                });

                query.receiver_id = job_info.hirer.id;
                query.receiver_name = job_info.hirer.first_name + " " + job_info.hirer.last_name,
                query.receiver_email = job_info.hirer.email,
                query.receiver_company = job_info.hirer.company
            }catch(error) {
                console.log(error);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            }
        }

        return models['invoices'].update(
            query,
            {
                where: {
                    id: id
                }
            }
        ).then((row) => {
            return res.status(200).json({result: 'success', invocie: row}).end();
        }).catch(error => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    deleteInvoice: function (req, res) {
        const id = req.params.id;
        const owner_id = req.session.user.id;

        return models['invoices'].update(
            {deleted_at: moment()},
            {
                where: {
                    id: id,
                    sender_id: owner_id
                }
            }
        ).then(() => {
            return res.status(200).json({result: "success"}).end();
        }).catch(error => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getLastInvoice: function (req, res) {
        const user = req.session.user;
        return models['invoices'].findAll({
            where: {
                sender_id: user.id
            },
            limit: 10,
            order: [
                ['createdAt', 'DESC']
            ]
        }).then((invoices) => {

            if(invoices.length === 0){
                const invoice_info = {
                    invoice_no: 0,
                    jobber_type: user.company?user.company:"Sole Trader",

                    sender_trading_name: user.company?user.company:(user.first_name + " " + user.last_name),
                    sender_abn: '',
                    sender_username: user.first_name + " " + user.last_name,
                    sender_company: user.company,
                    sender_email: user.email
                }
                return res.status(200).json({result: "success", invoice_info: invoice_info}).end();
            }else{
                invoice_info = invoices[0].dataValues;
                return res.status(200).json({result: "success", invoice_info: invoice_info}).end()
            }
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    makeInvoicePdf: function (req, res) {
        const { id } = req.query;

        return models['invoices'].findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: models['contracts'],
                    as: 'in_contract'
                }
            ]
        }).then((invoice) => {
            if(!invoice)
                return res.status(500).json({result: "error", errorCode: 1}).end();
            const worktime_ids = invoice.dataValues.worktime_ids;
            return models['work_times'].findAll({
                where: {
                    id: worktime_ids
                },
                include: [
                    {
                        model: models['breaktimes'],
                        as: 'break_times'
                    }
                ]
            }).then((worktimes) => {
                if(worktimes.length === 0)
                    return res.status(500).json({result: "error", errorCode: 1}).end();
                const bill_to = invoice.dataValues.receiver_company?invoice.dataValues.receiver_company:(invoice.dataValues.receiver_name);
                const receiver_name = invoice.dataValues.receiver_name;
                const receiver_email = invoice.dataValues.receiver_email;

                let invoice_total = 0;
                let invoice_subtotal = 0;
                let invoice_gst = 0;

                const wk_table = worktimes.map((worktime, key) => {
                    let total_bks = 0;
                    worktime.dataValues.breaktimes.forEach(element => {
                        const duration = moment.duration(element.to.diff(element.from));
                        const secs = duration.asSeconds();
                        total_bks += secs;
                    });
                    const wk_duration = moment.duration(worktime.dataValues.to.diff(worktime.dataValues.from));
                    const total_wks = wk_duration.asSeconds() - total_bks;
                    invoice_price = (total_wks / 3600) * invoice.dataValues.in_contract.price
                    invoice_total += invoice_price;
                    return `<tr>
                                <td>${moment(worktime.dataValues.from).format('L')}</td>
                                <td>${worktime.dataValues.comment}</td>
                                <td>${moment(worktime.dataValues.from).format('LT') + '-' + moment(worktime.dataValues.to).format('LT')}</td>
                                <td>${worktime}</td>
                                <td>${total_bks}</td>
                                <td>${invoice.dataValues.in_contract.is_hourly?('$' + invoice.dataValues.in_contract.price):''}</td>
                                <td>${total_wks}</td>
                                <td>${!invoice.dataValues.in_contract.is_hourly?('$' + invoice.dataValues.in_contract.price):''}</td>
                                <td>$${invoice_price}</td>
                            </tr>`;
                    }
                );

                invoice_gst = invoice_total / 10;
                invoice_subtotal = invoice_total - invoice_gst;
                return readHTMLFile(__dirname + '/../templates/invoice/invoice_format.html', function (error, html) {
                    if(error){
                        return res.status(500).json({result: "error", msg: "Internal Server Error"}).end();
                    }
                    let template = handlebars.compile(html);
                    let replacements = {
                        isAgency: invoice.jobber_type === 'Sole Trader' || invoice.jobber_type === 'Company',
                        sender_trading_name: invoice.dataValues.sender_trading_name,
                        sender_username: invoice.dataValues.sender_username,
                        sender_email: invoice.dataValues.sender_email,
                        invoice_no: invoice.dataValues.invoice_no,
                        invoice_date: moment(invoice.dataValues.createdAt).format('YYYY-MM-DD'),
                        sender_abn: invoice.dataValues.sender_abn,
                        due_date: invoice.dataValues.due_date,
                        bill_to: invoice.dataValues.receiver_name,
                        receiver_name: invoice.dataValues.receiver_name,
                        receiver_email: invoice.dataValues.receiver_email,
                        purchase_order: invoice.dataValues.purchase_order,
                        invoice_subtotal: invoice_total,
                        invoice_gst: invoice_gst,
                        invoice_total: invoice_subtotal,
                        account_name: invoice.dataValues.sender_username,
                        invoice_bsb: '',
                        invoice_acc: '',
                        table_content: wk_table };

                    let htmlPdf = template(replacements);

                    return pdf.create(htmlPdf, {height: '176mm', width: '250mm'}).toFile('/static/downloads/invoice.pdf', function(err, resposne) {
                        if (err){
                            console.log(err);
                            return res.status(500).json({result: "error", msg: "Failed to download invoice"}).end();
                        }

                        return res.status(200).json({result: "success", res: resposne});
                      });
                })
            }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    downloadFile: function(req, res) {
        const { download_link } = req.query;
        return res.download(download_link);
    }
};
