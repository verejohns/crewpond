const {validation, time} = require('../../utils');
const models = require('../models');
const notificationController = require('./notificationController');
const paymentController = require('./paymentController');
const {isEmpty, merge} = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    createFeedback: function (req, res) {
        const { contract_id, comment, failure_reason, score, success } = req.body;
        const user_id = req.session.user.id;

        if (validation.isEmpty(contract_id))
            return res.status(500).json({result: "error", errorCode: 33});

        return Promise.all([
            models['contracts'].findOne({
                where: {
                    id: contract_id,
                    deleted_at: null
                }
            }),
            models['feedbacks'].findOne({
                where: {
                    contract_id: contract_id,
                    from_user_id: user_id
                }
            })
        ]).then(([contract, exist_feedback]) => {
            if(isEmpty(contract)) {
                return res.status(500).json({result: "error", errorCode: 33}).end();
            }
            if(exist_feedback) {
                return res.status(500).json({result: "error", errorCode: 34}).end();
            }

            let feedback = {
                contract_id: contract_id,
                comment: comment,
                failure_reason: failure_reason,
                is_private: false,
                job_id: contract.dataValues.job_id,
                score: score,
                success: success
            };

            let update_contract = {};
            if(user_id === contract.dataValues.hirer_id){
                feedback.from_user_id = user_id;
                feedback.to_user_id = contract.dataValues.jobber_id;
                feedback.is_from_hirer = true;
                update_contract.read_hirer = true;
                update_contract.read_jobber = false;
            }

            if(user_id === contract.dataValues.jobber_id){
                feedback.from_user_id = user_id;
                feedback.to_user_id = contract.dataValues.hirer_id;
                feedback.is_from_hirer = false;
                update_contract.read_hirer = false;
                update_contract.read_jobber = true;
            }

            return Promise.all([
                models['feedbacks'].create(feedback),
                models['jobs'].findOne({
                    where: {
                        id: contract.dataValues.job_id
                    }
                }),
                models['jobs'].update(
                {has_update: true},
                {
                    where: {
                        id: contract.dataValues.job_id
                    }
                }),
                contract.update(update_contract)
            ])
            .then(async([row, job]) => {
                if (job.dataValues.is_urgent && req.session.user.id === job.dataValues.owner_id) {
                    paymentController.payoutSOSUrgentToJobber(contract.jobber_id, contract.job_id, success);
                }

                const notification = {
                    sender_id: req.session.user.id,
                    receiver_id: row.dataValues.to_user_id,
                    type: 16,
                    title: '',
                    description: `${req.session.user.first_name} ${req.session.user.last_name} sent you feedback for - ${job.title}.`,
                    is_broadcast: false,
                    feedback_id: row.dataValues.id,
                    contract_id: contract_id,
                    job_id: contract.dataValues.job_id,
                    is_read: false
                };

                notificationController.createNotification(notification, [row.dataValues.to_user_id]);
                return res.status(200).json({result: "success", feedback: row}).end();
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getFeedbacks: function (req, res) {
        const { job_id, contract_id, user_id, limit, orderBy, lastValue } = req.query;
        const user = req.session.user;

        let val_where = {}, opt = {};

        if(job_id){//get job feedbacks
            val_where.job_id = job_id;
        }
        if(contract_id){//get contract feedbacks
            val_where.contract_id = contract_id;
        }
        if(user_id){//get user feedbacks
            val_where.to_user_id = user_id;
        }

        if(!user_id){
            val_where[Op.or] = [
                {
                    [Op.and]: [
                        {from_user_id: user.id},
                        {is_from_hirer: false}
                    ]
                },
                {
                    [Op.and]: [
                        {to_user_id: user.id},
                        {is_from_hirer: true}
                    ]
                },
            ];
        }
        if(lastValue){
            val_where.id = {
                [Op.lt]: lastValue
            }
        }

        val_where.deleted_at = null;

        opt.where = val_where;
        // if(orderBy)
        opt.order = [['updatedAt', 'DESC']];
        opt.include = [{
            attributes: ["id", "first_name", "last_name", "avatar"],
            model: models["users"],
            as: 'from_user'
        }, {
            attributes: ["id", "first_name", "last_name", "avatar"],
            model: models["users"],
            as: 'to_user'
        }];

        if(limit) {
            opt.limit = limit;
        }
        console.log(opt)
        return models['feedbacks'].findAll(opt).then((rows) => {
            let response = {};
            response.result = "success";
            response.feedbacks = rows;
            if(!contract_id && !job_id)
                response.lastValue = rows.length > 0?("" + rows[rows.length - 1].dataValues.id):-1;
            return res.status(200).json(response).end()
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    makeFeedbackAsPrivate: function (req, res) {
        const { id, is_private } = req.body;
        const user = req.session.user;

        return models['feedbacks'].findOne({
            where: {
                id: id,
                to_user_id: user.id,
                deleted_at: null
            }
        }).then((feedback) => {
            if(!feedback)
                return res.status(500).json({result: "error", errorCode: 1}).end();
            return feedback.update({is_private: is_private})
            .then(() => res.status(200).json({result: "success", id: feedback.id}).end())
            .catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getFeedbackById: function (req, res) {
        const { id } = req.params;
        const user = req.session.user;

        return models.feedback.findOne({
            where: {
                id: id,
                [Op.or]: [
                    {[Op.and]: [
                        {from_user_id: user.id},
                        {is_from_hirer: false}
                    ]},
                    {[Op.and]: [
                        {to_user_id: user.id},
                        {is_from_hirer: true}
                    ]},
                ],
                deleted_at: null
            },
            include: [{
                attributes: ["id", "first_name", "last_name", "avatar"],
                model: models.users,
                as: 'jobber'
            }],
            include: [{
                attributes: ["id", "first_name", "last_name", "avatar"],
                model: models.users,
                as: 'hirer'
            }]
        }).then((feedback) => {
            return res.status(200).json({result: "success", feedback }).end();
        }).catch(error => console.log(error) || res.status(500).json({result: "error", msg: "Internal Server Error"}).end());
    },

    updateFeedback: function (req, res) {
        const id = req.params.id;
        const query = req.body;
        const owner_id = req.session.user.id;

        return models.feedbacks.findOne({
            where: {
                id: id,
                from_user_id: owner_id,
                deleted_at: null
            }
        }).then((feedback) => {
            if(isEmpty(feedback)){
                return res.status(500).json({result: "error", msg: "Invalid request"}).end();
            }
            merge(query, {
                updatedAt: new Date()
            });
            feedback.update(query).then(() => {
                return res.status(200).json({result: "success", msg: 'The feedback was updated successfully.'}).end();
            }).catch(error => { console.log("login -> user.update Error: ", error); return res.status(422).json({result: "error", msg: "Internal Server Error"}).end(); });
        }).catch(error => console.log(error) || res.status(500).json({result: "error", msg: "Internal Server Error!"}));
    },

    deleteFeedback: function (req, res) {
        const id = req.params.id;
        const owner_id = req.session.user.id;

        return models.feedbacks.findOne({
            where: {
                id: id,
                from_user_id: owner_id,
                deleted_at: null
            }
        }).then((feedback) => {
            if(isEmpty(feedback)){
                return res.status(500).json({result: "error", msg: "Invalid request"}).end();
            }
            feedback.update({deleted_at: new Date()}).then(() => {
                return res.status(200).json({result: "success", msg: 'The feedback was deleted successfully.'}).end();
            }).catch(error => { console.log("login -> user.update Error: ", error); return res.status(422).json({result: "error", msg: "Internal Server Error"}).end(); });
        }).catch(error => console.log(error) || res.status(500).json({result: "error", msg: "Internal Server Error!"}));
    },

    updateFeedbackByUser: async function (req, res) {
        if(!req.session.admin)
            return res.status(500).json({result: "error", msg: "Invalid request"}).end();
        const id = req.params.id;
        const query = req.body;

        for(let i = 0; i < query.length; i += 1) {
            try {
                let feedback = await models.feedbacks.findOne({
                    where: {
                        id: query[i].id,
                        to_user_id: id,
                        deleted_at: null
                    }
                });

                if(!isEmpty(feedback)){
                    console.log(query[i])

                    merge(query[i], {
                        updatedAt: new Date()
                    });
                    await feedback.update(query[i]);
                }
                
            }catch(error){
                console.log(error)
                return res.status(500).json({result: "error", msg: "Internal Server Error!"});
            }
        }
        return res.status(200).json({result: "success", msg: 'The feedback was updated successfully.'}).end();
    }
};
