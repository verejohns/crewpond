const models = require('../models');

module.exports = {
    getCategories: function (req, res) {
        models['categories'].findAll({
            attributes: ['main', 'sub', 'deep'],
            order: [['createdAt']]
        })
        .then((rows) => {
            return res.status(200).json({result: "success", categories: rows});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },
};
