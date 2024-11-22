const models = require('../models');
const { hash, tokens, functions } = require('../../utils');
const { merge, omit, isEmpty } = require('lodash');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {pusherTrigger} = require('../pusher')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
    getJobberType: function (req, res) {
        return models['job_types'].findAll().then((job_types) => {
            return res.status(200).json({result: "success",job_types});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}));
    },

    closeAccount: function (req, res) {
        const { user } = req.session;

        return Promise.all([
            models['users'].update(
                {is_closed: true},
                {
                    where: {
                        id: user.id
                    }
                }
            ),
            models['user_tokens'].update(
                {deletedAt: new Date()},
                {
                    where: {
                        user_id: user.id
                    }
                }
            )
        ]).then(() => {
            return res.status(200).json({result: "success"}).end();
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getUserById: function (req, res) {
        const { id } = req.params;
        let val_attrs = [
            "id", "avatar", "first_name", "last_name", "email", "availability", "company", "birthday", "jobber_type", "experience_from", "experience_years", "experience_months", "is_key_hirer", "is_key_jobber", "description", "categories", "address", "place_name", "latitude", "longitude", "trial_period", "createdAt",
            [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'score'],
            [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
        ];

        return models['users'].findByPk(id, {
            attributes: val_attrs
        }).then(async(user) => {
            if(!user)
                return res.status(200).json({result: "success", user: null});
            user.dataValues.avatar = functions.convertLocalToPublic(user.dataValues.avatar);
            user.dataValues.experience_from = user.dataValues.experience_from ? moment(user.dataValues.experience_from).format('YYYY-MM-DD') : null;
            if (user.dataValues.address || user.dataValues.place_name || user.dataValues.latitude || user.dataValues.longitude) {
                user.dataValues.location = {
                    address: user.dataValues.address,
                    place_name: user.dataValues.place_name,
                    latitude: user.dataValues.latitude,
                    longitude: user.dataValues.longitude,
                };
            }
            user.dataValues.review = {
                score: user.dataValues.score,
                number_of_completed: user.dataValues.number_of_completed,
                number_of_feedback: user.dataValues.number_of_feedback,
                number_of_success: user.dataValues.number_of_success,
            };
            user.dataValues = omit(user.dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_completed', 'number_of_feedback', 'score']);

            // Check if user has an active or trialling "Super User" subscription. If so, set is_key_hirer flag to true

            const stUserId = await models['st_customers'].findOne({
                where: {
                    user_id: id
                }
            });

            let stripeSubscriptionsList = null;
            user.dataValues.is_key_hirer = false;

            try {
                if (stUserId.dataValues.stripe_id) {
                    stripeSubscriptionsList = await stripe.subscriptions.list(
                    {
                        limit: 10,
                        customer: stUserId.dataValues.stripe_id,
                        status: 'all'
                    });
    
                    stripeSubscriptionsList = stripeSubscriptionsList.data;
                }
            } catch (e) {
                user.dataValues.is_key_hirer = false;
                user.dataValues.is_key_jobber = false;

                return res.status(200).json({result: "success", user: user});
            }

            for (let i = 0; i < stripeSubscriptionsList.length; i++) {
                if (stripeSubscriptionsList[i].plan.id === process.env.PRODUCT_WEB_PORTAL && (stripeSubscriptionsList[i].status === 'active' || stripeSubscriptionsList[i].status === 'trialing')) {
                    user.dataValues.is_key_hirer = true;
                }
            }
             // End subscriptions check

            let is_favorite = null;
            if(req.session.user && req.session.user.id !== id) {
                try {
                    const favorite = await models['favorites'].findOne({
                        where: {
                            from_user_id: req.session.user.id,
                            to_user_id: id,
                            deleted_at: null
                        }
                    });
                    if(favorite)
                        is_favorite = true;
                    else
                        is_favorite = false;
                    const web_user = await models['web_users'].findOne({
                        where: {
                            user_id: req.session.user.id
                        }
                    });
                    if(web_user)
                        user.dataValues.is_super = true;
                }catch(err) {
                    console.log(err);
                }
            }

            user.dataValues.is_favorite = is_favorite;
            return res.status(200).json({result: "success", user: user});
        }).catch((error) => console.log(error)||res.status(500).json({result: error + " error 1", errorCode: 0}).end());
    },

    //if log in user is super user, get sub users.
    //if log in user is sub user, get main user.
    getSubUsers: function (req, res) {
        let val_where = {};
        if(req.session.user.sub_accounts === 0){//super user
            val_where.main_user_id = req.session.user.id;
        }else {//sub user
            val_where.sub_user_id = req.session.user.id;
        }

        return models['sub_accounts'].findAll({
            where: val_where
        }).then((rows) => {
            let user_ids = [];
            if(req.session.user.sub_accounts === 0) {//super user
                user_ids = rows.map(el=>el.sub_user_id);
            }else {//sub user
                user_ids = rows.map(el=>el.main_user_id);
            }

            const val_attrs = [
                "id", "avatar", "first_name", "last_name", "email", "availability", "company", "birthday", "experience_from", "experience_years", "experience_months", "is_key_hirer", "jobber_type",
                "is_key_jobber", "description", "categories", "address", "place_name", "latitude", "longitude", "createdAt",
                [Sequelize.literal(`(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)`), 'score'],
                [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                [Sequelize.literal(`(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)`), 'number_of_success'],
                [Sequelize.literal(`(SELECT COUNT(*) FROM favorites WHERE favorites.to_user_id = users.id AND favorites.from_user_id = ${req.session.user.id} AND favorites.deleted_at IS NULL)`), 'is_favorite']
            ];
            return models['users'].findAll({
                attributes: val_attrs,
                where: {
                    id: user_ids,
                    deleted_at: null
                }
            }).then((rows) => {
                for (let i = 0; i < rows.length; i ++) {
                    rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
                    if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                        rows[i].dataValues.location = {
                            address: rows[i].dataValues.address,
                            place_name: rows[i].dataValues.place_name,
                            latitude: rows[i].dataValues.latitude,
                            longitude: rows[i].dataValues.longitude,
                        };
                    }
                    rows[i].dataValues.review = {
                        score: rows[i].dataValues.score,
                        number_of_completed: rows[i].dataValues.number_of_completed,
                        number_of_feedback: rows[i].dataValues.number_of_feedback,
                        number_of_success: rows[i].dataValues.number_of_success,
                    };
                    rows[i].dataValues.is_favorite = rows[i].dataValues.is_favorite === "1";
                    rows[i].dataValues = omit(rows[i].dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
                }
                return res.status(200).json({result: "success", users: rows}).end();
            }).catch((error) => {
                console.log(error);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            });
        }).catch((error) => {
            console.log(error);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        });
    },

    getUsersByIds: function (req, res) {
        const { user_ids } = req.query;
        let val_attrs = [
            "id", "avatar", "first_name", "last_name", "email", "availability", "company", "birthday", "experience_from", "experience_years", "experience_months", "is_key_hirer", "is_key_jobber", "jobber_type", "description", "categories", "address", "place_name", "latitude", "longitude", "createdAt",
            [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'score'],
            [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
            [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
        ];

        return models['users'].findAll({
            where: {
                id: user_ids
            },
            attributes: val_attrs
        }).then(rows => {
            for (let i = 0; i < rows.length; i ++) {
                rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
                if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                    rows[i].dataValues.location = {
                        address: rows[i].dataValues.address,
                        place_name: rows[i].dataValues.place_name,
                        latitude: rows[i].dataValues.latitude,
                        longitude: rows[i].dataValues.longitude,
                    };
                }
                rows[i].dataValues.review = {
                    score: rows[i].dataValues.score,
                    number_of_completed: rows[i].dataValues.number_of_completed,
                    number_of_feedback: rows[i].dataValues.number_of_feedback,
                    number_of_success: rows[i].dataValues.number_of_success,
                };
                rows[i].dataValues = omit(rows[i].dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_completed', 'number_of_feedback', 'score']);
            }

            return res.status(200).json({result: "success", users: rows});
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    findUsers: async function(req, res) {
        const { keyword, categories, location, range, offset, limit, orderBy, lastValue, jobber_type } = req.body;
        let val_where = {}, val_having = null,
            val_attrs = [
                "id", "avatar", "first_name", "last_name", "email", "availability", "company", "birthday", "experience_from", "experience_years", "experience_months", "is_key_hirer", "jobber_type",
                "is_key_jobber", "description", "categories", "address", "place_name", "latitude", "longitude", "createdAt",
                [Sequelize.literal(`(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)`), 'score'],
                [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                [Sequelize.literal(`(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)`), 'number_of_success']
            ];

        if (keyword && keyword.length > 0) {
            val_where[Op.or] = [{email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), 'ILIKE', '%' + keyword + '%')}];

            if(keyword.split(' ').length > 1){
                val_where[Op.or].push({first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'ILIKE', '%' + keyword.split(' ').slice(0, -1).join(' ') + '%')});
                val_where[Op.or].push({last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'ILIKE', '%' + keyword.split(' ').slice(-1).join(' ') + '%')});
            }else {
                val_where[Op.or].push({first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'ILIKE', '%' + keyword + '%')});
            }
            // val_where[Op.or] = [
            //     {first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'ILIKE', '%' + first_name + '%')},
            //     {last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'ILIKE', '%' + last_name + '%')},
            //     ,
            //     // {description: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), 'ILIKE', '%' + keyword + '%')},
            //     // {address: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('address')), 'ILIKE', '%' + keyword + '%')},
            //     // {place_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('place_name')), 'ILIKE', '%' + keyword + '%')},
            // ];
        }
        if (categories && categories.length > 0) {
            let q = [];
            for (let i = 0; i < categories.length; i ++) {
                q.push({
                    [Op.contains]: [categories[i]]
                })
            }
            val_where.categories = { [Op.or]: q };
        }
        if (lastValue) {
            try {
                const lastUser = await models['users'].findByPk(lastValue);
                const count = await models['users'].count({where: {id: {[Op.lt]: lastValue}}});
                if(lastUser.is_key_jobber){
                    if(count > 0)
                        val_where.id = {
                            [Op.lt]: lastValue
                        };
                    else {
                        val_where.is_key_jobber = false;
                    }
                }else {
                    val_where.id = {
                        [Op.lt]: lastValue,
                    };
                    val_where.is_key_jobber = false;
                }
            }catch(err) {
                console.log(err);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            }
        }
        if (jobber_type){
            val_where.jobber_type = jobber_type;
            // if (jobber_type === "full_time_worker")
            //     val_where.company = req.session.user.company
        }
        if (location && range) {
            let latitude = 0;
            let longitude = 0;
            if (!isEmpty(location)) {
                latitude = location.latitude;
                longitude = location.longitude;

                val_having = Sequelize.where(Sequelize.literal("6371 * acos(cos(radians("+latitude+")) * cos(radians(latitude)) * cos(radians("+longitude+") - radians(longitude)) + sin(radians("+latitude+")) * sin(radians(latitude)))"), '<', range);
            }
        }
        if (val_having) {
            val_where.having = val_having;
        }
        if (req.session.admin) {
            val_attrs.push("is_suspended");
            val_attrs.push("is_closed");
            val_attrs.push("confirmed_at");
        }
        if (req.session.user) {
            if (val_where.id) {
                val_where.id[Op.ne] = req.session.user.id;
            } else {
                val_where.id = { [Op.ne]: req.session.user.id };
            }

            val_attrs = val_attrs.concat([
                [Sequelize.literal(`(SELECT COUNT(*) FROM favorites WHERE favorites.to_user_id = users.id AND favorites.from_user_id = ${req.session.user.id} AND favorites.deleted_at IS NULL)`), 'is_favorite']]);
        }
        if (!req.session.admin) {
            val_where.confirmed_at = {[Op.ne]: null};
            val_where.is_closed = false;
            val_where.is_suspended = false;
            val_where.availability = true;
        }
        val_where.deleted_at = null;
        let opt = {
            attributes: val_attrs,
            where: val_where,
            order: [['is_key_jobber', 'DESC'], [orderBy, 'DESC']],
            limit: limit
        };
        if (offset) {
            opt.offset = (offset - 1) * limit;
        }
        return Promise.all([
            models['users'].findAll(opt),
            models['users'].count({
                where: val_where
            })
        ]).then(([rows, total]) => {
            for (let i = 0; i < rows.length; i ++) {
                rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
                if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                    rows[i].dataValues.location = {
                        address: rows[i].dataValues.address,
                        place_name: rows[i].dataValues.place_name,
                        latitude: rows[i].dataValues.latitude,
                        longitude: rows[i].dataValues.longitude,
                    };
                }
                rows[i].dataValues.review = {
                    score: rows[i].dataValues.score,
                    number_of_completed: rows[i].dataValues.number_of_completed,
                    number_of_feedback: rows[i].dataValues.number_of_feedback,
                    number_of_success: rows[i].dataValues.number_of_success,
                };
                rows[i].dataValues.is_favorite = rows[i].dataValues.is_favorite === "1";
                rows[i].dataValues = omit(rows[i].dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_completed', 'number_of_feedback', 'score']);
            }

            return res.status(200).json({result: 'success', users: rows, total, lastValue: rows.length ? "" + rows[rows.length - 1].id : null}).end();
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getFavoriteUsers: function (req, res) {
        const { keyword, categories, location, range, offset, limit, orderBy, lastValue, jobber_type } = req.body;
        const from_user_id = req.session.user.id;

        return models['favorites'].findAll({
            attributes: ['to_user_id'],
            where: {
                from_user_id,
                deleted_at: null
            }
        }).then((favorites) => {
            if (!favorites || favorites.length === 0) {
                return res.status(200).json({result: "success", users: []});
            }

            let user_ids = [], val_where = {}, val_having = null, val_attrs = [
                "id", "avatar", "first_name", "last_name", "email", "availability", "company", "jobber_type",
                "birthday", "experience_from", "experience_years", "experience_months", "is_key_hirer", "is_key_jobber", "description",
                "categories", "address", "place_name", "latitude", "longitude", "createdAt"
            ];
            for (let i = 0; i < favorites.length; i ++) {
                user_ids.push(favorites[i].to_user_id);
            }

            val_where.id = user_ids;
            if (keyword && keyword.length > 0) {
                val_where[Op.or] = [
                    {first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'ILIKE', '%' + keyword + '%')},
                    {last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'ILIKE', '%' + keyword + '%')},
                    {email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), 'ILIKE', '%' + keyword + '%')},
                    {description: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), 'ILIKE', '%' + keyword + '%')},
                    {address: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('address')), 'ILIKE', '%' + keyword + '%')},
                    {place_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('place_name')), 'ILIKE', '%' + keyword + '%')}
                ];
            }
            if (categories && categories.length > 0) {
                val_where.categories = { [Op.contained]: categories };
            }
            if (lastValue) {
                val_where.id = {
                    [Op.lt]: lastValue
                };
            }
            if (jobber_type){
                val_where.jobber_type = jobber_type
            }
            if (location && range) {
                let latitude = 0;
                let longitude = 0;
                if (!isEmpty(location)) {
                    latitude = location.latitude;
                    longitude = location.longitude;
                    val_having = Sequelize.where(Sequelize.literal("6371 * acos(cos(radians("+latitude+")) * cos(radians(latitude)) * cos(radians("+longitude+") - radians(longitude)) + sin(radians("+latitude+")) * sin(radians(latitude)))"), '<', range);
                }
            }
            if (val_having) {
                val_where.having = val_having;
            }
            val_where.confirmed_at = {[Op.ne]: null};
            val_where.is_closed = false;
            val_where.is_suspended = false;
            val_where.deleted_at = null;

            if (req.session.admin) {
                val_attrs.push("is_suspended");
                val_attrs.push("is_closed");
            }
            if (req.session.user) {
                val_attrs = val_attrs.concat([
                    [Sequelize.literal(`(SELECT COUNT(*) FROM favorites WHERE favorites.to_user_id = users.id AND favorites.from_user_id = ${req.session.user.id} AND favorites.deleted_at IS NULL)`), 'is_favorite'],
                    [Sequelize.literal(`(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)`), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)`), 'number_of_success']]);
            }

            let opt = {
                attributes: val_attrs,
                where: val_where,
                order: [['is_key_jobber', 'DESC'], [orderBy, 'DESC']],
                limit: limit
            };
            if (offset) {
                opt.offset = (offset - 1) * limit;
            }

            return Promise.all([
                models['users'].findAll(opt),
                models['users'].count({
                    where: val_where
                })
            ]).then(([rows, total]) => {
                for (let i = 0; i < rows.length; i ++) {
                    rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
                    if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                        rows[i].dataValues.location = {
                            address: rows[i].dataValues.address,
                            place_name: rows[i].dataValues.place_name,
                            latitude: rows[i].dataValues.latitude,
                            longitude: rows[i].dataValues.longitude,
                        };
                    }
                    rows[i].dataValues.review = {
                        score: rows[i].dataValues.score,
                        number_of_completed: rows[i].dataValues.number_of_completed,
                        number_of_feedback: rows[i].dataValues.number_of_feedback,
                        number_of_success: rows[i].dataValues.number_of_success,
                    };
                    rows[i].dataValues.is_favorite = rows[i].dataValues.is_favorite === "1";
                    rows[i].dataValues = omit(rows[i].dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
                }

                return res.status(200).json({result: 'success', users: rows, total, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1].id) : null});
            }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updateUser: function (req, res) {
        const id = parseInt(req.params.id), query = req.body, file = req.file;
        
        if (!(req.session.admin || req.session.user.id === id)) {
            return res.status(500).json({result: "error", errorCode: 1, msg: "Invalid Request"}).end();
        }

        return models['users'].findByPk(id).then(async(row) => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 3, msg: "There is no user"}).end();

            if (file)
                query.avatar = file.path;
            if (query.categories && query.categories !== "null") {
                if (typeof query.categories === 'string') {
                    merge(query, {
                        categories: JSON.parse(query.categories)
                    });
                } else {
                    merge(query, {
                        categories: query.categories
                    });
                }
            }

            if (query.feedbacks) {
                const feedbacks = query.feedbacks.split(',');

                for (let i = 0; i < feedbacks.length; i++) {
                    const feedback = feedbacks[i].split(':');

                    await models['feedbacks'].update({
                        comment: feedback[1]
                    }, {
                        where: {
                            id: feedback[0]
                        }
                    });
                }
            }

            if (query.location && query.location != null) {
                let temp_location = null;
                if (typeof query.location == 'string') {
                    temp_location = JSON.parse(query.location);
                } else {
                    temp_location = query.location;
                }


                const { address, place_name, latitude, longitude } = temp_location;

                merge(query, {
                    address: address,
                    place_name: place_name,
                    latitude: latitude,
                    longitude: longitude
                });
            }
            if (query.experience_from && query.experience_from !== "null") {
                query.experience_from = moment(query.experience_from);
            }

            if (query.password) {
                if (req.session.admin) {
                    const salt = tokens.generate();
                    query.password = hash.password(salt, query.password);
                    query.salt = salt;
                } else {
                    omit(query, ['password']);
                }
            }

            row.update(query).then(() => {
                let val_attrs = [
                    "id", "avatar", "first_name", "last_name", "email", "availability", "company", "birthday", "experience_from", "experience_years", "experience_months", "jobber_type",
                    "is_key_hirer", "is_key_jobber", "description", "categories", "address", "place_name", "latitude", "longitude", "createdAt",
                    [Sequelize.literal('(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND contracts.jobber_id =users.id AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)'), 'number_of_success']
                ];

                return models['users'].findByPk(id, {
                    attributes: val_attrs
                }).then(user => {
                    user.dataValues.avatar = functions.convertLocalToPublic(user.dataValues.avatar);
                    user.dataValues.experience_from = moment(user.dataValues.experience_from).format('YYYY-MM-DD');
                    if (user.dataValues.address || user.dataValues.place_name || user.dataValues.latitude || user.dataValues.longitude) {
                        user.dataValues.location = {
                            address: user.dataValues.address,
                            place_name: user.dataValues.place_name,
                            latitude: user.dataValues.latitude,
                            longitude: user.dataValues.longitude,
                        }
                    }
                    user.dataValues.review = {
                        score: user.dataValues.score,
                        number_of_completed: user.dataValues.number_of_completed,
                        number_of_feedback: user.dataValues.number_of_feedback,
                        number_of_success: user.dataValues.number_of_success,
                    };
                    user.dataValues = omit(user.dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);

                    if (query.password && req.session.admin) {
                        models['user_tokens'].destroy({
                            where: {
                                user_id: id
                            }
                        });
                    }
                    return res.status(200).json({result: "success", user: user, msg: "Updated user successfully."});
                }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0, msg: "Internal Server Error"}).end());
            }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0, msg: "Internal Server Error"}).end());
        }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0, msg: "Internal Server Error"}).end());
    },

    deleteUser: function (req, res) {
        const { id } = req.params;
        // if (!req.session.admin)
        //     return res.status(500).json({result: "error", errorCode: 1}).end();

        return models['users'].findOne({
            where: { id }
        }).then(user => {
            if (!user) {
                return res.status(500).json({result: "error", errorCode: 3});
            }

            return user.update({
                deleted_at: new Date()
            }).then(() => {
                return res.status(200).json({result: "success"}).end();
            }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getBadgeCount: function (req, res) {
        const user_id = req.session.user.id;

        return Promise.all([
            models['notifications'].count({
                where: {
                    receiver_id: user_id,
                    type: {
                        [Op.ne]: null
                    },
                    is_read: false
                }
            }),
            models['chat_rooms'].findAll({
                attributes: {
                    include: [[Sequelize.fn("COUNT", Sequelize.col("chat_messages.id")), "all_message_count"]]
                },
                where: {
                    user_ids: {
                        [Op.contains]: [user_id]
                    }
                },
                include: [{
                    attributes: [],
                    model: models['messages'],
                    as: 'chat_messages'
                }],
                group: ['chat_rooms.id']
            }),
            models['chat_rooms'].findAll({
                attributes: {
                    include: [[Sequelize.fn("COUNT", Sequelize.col("chat_messages.id")), "read_message_count"]]
                },
                where: {
                    user_ids: {
                        [Op.contains]: [user_id]
                    }
                },
                include: [{
                    attributes: [],
                    model: models['messages'],
                    where: {
                        read_users: {
                            [Op.contains]: [user_id]
                        }
                    },
                    as: 'chat_messages'
                }],
                group: ['chat_rooms.id']
            }),
            models['invites'].count({
                where: {
                    receiver_id: user_id,
                    status: 1,
                    deleted_at: null
                }
            }),
            models['offers'].count({
                where: {
                    [Op.or]: {
                        jobber_id: user_id
                    },
                    is_archived: false,
                    status: 1,
                    contract_id: null,
                    deleted_at: null,
                    read_offer: false
                }
            }),
            models['jobs'].count({
                where: {
                    has_updates: true,
                    owner_id: user_id,
                    closed_at: null,
                    deleted_at: null
                }
            }),
            models['jobs'].findAll({
                attributes: ['id', 'has_updates'],
                where: {
                    owner_id: user_id,
                    closed_at: null,
                    deleted_at: null
                }
            }),
            models['contracts'].count({
                where: {
                    [Op.or]: [{
                        hirer_id: user_id,
                        archive_hirer: false,
                        read_hirer: false
                    }, {
                        jobber_id: user_id,
                        archive_jobber: false,
                        read_jobber: false
                    }],
                    deleted_at: null,
                }
            }),
            models['contracts'].findAll({
                attributes: ['id', 'hirer_id', 'read_hirer', 'jobber_id', 'read_jobber'],
                where: {
                    [Op.or]: [{
                        hirer_id: user_id,
                        archive_hirer: false,
                        read_hirer: false
                    }, {
                        jobber_id: user_id,
                        archive_jobber: false,
                        read_jobber: false
                    }],
                    deleted_at: null,
                }
            }),
            models['notifications'].count({
                where: {
                    receiver_id: user_id,
                    type: 24,
                    invoice_id: {
                        [Op.ne]: null
                    },
                    is_read: false
                }
            }),
        ]).then(([notification_count, all_messages, read_messages, invite_count, offers_count, job_count, jobs, contract_count, contracts, invoice_count]) => {
            let message_count = [];
            for (let i = 0; i < all_messages.length; i ++) {
                let unread_count = all_messages[i].dataValues['all_message_count'];
                for (let j = 0; j < read_messages.length; j ++) {
                    if (all_messages[i].dataValues.id === read_messages[j].dataValues.id) {
                        unread_count = unread_count - read_messages[j].dataValues['read_message_count'];
                    }
                }
                message_count.push({room_id: all_messages[i].dataValues.id, unread_count: parseInt(unread_count)});
            }

            pusherTrigger('badge',  `user-${req.session.user.id}`, {notification_count, message_count, invite_count, job_update_count: job_count, jobs, contract_count, contracts, invoice_count, offers_count});
            return res.status(200).json({result: "success", data: {notification_count, message_count, invite_count, job_update_count: job_count, jobs, contract_count, contracts, invoice_count, offers_count}});
        }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    updatePassword: function (req, res) {
        const { current_password, new_password } = req.body;
        const device_token = req.headers['x-user-key'];

        return models['users'].findOne({
            attributes: ['salt', 'password'],
            where: {
                id: req.session.user.id
            }
        }).then((user) => {
            if (!user) {
                return res.status(500).json({result: "error", errorCode: 3});
            }

            const {salt, password} = user.dataValues;
            if (password !== hash.password(salt, current_password)) {
                return res.status(500).json({result: "error", errorCode: 1});
            }

            const new_salt = tokens.generate();

            return models['users'].update({
                salt: new_salt,
                password: hash.password(new_salt, new_password)
            }, {
                where: {
                    id: req.session.user.id
                }
            }).then(() => {
                models['user_tokens'].destroy({
                    where: {
                        user_id: req.session.user.id,
                        device_token: {
                            [Op.ne]: device_token
                        }
                    }
                });
                return res.status(200).json({result: "success"});
            }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch(() => res.status(500).json({result: "error", errorCode: 0}).end());
    },

    getFavoriteJobbers: function (req, res) {
        const { id } = req.params;
        const from_user_id = req.session.user.id;

        return models['offers'].findAll({
            where: {
                job_id: id,
                contract_id: {
                    [Op.ne]: null
                }
            },
            include: [{
                model: models['users'],
                attributes: ["id"],
                as: 'jobber'
            }]
        }).then((offers) => {
            let jobbers = [];
            for(let i = 0; i < offers.length; i += 1) {
                jobbers[i] = offers[i].jobber.id;
            }

            return models['favorites'].findAll({
                attributes: ['to_user_id'],
                where: {
                    from_user_id,
                    to_user_id: jobbers,
                    deleted_at: null
                }
            }).then((favorites) => {
                if (!favorites || favorites.length === 0) {
                    return res.status(200).json({result: "success", users: []});
                }

                let user_ids = [], val_where = {}, val_attrs = [
                    "id", "avatar", "first_name", "last_name", "email", "availability", "company", "jobber_type",
                    "birthday", "experience_from", "experience_years", "experience_months", "is_key_hirer", "is_key_jobber", "description",
                    "categories", "address", "place_name", "latitude", "longitude", "createdAt"
                ];
                for (let i = 0; i < favorites.length; i ++) {
                    user_ids.push(favorites[i].to_user_id);
                }

                val_where.id = user_ids;
                val_where.confirmed_at = {[Op.ne]: null};
                val_where.is_closed = false;
                val_where.is_suspended = false;
                val_where.deleted_at = null;

                val_attrs = val_attrs.concat([
                    [Sequelize.literal(`(SELECT COUNT(*) FROM favorites WHERE favorites.to_user_id = users.id AND favorites.from_user_id = ${req.session.user.id} AND favorites.deleted_at IS NULL)`), 'is_favorite'],
                    [Sequelize.literal(`(SELECT AVG(feedbacks.score) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)`), 'score'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM contracts WHERE contracts.closed_at IS NOT NULL AND (contracts.jobber_id =users.id OR contracts.hirer_id =users.id) AND contracts.deleted_at IS NULL)'), 'number_of_completed'],
                    [Sequelize.literal('(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL)'), 'number_of_feedback'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM feedbacks WHERE feedbacks.to_user_id = users.id AND feedbacks.deleted_at IS NULL AND feedbacks.success = true)`), 'number_of_success']]);

                let opt = {
                    attributes: val_attrs,
                    where: val_where,
                    order: [['createdAt', 'DESC']],
                };

                return models['users'].findAll(opt)
                .then((rows) => {
                    for (let i = 0; i < rows.length; i ++) {
                        rows[i].dataValues.avatar = functions.convertLocalToPublic(rows[i].dataValues.avatar);
                        if (rows[i].dataValues.address || rows[i].dataValues.place_name || rows[i].dataValues.latitude || rows[i].dataValues.longitude) {
                            rows[i].dataValues.location = {
                                address: rows[i].dataValues.address,
                                place_name: rows[i].dataValues.place_name,
                                latitude: rows[i].dataValues.latitude,
                                longitude: rows[i].dataValues.longitude,
                            };
                        }
                        rows[i].dataValues.review = {
                            score: rows[i].dataValues.score,
                            number_of_completed: rows[i].dataValues.number_of_completed,
                            number_of_feedback: rows[i].dataValues.number_of_feedback,
                            number_of_success: rows[i].dataValues.number_of_success,
                        };
                        rows[i].dataValues.is_favorite = rows[i].dataValues.is_favorite === "1";
                        rows[i].dataValues = omit(rows[i].dataValues, ['address', 'place_name', 'latitude', 'longitude', 'number_of_success', 'number_of_feedback', 'number_of_completed', 'score']);
                    }

                    return res.status(200).json({result: 'success', favorites: rows});
                }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
        }).catch((err) => console.log(err) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    addSubUsers: function (req, res) {
        const user_ids = req.body;
        return models['users'].findAll({
            where: {
                id: user_ids,
                deleted_at: null
            }
        }).then((users) => {
            let sub_user_ids = users.map(row => row.id);
            return models['sub_accounts'].findAll({
                where: {
                    sub_user_id: sub_user_ids,
                    main_user_id: req.session.user.id
                }
            }).then((sub_accounts) => {
                const exist_sub_ids = sub_accounts.map(row=>row.sub_user_id);
                for(let i = 0; i < exist_sub_ids.length; i += 1) {
                    sub_user_ids = sub_user_ids.filter(el=>el !== exist_sub_ids[i]);
                }

                return models['st_customers'].findOne({
                    where: {
                        user_id: req.session.user.id
                    }
                }).then(async (st_customer) => {
                    if(!st_customer)
                        return res.status(500).json({result: "error", errorCode: 61}).end();
                    const { stripe_id } = st_customer.dataValues;
                    for(let k = 0; k < sub_user_ids.length; k += 1) {
                        try {
                            const subscription = await stripe.subscriptions.create({
                                customer: stripe_id,
                                items: [
                                  {
                                    price: process.env.PRODUCT_SUB_USER, //prod_GnFlDLq38Z9I6h
                                  },
                                ]
                              }
                            );
                            await models['subscriptions'].create({
                                customer_id: stripe_id,
                                user_id: req.session.user.id,
                                subscription_id: subscription.id,
                                type: 3
                            })
                        } catch(err) {
                            console.error(err);

                            if (err.message && err.message.includes("no attached payment source")) {
                                return res.status(500).json({result: "error", errorCode: 61}).end();
                            }

                            return res.status(500).json({result: "error", errorCode: 0});
                         }
                    }

                    let bulkQuery = [];
                    for(let j = 0; j < sub_user_ids.length; j += 1) {
                        const query = {main_user_id: req.session.user.id, sub_user_id: sub_user_ids[j]};
                        bulkQuery.push(query);
                    }
                    return Promise.all([
                        models['sub_accounts'].bulkCreate(bulkQuery),
                        models['users'].update({
                            sub_accounts: 0
                        }, { where: {
                                id: req.session.user.id,
                                deleted_at: null
                            }
                        }),
                        models['users'].update({
                            sub_accounts: 1
                        }, {
                            where: {
                                id: user_ids,
                                deleted_at: null
                            }
                        })
                    ]).then(() => {
                        return res.status(200).json({result: "success"}).end();
                    }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
                }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({result: "error", errorCode: 0}).end();
            })
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        })
    },

    deleteSubUser: function (req, res) {
        const {id} = req.params;
        return models['subscriptions'].findAll({
            raw: true,
            where: {
                user_id: req.session.user.id,
                type: 3
            }
        }).then(async (rows) => {
            let active_subscriptions = [];
            if (rows.length === 0) {
                models['sub_accounts'].destroy({
                    where: {
                        main_user_id: req.session.user.id,
                        sub_user_id: id
                    }
                });
                return res.status(200).json({result: "success"}).end();
            }
            for(let i = 0; i < rows.length; i += 1) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(rows[i].subscription_id);
                    if(subscription.status)
                        active_subscriptions.push(subscription.id);
                }catch(err) {
                    console.log(err);
                    return res.status(500).json({result: "error", errorCode: 0});
                }
            }
            if(active_subscriptions.length > 0) {
                return stripe.subscriptions.del(active_subscriptions[0])
                .then((confirmation) => {
                    console.log(confirmation)
                    return Promise.all([
                        models['sub_accounts'].destroy({
                            where: {
                                main_user_id: req.session.user.id,
                                sub_user_id: id
                            }
                        }),
                        models['subscriptions'].destroy({
                            where: {
                                subscription_id: active_subscriptions[0]
                            }
                        }),
                    ]).then(() => {
                        return res.status(200).json({result: "success"}).end();
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({result: "error", errorCode: 0}).end();
                    })
                }).catch(err =>{
                    console.log(err);
                    return res.status(500).json({result: "error", errorCode: 0});
                })
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({result: 'error', errorCode: 0});
        })
    }
};
