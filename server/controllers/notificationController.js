const Sequelize = require('sequelize');
const { omit } = require('lodash');
const { functions: { sendNotification, convertLocalToPublic } } = require('../../utils');
const models = require('../models');
const {pusherTrigger} = require('../pusher')

const Op = Sequelize.Op;

module.exports = {
    createNotification: function (item, receivers) {
        let val_where = {
            deletedAt: null
        };
        if (receivers) {
            val_where.user_id = receivers;
        }

        return models['notifications'].create(item).then(row => {
            return Promise.all([
                models['user_tokens'].findAll({
                    attributes: ["user_id", "token", "platform"],
                    where: val_where
                }),
                models['notifications'].count({
                    receiver_id: item.receiver_id,
                    type: {
                        [Op.ne]: null
                    },
                    is_read: false
                }),
                models['invites'].count({
                    where: {
                        receiver_id: item.receiver_id,
                        status: 1
                    }
                }),
                models['chat_rooms'].findAll({
                    attributes: {
                        include: [[Sequelize.fn("COUNT", Sequelize.col("chat_messages.id")), "all_message_count"]]
                    },
                    where: {
                        user_ids: {
                            [Op.contains]: [item.receiver_id]
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
                            [Op.contains]: [item.receiver_id]
                        }
                    },
                    include: [{
                        attributes: [],
                        model: models['messages'],
                        where: {
                            read_users: {
                                [Op.contains]: [item.receiver_id]
                            }
                        },
                        as: 'chat_messages'
                    }],
                    group: ['chat_rooms.id']
                })
            ]).then(([tokens, badge, invites_count, all_messages, read_messages]) => {

                let message_counts = 0;
                for (let i = 0; i < all_messages.length; i ++) {
                    message_counts += all_messages[i].dataValues['all_message_count'];
                }
                for (let i = 0; i < read_messages.length; i ++) {
                    message_counts -= read_messages[i].dataValues['read_message_count'];
                }

                if (tokens.length > 0) {
                    let user_ids = [];
                    let ios_fcm_tokens = [];
                    let android_fcm_tokens = [];
                    let web_fcm_tokens = [];
                    for (let i = 0; i < tokens.length; i ++) {
                        user_ids.push(tokens[i].dataValues.user_id);
                        if (tokens[i].dataValues.token){
                            if(tokens[i].dataValues.platform === 'ios'){
                                ios_fcm_tokens.push(tokens[i].dataValues.token);
                            }else if(tokens[i].dataValues.platform === 'android') {
                                android_fcm_tokens.push(tokens[i].dataValues.token);
                            }else if(tokens[i].dataValues.platform === 'web') {
                                web_fcm_tokens.push(tokens[i].dataValues.token);
                            }
                        }
                    }
                    this.getBadgeCounts(user_ids);

                    if(web_fcm_tokens.length > 0) {
                        sendNotification({
                            notification: {
                                title: item.title,
                                body: item.description,
                                badge: badge + invites_count + message_counts,
                                notification: row.dataValues,
                            },
                            registration_ids: web_fcm_tokens
                        });
                    }

                    if(ios_fcm_tokens.length > 0) {
                        sendNotification({
                            notification: {
                                title: item.title,
                                body: item.description,
                                badge: badge + invites_count + message_counts,
                                notification: row.dataValues,
                            },
                            registration_ids: ios_fcm_tokens
                        });
                    }

                    if(android_fcm_tokens.length > 0) {
                        sendNotification({
                            notification: {
                                title: item.title,
                                body: item.description,
                                badge: badge + invites_count + message_counts,
                                notification: row.dataValues,
                            },
                            data: {
                                badge: badge + invites_count + message_counts,
                                notification: row.dataValues,
                            },
                            registration_ids: android_fcm_tokens
                        });
                    }
                }
            }).catch(error => {
                console.error(error);
                return false;
            });
        }).catch(error => {
            console.error(error);
            return false;
        });
    },

    createChatNotification: function (item, message, receivers) {
        let val_where = {
            deletedAt: null
        };
        if (receivers) {
            val_where.user_id = receivers;
        }
        return models['notifications'].create(item).then(() => {
            return Promise.all([
                models['user_tokens'].findAll({
                    attributes: ["token", "platform"],
                    where: val_where
                }),
                models['notifications'].count({
                    where: {
                        receiver_id: item.receiver_id,
                        type: {
                            [Op.ne]: null
                        },
                        is_read: false
                    }
                }),
                models['invites'].count({
                    where: {
                        receiver_id: item.receiver_id,
                        status: 1
                    }
                }),
                models['chat_rooms'].findAll({
                    attributes: {
                        include: [[Sequelize.fn("COUNT", Sequelize.col("chat_messages.id")), "all_message_count"]]
                    },
                    where: {
                        user_ids: {
                            [Op.contains]: [item.receiver_id]
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
                            [Op.contains]: [item.receiver_id]
                        }
                    },
                    include: [{
                        attributes: [],
                        model: models['messages'],
                        where: {
                            read_users: {
                                [Op.contains]: [item.receiver_id]
                            }
                        },
                        as: 'chat_messages'
                    }],
                    group: ['chat_rooms.id']
                })
            ]).then(([tokens, badge, invites_count, all_messages, read_messages]) => {
                let message_counts = 0;
                for (let i = 0; i < all_messages.length; i ++) {
                    message_counts += parseInt(all_messages[i].dataValues['all_message_count']);
                }
                for (let i = 0; i < read_messages.length; i ++) {
                    message_counts -= parseInt(read_messages[i].dataValues['read_message_count']);
                }
                if (tokens.length > 0) {
                    let ios_fcm_tokens = [];
                    let android_fcm_tokens = [];
                    let web_fcm_tokens = [];
                    for (let i = 0; i < tokens.length; i ++) {
                        if (tokens[i].dataValues.token){
                            if(tokens[i].dataValues.platform === 'ios'){
                                ios_fcm_tokens.push(tokens[i].dataValues.token);
                            }else if(tokens[i].dataValues.platform === 'android') {
                                android_fcm_tokens.push(tokens[i].dataValues.token);
                            }else if(tokens[i].dataValues.platform === 'web') {
                                web_fcm_tokens.push(tokens[i].dataValues.token);
                            }
                        }
                    }

                    if(web_fcm_tokens.length > 0) {
                        sendNotification({
                            notification: {
                                title: item.title,
                                body: item.description,
                                badge: parseInt(badge) + parseInt(invites_count) + message_counts,
                                chat_message: message
                            },
                            registration_ids: web_fcm_tokens
                        });
                    }

                    if(ios_fcm_tokens.length > 0) {
                        sendNotification({
                            notification: {
                                title: item.title,
                                body: item.description,
                                badge: parseInt(badge) + parseInt(invites_count) + message_counts,
                                chat_message: message
                            },
                            registration_ids: ios_fcm_tokens
                        });
                    }

                    if(android_fcm_tokens.length > 0) {
                        sendNotification({
                            notification: {
                                title: item.title,
                                body: item.description,
                                badge: parseInt(badge) + parseInt(invites_count) + message_counts,
                                chat_message: message
                            },
                            data: {
                                badge: parseInt(badge) + parseInt(invites_count) + message_counts,
                                chat_message: message
                            },
                            registration_ids: android_fcm_tokens
                        });
                    }
                }
            }).catch(error => {
                console.log(error);
                return false;
            });
        }).catch(error => {
            console.log(error);
            return false;
        });
    },

    getNotifications: function (req, res) {
        const { limit, orderBy, lastValue } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        let val_where = {receiver_id: user_id};
        if (lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            };
        }
        // val_where[Op.or] = [
        //     {is_broadcast: true},
        //     {receiver_id: user_id}
        // ];


        val_where.type = {
            [Op.ne]: null
        };

        return models['notifications'].findAll({
            attributes: ['id', 'title', 'description', 'sender_id', 'type', 'createdAt', 'job_id', 'invite_id', 'offer_id', 'contract_id', 'feedback_id', 'chat_id'],
            where: val_where,
            include: [{
                model: models['users'],
                attributes: ["id", "first_name", "last_name", "email", "avatar"],
                as: 'sender'
            }, {
                model: models['jobs'],
                attributes: ["id", "title", "description", "avatar"],
                as: 'job'
            }],
            order: [
                [orderBy, "DESC"]
            ],
            limit: limit
        }).then(notifications => {
            for (let i = 0; i < notifications.length; i ++) {
                if (notifications[i].dataValues.job && notifications[i].dataValues.sender) {
                    notifications[i].dataValues.job_title = notifications[i].dataValues.job.dataValues.title;
                    notifications[i].dataValues.job.dataValues = omit(notifications[i].dataValues.job.dataValues, ['id', 'title', 'description', 'avatar']);
                    notifications[i].dataValues.sender.avatar = convertLocalToPublic(notifications[i].dataValues.sender.avatar);
                }

                models['notifications'].update({
                    is_read: true,
                    updatedAt: new Date()
                }, {
                    where: {
                        id: [notifications[i].dataValues.id],
                        receiver_id: user_id
                    }
                });
            }

            return res.status(200).json({result: "success", notifications, lastValue: notifications.length > 0 ? ("" + notifications[notifications.length - 1].id) : null});
        }).catch(error => console.log(error) || res.status(500).json({result:"error", errorCode: 0}).end());
    },

    setNotificationAsRead: function (req, res) {
        const { notification_ids } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['notifications'].update({
            is_read: true,
            updatedAt: new Date()
        }, {
            where: {
                id: notification_ids,
                receiver_id: user_id
            }
        }).then(() => {
            return res.status(200).json({result: "success"});
        }).catch(error => console.log(error) || res.status(500).json({result: "error", errorCode: 0}).end());
    },

    sendNotification: function (req, res) {
        const { all, users, subject, content } = req.body;
        let user_ids = [], opt;

        for (let i = 0; i < users.length; i ++) {
            user_ids.push(users[i].id);
        }
        if (all) {
            opt = {
                where: {
                    id: {
                        [Op.notIn]: user_ids
                    }
                }
            };
        } else {
            opt = {
                where: {
                    id: user_ids
                }
            }
        }

        return models['users'].findAll(opt).then(async (rows) => {
            for (let i = 0; i < rows.length; i ++) {
                models['notifications'].create({
                    sender_id: 0,
                    receiver_id: rows[i].id,
                    type: 2,
                    title: subject,
                    description: content,
                    is_broadcast: false,
                    is_read: false
                });
                const devices = await models['user_tokens'].findAll({
                    where: {
                        user_id: rows[i].id
                    }
                });
                const tokens = devices.map(item => item.token);
                if (tokens.length > 0) {
                    sendNotification({
                        notification: {
                            title: subject,
                            body: content,
                        },
                        registration_ids: tokens
                    });
                }
            }
            return res.status(200).json({result:"success", message: "Sent notification to users successfully"}).end();
        }).catch(error => console.log(error) || res.status(500).json({result: "error", message: "Internal Server Error"}).end());
    },

    getBadgeCounts: function (user_ids) {
        for(let i = 0; i < user_ids.length; i += 1){
            return Promise.all([
                models['notifications'].count({
                    where: {
                        receiver_id: user_ids[i],
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
                            [Op.contains]: [user_ids[i]]
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
                            [Op.contains]: [user_ids[i]]
                        }
                    },
                    include: [{
                        attributes: [],
                        model: models['messages'],
                        where: {
                            read_users: {
                                [Op.contains]: [user_ids[i]]
                            }
                        },
                        as: 'chat_messages'
                    }],
                    group: ['chat_rooms.id']
                }),
                models['invites'].count({
                    where: {
                        receiver_id: user_ids[i],
                        status: 1
                    }
                }),
                models['offers'].count({
                    where: {
                        [Op.or]: [{
                            hirer_id: user_ids[i],
                        }, {
                            jobber_id: user_ids[i],
                        }],
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
                        owner_id: user_ids[i],
                        closed_at: null,
                        deleted_at: null
                    }
                }),
                models['jobs'].findAll({
                    attributes: ['id', 'has_updates'],
                    where: {
                        owner_id: user_ids[i],
                        closed_at: null,
                        deleted_at: null
                    }
                }),
                models['contracts'].count({
                    where: {
                        [Op.or]: [{
                            hirer_id: user_ids[i],
                            archive_hirer: false,
                            read_hirer: false
                        }, {
                            jobber_id: user_ids[i],
                            archive_jobber: false,
                            read_jobber: false
                        }],
                        deleted_at: null,
                    }
                }),
                models['notifications'].count({
                    where: {
                        receiver_id: user_ids[i],
                        type: 24,
                        invoice_id: {
                            [Op.ne]: null
                        },
                        is_read: false
                    }
                }),
            ]).then(([notification_count, all_messages, read_messages, invite_count, offers_count, job_count, jobs, contract_count, invoice_count]) => {
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
                pusherTrigger('badge',  `user-${user_ids[i]}`, {notification_count, message_count, invite_count, offers_count, job_update_count: job_count, jobs, contract_count, invoice_count});
            }).catch((err) => console.log(err));
        }
    }
};
