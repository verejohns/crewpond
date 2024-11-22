const {validation, time} = require('../../utils');
const models = require('../models');
const {isEmpty, merge} = require('lodash');
const moment = require('moment/moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    favoriteUser: function (req, res) {
        const { to_user_id, is_favorite } = req.body;

        const from_user_id = req.session.user.id;

        return models.users.findOne({
            where: {
                id: to_user_id
            }
        }).then((user) => {
            if(isEmpty(user)) {
                return res.status(500).json({result: "error", errorCode: 1}).end();
            }

            return models.favorites.findOne({
                where: {
                    from_user_id: from_user_id,
                    to_user_id: to_user_id
                }
            }).then((favorite) => {
                if(isEmpty(favorite)){
                    const new_favorite = {
                        from_user_id: from_user_id,
                        to_user_id: to_user_id
                    };

                    return models.favorites.create(new_favorite)
                    .then(() => {
                        return res.status(200).json({result: "success"}).end();
                    }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
                }else{
                    return favorite.update({deleted_at: !is_favorite?new Date():null})
                    .then(() => {
                        return res.status(200).json({result: "success", msg: "Favorite update request succeed"}).end();
                    }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
                }
            }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());

        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    }
};
