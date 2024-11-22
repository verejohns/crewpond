const {validation, time} = require('../../utils');
const models = require('../models');
const Sequelize = require('sequelize');

module.exports = {
    getFaqs: function (req, res) {
        return models.faqs.find()
        .then((faqs) => {
            console.log(faqs);
            return res.status(200).json({result: "success", faqs}).end();
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        })
    },

    getTerms: function (req, res) {
        return models.terms.find()
        .then((terms) => {
            return res.status(200).json({result: "success", terms}).end();
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        })
    },
};
