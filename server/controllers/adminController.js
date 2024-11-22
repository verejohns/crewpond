const moment = require('moment');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { time, functions } = require('../../utils');

const models = require('../models');

module.exports = {
    getPaymentGraph: function(req, res) {
        const { unit } = req.query;
        let time_limit = new Date();
        if(unit === 'year'){
            time_limit.setFullYear(time_limit.getFullYear() - 5);
        }else if(unit === 'month') {
            time_limit.setMonth(time_limit.getMonth() - 12);
        }else if(unit === 'week') {
            time_limit.setDate(time_limit.getDate() - 7);
        }

        return Promise.all([
            stripe.balance.retrieve(),
            stripe.balanceTransactions.list({
                created: {
                    gt: time_limit
                }
            })
        ]).then(([sum_balance, balances]) => {
            let balances_graph = [];
            if(unit === 'year'){
                balances_graph = sortByYearly(balances.data);
            }else if(unit === 'month') {
                balances_graph = sortByMonthly(balances.data);
            }else if(unit === 'week') {
                balances_graph = sortByWeekly(balances.data);
            }

            return res.status(200).json({result: "success", data: {sum_balance, balances_graph, unit}}).end();
        }).catch((error) =>console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getCardGraph: function (req, res) {
        const { unit } = req.query;
        let time_limit = new Date();
        if(unit === 'year'){
            time_limit.setFullYear(time_limit.getFullYear() - 5);
        }else if(unit === 'month') {
            time_limit.setMonth(time_limit.getMonth() - 12);
        }else if(unit === 'week') {
            time_limit.setDate(time_limit.getDate() - 7);
        }

        return Promise.all([
            models['users'].count({
                where: {
                    deleted_at: null,
                }
            }),
            models['users'].findAll({
                where: {
                    deleted_at: null,
                    is_suspended: false,
                    is_closed: false,
                    confirmed_at: {
                        [Op.ne]: null
                    },
                    createdAt: {
                        [Op.gt]: time_limit
                    }
                }
            }),
            models['jobs'].count({
                where: {
                    deleted_at: null,
                }
            }),
            models['jobs'].findAll({
                where: {
                    is_cancelled: false,
                    is_closed: false,
                    is_completed: false,
                    deleted_at: null,
                    createdAt: {
                        [Op.gt]: time_limit
                    }
                }
            }),
        ]).then(([user_number, users, job_number, jobs]) => {
            let users_graph = [], jobs_graph = []
            if(unit === 'year'){
                users_graph = sortByYearly(users);
                jobs_graph = sortByYearly(jobs);
            }else if(unit === 'month') {
                users_graph = sortByMonthly(users);
                jobs_graph = sortByMonthly(jobs);
            }else if(unit === 'week') {
                users_graph = sortByWeekly(users);
                jobs_graph = sortByWeekly(jobs);
            }

            return res.status(200).json({result: "success", data: {user_number, users_graph, job_number, jobs_graph, unit}}).end();
        }).catch((error) =>console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getContractGraph: function (req, res) {
        const { unit } = req.query;
        let time_limit = new Date();
        if(unit === 'year'){
            time_limit.setFullYear(time_limit.getFullYear() - 5);
        }else if(unit === 'month') {
            time_limit.setMonth(time_limit.getMonth() - 12);
        }else if(unit === 'date') {
            time_limit.setDate(time_limit.getDate() - 31);
        }else if(unit === 'hour') {
            time_limit.setDate(time_limit.getHours() - 24);
        }

        return models['contracts'].findAll({
            where: {
                createdAt: {
                    [Op.gt]: time_limit
                }
            }
        }).then((contracts) => {
            let contracts_graph = [];
            if(unit === 'year'){
                contracts_graph = sortByYearly(contracts);
            }else if(unit === 'month') {
                contracts_graph = sortByMonthly(contracts);
            }else if(unit === 'week') {
                contracts_graph = sortByWeekly(contracts);
            }else if(unit === 'date') {
                contracts_graph = sortContractByDaily(contracts);
            }else if(unit === 'hour') {
                contracts_graph = sortByHourly(contracts);
            }
            console.log(contracts_graph)

            return res.status(200).json({result: "success", data: contracts_graph}).end();
        }).catch((error) =>console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getTopRatedUsers: function (req, res) {
        const { limit } = req.query;
        return models['users'].findAll({
            attributes: ["id", "avatar", "first_name", "last_name", "email", "company", "description", "categories", "address", "last_login_time",
                        [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'avg_score']],
            where: {
                deleted_at: null,
                is_suspended: false,
                is_closed: false,
                confirmed_at: {
                    [Op.ne]: null
                }
            },
            order: [
                [Sequelize.literal('avg_score'), 'ASC']
            ],
            limit: limit
        }).then((users) => {
            let top_users = [];
            for(let id = 0; id < users.length; id += 1){
                if(users[id].dataValues.avg_score){
                    users[id].dataValues.avatar = functions.convertLocalToPublic(users[id].dataValues.avatar);
                    top_users.push(users[id].dataValues);
                }
                
            }
            return res.status(200).json({result: 'success', data: top_users}).end();
        }).catch((error) =>console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getUsersInfo: function(req, res) {
        return Promise.all([
            models['users'].count({
                where: {
                    deleted_at: null,
                    is_suspended: false,
                    is_closed: false
                }
            }),
            models['users'].count({
                where: {
                    deleted_at: null,
                    is_suspended: true,
                }
            }),
            models['users'].count({
                where: {
                    deleted_at: null,
                    is_closed: true,
                }
            })
        ]).then(([available_users, suspended_users, closed_users]) => {
            return res.status(200).json({result: "success", data: {available_users, suspended_users, closed_users}}).end();
        }).catch((error) =>console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getJobsInfo: function(req, res) {
        return Promise.all([
            models['jobs'].count({
                where: {
                    deleted_at: null,
                    is_assigned: false,
                    is_cancelled: false,
                    is_closed: false,
                    is_completed: false
                }
            }),
            models['jobs'].count({
                where: {
                    deleted_at: null,
                    is_assigned: true
                }
            }),
            models['jobs'].count({
                where: {
                    deleted_at: null,
                    is_cancelled: true,
                }
            }),
            models['jobs'].count({
                where: {
                    deleted_at: null,
                    is_closed: true,
                }
            }),
            models['jobs'].count({
                where: {
                    deleted_at: null,
                    is_completed: true,
                }
            })
        ]).then(([opened_jobs, assigned_jobs, cancelled_jobs, closed_jobs, completed_jobs]) => {
            return res.status(200).json({result: "success", data: {opened_jobs, assigned_jobs, cancelled_jobs, closed_jobs, completed_jobs}}).end()
        }).catch((error) =>console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    }
};

function sortByMonthly(list){
    let sortedList = [];
    for(let i = 11; i >= 0; i -= 1){
      const monthItem = list.filter(function(element) {
        const diff = time.inMonths(moment(element.created?element.created:element.dataValues.createdAt).toDate(), moment().toDate());
        if(diff == i)
          return true;
        else
          return false;
      });
      sortedList.push(monthItem?monthItem.length:0);
    }

    return sortedList;
}

function sortByWeekly(list){
    let sortedList = [];
    for(let i = 6; i >= 0; i -= 1){
      const weekItem = list.filter(function(element) {
        const diff = time.inWeeks(moment(element.created?element.created:element.dataValues.createdAt).toDate(), moment().toDate());
        if(diff == i)
          return true;
        else
          return false;
      });
      sortedList.push(weekItem?weekItem.length:0);
    }

    return sortedList;
}

function sortByYearly(list){
    let sortedList = [];
    for(let i = 4; i >= 0; i -= 1){
      const yearItem = list.filter(function(element) {
        const diff = time.inYears(moment(element.created?element.created:element.dataValues.createdAt).toDate(), moment().toDate());
        if(diff == i)
          return true;
        else
          return false;
      });
      sortedList.push(yearItem?yearItem.length:0);
    }

    return sortedList;
}

function sortByDaily(list){
    let sortedList = [];
    for(let i = 30; i >= 0; i -= 1){
      const dateItem = list.filter(function(element) {
        const diff = time.inDates(moment(element.created?element.created:element.dataValues.createdAt).toDate(), moment().toDate());
        if(diff == i)
          return true;
        else
          return false;
      });
      sortedList.push(dateItem?dateItem.length:0);
    }

    return sortedList;
}

function sortContractByDaily(list){
    let sortedList = [];
    for(let i = 30; i >= 0; i -= 1){
      const dateItem = list.filter(function(element) {
        const diff = time.inDates(moment(element.created?element.created:element.dataValues.createdAt).toDate(), moment().toDate());
        if(diff == i)
          return true;
        else
          return false;
      });
      sortedList.push(dateItem?dateItem.length:0);
    }

    return sortedList;
}

function sortByHourly(list){
    let sortedList = [];
    for(let i = 6; i >= 0; i -= 1){
      const hourItem = list.filter(function(element) {
        const diff = time.inHours(moment(element.created?element.created:element.dataValues.createdAt).toDate(), moment().toDate());
        if(diff == i)
          return true;
        else
          return false;
      });
      sortedList.push(hourItem?hourItem.length:0);
    }

    return sortedList;
}
