const { omit } = require('lodash');
const Sequelize = require('sequelize');
const { functions } = require('../../utils');
const notificationController = require('./notificationController');
const moment = require('moment');
const models = require('../models');
const {pusherTrigger} = require('../pusher')
const Op = Sequelize.Op;

module.exports = {
    createAdminChat: function (req, res) {
        const { user_ids, title, job_id, type } = req.body; //direct, group, job , level: admin, user

        const chat_room = {
            chat_type: type,
            title: title,
            user_ids:  user_ids,
            job_id: job_id,
            level: 'admin'
        };

        return models['chat_rooms'].findOne({
            where: {
                user_ids: {
                    [Op.contains]: user_ids,
                    [Op.contained]: user_ids,
                },
                chat_type: type
            }
        }).then(existRoom => {
            if (existRoom) {
                return res.status(200).json({result: "success", room: existRoom});
            }

            return models['chat_rooms'].create(chat_room).then(row => {
                return models['users'].findAll({
                    attributes: ["id", "first_name", "last_name", "avatar"],
                    where: {
                        id: user_ids
                    }
                }).then(users => {
                    row.dataValues.users = users;
                    return res.status(200).json({result: "success", room: row});
                }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    createChat: function (req, res) {
        const { user_ids, title, job_id, type, message } = req.body; //direct, group, job , level: admin, user

        let chat_room = {
            level: 'user',
            is_archived: false
        };
        if (title) {
            chat_room.title = title;
        }
        if (type) {
            chat_room.chat_type = type;
        }
        if (user_ids) {
            chat_room.user_ids = user_ids;
        }
        if (job_id) {
            chat_room.job_id = job_id;
        }

        return models['users'].findAll({
            where: {
                id: user_ids
            }
        }).then(async(users) => {
            if (type === 'direct') {
                try {
                    const room = await models['chat_rooms'].findOne({
                        raw: true,
                        where: {
                            user_ids: {
                                [Op.contains]: user_ids,
                                [Op.contained]: user_ids,
                            },
                            chat_type: type
                        }
                    });
                    if(room)
                        return models['messages'].findAll({
                            where: {
                                room_id: room.id
                            },
                            limit: 1,
                            order: [['createdAt', 'DESC']]
                        }).then(rows => {
                            room.users = users;
                            room.last_message = rows.length > 0 ? rows[0] : null;
                            return res.status(200).json({result: "success", room});
                        }).catch(err => console.error(err) || res.status(500).json({result: "error", errorCode: 0}).end());
                }catch(err) {
                    console.log(err);
                    return res.status(500).json({result: "error", errorCode: 0}).end();
                }
            }
            const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

            return models['chat_rooms'].create(chat_room).then(row => {
                const new_message = {
                    content: message,
                    room_id: row.id, type,
                    user_id,
                }, receiver_ids = user_ids.filter(el => parseInt(el) !== user_id);

                // for (let i = 0; i < receiver_ids.length; i ++) {
                //     const notification = {
                //         sender_id: user_id,
                //         receiver_id: receiver_ids[i],
                //         type: 20,
                //         title: '',
                //         description: `${req.session.user.first_name} ${req.session.user.last_name} invited you to chat.`,
                //         is_broadcast: false,
                //         chat_id: row.id,
                //         room_id: row.id,
                //         job_id: job_id,
                //         is_read: false
                //     };
                //     notificationController.createNotification(notification, receiver_ids[i]);
                // }

                if (message && message.length > 0) {
                    models['messages'].create(new_message);
                }
                row.dataValues.users = users;
                row.dataValues.last_message = null;
                pusherTrigger('new-room', row.dataValues.chat_type + "-" + row.dataValues.level + "-" + row.dataValues.id, row);
                return res.status(200).json({result: "success", room: row});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    getChatRooms: async (req, res) => {
        let { job_id, limit, orderBy, lastValue, keyword, roomId } = req.query;

        if(roomId) {
            try {
                const room = await models['chat_rooms'].findOne({
                    where: {
                        id: parseInt(roomId)
                    }
                });

                room.changed('updatedAt', true);
                await room.update({updatedAt: moment().toDate()});
            }catch(err) {
                console.log(err);
            }
        }
        if (job_id) {
            let user_id = null;
            if (req.session.admin) {
                user_id = 0;
            }
            if (req.session.user) {
                user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            }

            return models['chat_rooms'].findAll({
                where: {
                    job_id,
                    user_ids: {
                        [Op.contains]: [user_id]
                    }
                },
                order: [
                    [orderBy, 'DESC'],
                ],
            }).then(async (rows) => {
                for (let i = 0; i < rows.length; i ++) {
                    let { user_ids } = rows[i].dataValues;

                    let users = await models['users'].findAll({
                        where: {
                            id: user_ids
                        }
                    });
                    for (let j = 0; j < users.length; j ++) {
                        users[j].dataValues.avatar = functions.convertLocalToPublic(users[j].dataValues.avatar);
                    }
                    rows[i].dataValues.users = users;

                    const sum_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].dataValues.id
                        }
                    });
                    const read_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].dataValues.id,
                            read_users: {
                                [Op.contains]: [user_id]
                            }
                        }
                    });
                    rows[i].dataValues.unread_count = sum_count - read_count;
                    const last_message = await models['messages'].findAll({
                        where: {
                            room_id: rows[i].dataValues.id,
                        },
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    });
                    rows[i].dataValues.last_message = last_message.length > 0 ? last_message[0] : null;
                }
                return res.status(200).json({result: "success", rooms: rows});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        } else {
            let val_where = {deleted_at: null}, user_id = null, level = null;
            if (req.session.admin) {
                user_id = 0;
                level = "admin"
            }
            if (req.session.user) {
                user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            }
            val_where.user_ids = {
                [Op.contains]: [user_id]
            };
            val_where.last_message = {
                [Op.not]: null
            };
            if (keyword && keyword.length > 0) {
                val_where.title = {[Op.iLike]: "%" + keyword + "%"};
                //     // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('job.title')), 'ILIKE', '%' + keyword + '%'),
                //     {'$job.title$': {[Op.iLike]: "%" + keyword + "%"}},
                //     {'$participant_ids.participant.first_name$': {[Op.iLike]: "%" + keyword + "%"}},
                //     {'$participant_ids.participant.last_name$': {[Op.iLike]: "%" + keyword + "%"}},
                // ]
            }
            if (lastValue) {
                if(orderBy === 'updatedAt') {
                    lastValue = moment(lastValue).toDate();
                }
                val_where[orderBy] = {
                    [Op.lt]: lastValue
                };
            }
            if (level) {
                val_where.level = level;
            }
            val_where.having = Sequelize.where(Sequelize.literal('(SELECT COUNT(*) FROM archived_rooms WHERE archived_rooms.room_id ="chat_rooms"."id")'), '=', '0');
            return models['chat_rooms'].findAll({
                where: roomId ? {
                    [Op.or]: [
                        val_where,
                        {
                            id: roomId
                        }
                    ]
                } : val_where,
                subQuery: false,
                include: [{
                    model: models['jobs'],
                    attributes: ["id", "title", "avatar", "category", "description", "owner_id"],
                    as: 'job',
                }],
                order: [
                    [orderBy, 'DESC']
                ],
                limit
            }).then(async (rows) => {
                for (let i = 0; i < rows.length; i ++) {
                    const { user_ids } = rows[i].dataValues;

                    let users = await models['users'].findAll({
                        where: {
                            id: user_ids
                        }
                    });
                    for (let j = 0; j < users.length; j ++) {
                        users[j].dataValues.avatar = functions.convertLocalToPublic(users[j].dataValues.avatar);
                    }
                    rows[i].dataValues.users = users;

                    const sum_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].id
                        }
                    });
                    
                    const read_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].id,
                            read_users: {
                                [Op.contains]: [user_id]
                            }
                        }
                    });
                    rows[i].dataValues.unread_count = sum_count - read_count;
                    const last_message = await models['messages'].findAll({
                        where: {
                            room_id: rows[i].id
                        },
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    });
                    rows[i].dataValues.last_message = last_message.length > 0 ? last_message[0] : null;
                    if (rows[i].dataValues.level === 'user') {
                        if (rows[i].dataValues.job) {
                            if (rows[i].dataValues.job.category) {
                                rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                            }
                            rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                        }
                    }
                }

                return res.status(200).json({result: "success", rooms: rows, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1][orderBy]) : null});
            }).catch(error => console.log(error) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }
    },

    getChatListByJobId: async (req, res) => {
        let { job_id, limit, orderBy, lastValue } = req.query;

        if (job_id) {
            let user_id = null;
            if (req.session.admin) {
                user_id = 0;
            }
            if (req.session.user) {
                user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            }

            return models['chat_rooms'].findAll({
                where: {
                    job_id,
                },
                order: [
                    [orderBy, 'DESC'],
                ],
            }).then(async (rows) => {
                for (let i = 0; i < rows.length; i ++) {
                    let { user_ids } = rows[i].dataValues;

                    let users = await models['users'].findAll({
                        where: {
                            id: user_ids
                        }
                    });
                    for (let j = 0; j < users.length; j ++) {
                        users[j].dataValues.avatar = functions.convertLocalToPublic(users[j].dataValues.avatar);
                    }
                    rows[i].dataValues.users = users;

                    const sum_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].dataValues.id
                        }
                    });
                    const read_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].dataValues.id,
                            read_users: {
                                [Op.contains]: [user_id]
                            }
                        }
                    });
                    rows[i].dataValues.unread_count = sum_count - read_count;
                    const last_message = await models['messages'].findAll({
                        where: {
                            room_id: rows[i].dataValues.id,
                        },
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    });
                    rows[i].dataValues.last_message = last_message.length > 0 ? last_message[0] : null;
                }
                return res.status(200).json({result: "success", rooms: rows});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        } else {
            let val_where = {deleted_at: null}, user_id = null, level = null;
            if (req.session.admin) {
                user_id = 0;
                level = "admin"
            }
            if (req.session.user) {
                user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            }
            val_where.user_ids = {
                [Op.contains]: [user_id]
            };
            if (keyword && keyword.length > 0) {
                val_where.title = {[Op.iLike]: "%" + keyword + "%"};
                //     // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('job.title')), 'ILIKE', '%' + keyword + '%'),
                //     {'$job.title$': {[Op.iLike]: "%" + keyword + "%"}},
                //     {'$participant_ids.participant.first_name$': {[Op.iLike]: "%" + keyword + "%"}},
                //     {'$participant_ids.participant.last_name$': {[Op.iLike]: "%" + keyword + "%"}},
                // ]
            }
            if (lastValue) {
                if(orderBy === 'updatedAt') {
                    lastValue = moment(lastValue).toDate();
                }
                val_where[orderBy] = {
                    [Op.lt]: lastValue
                };
            }
            if (level) {
                val_where.level = level;
            }
            val_where.having = Sequelize.where(Sequelize.literal('(SELECT COUNT(*) FROM archived_rooms WHERE archived_rooms.room_id ="chat_rooms"."id")'), '=', '0');
            return models['chat_rooms'].findAll({
                where: val_where,
                subQuery: false,
                include: [{
                    model: models['jobs'],
                    attributes: ["id", "title", "avatar", "category", "description", "owner_id"],
                    as: 'job',
                }],
                order: [
                    [orderBy, 'DESC']
                ],
                limit
            }).then(async (rows) => {
                for (let i = 0; i < rows.length; i ++) {
                    const { user_ids } = rows[i].dataValues;

                    let users = await models['users'].findAll({
                        where: {
                            id: user_ids
                        }
                    });
                    for (let j = 0; j < users.length; j ++) {
                        users[j].dataValues.avatar = functions.convertLocalToPublic(users[j].dataValues.avatar);
                    }
                    rows[i].dataValues.users = users;

                    const sum_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].id
                        }
                    });
                    const read_count = await models['messages'].count({
                        where: {
                            room_id: rows[i].id,
                            read_users: {
                                [Op.contains]: [user_id]
                            }
                        }
                    });
                    rows[i].dataValues.unread_count = sum_count - read_count;
                    const last_message = await models['messages'].findAll({
                        where: {
                            room_id: rows[i].id
                        },
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    });
                    rows[i].dataValues.last_message = last_message.length > 0 ? last_message[0] : null;
                    if (rows[i].dataValues.level === 'user') {
                        if (rows[i].dataValues.job) {
                            if (rows[i].dataValues.job.category) {
                                rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                            }
                            rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                        }
                    }
                }

                return res.status(200).json({result: "success", rooms: rows, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1][orderBy]) : null});
            }).catch(error => console.log(error) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }
    },

    getMessageHistory: (req, res) => {
        const { room_id, limit, lastValue } = req.query;
        let user_id = null, val_where = { room_id };

        if (req.session.admin) {
            user_id = 0;
        }
        if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        }
        if (lastValue) {
            val_where.id = {
                [Op.lt]: lastValue
            };
        }

        return models['chat_rooms'].findOne({
            where: {
                id: room_id,
                user_ids: {
                    [Op.contains]: [user_id]
                }
            }
        }).then((room) => {
            if (!room)
                return res.status(500).json({result: 'error', errorCode: 18});

            return models['messages'].findAll({
                where: val_where,
                include: [{
                    model: models['users'],
                    attributes: ["id", "first_name", "last_name", "avatar", "jobber_type"],
                    as: 'user'
                }],
                order: [
                    ['id', 'DESC']
                ],
                limit
            }).then(async(messages) => {
                for (let i = 0; i < messages.length; i ++) {
                    messages[i].dataValues.is_read = messages[i].dataValues.read_users && messages[i].dataValues.read_users.find(el => el == user_id);
                    if(!messages[i].dataValues.is_read) {
                        try {
                            let read_users = functions.remove_duplicates(messages[i].dataValues.read_users);
                            read_users.push(user_id);

                            await models['messages'].update({read_users}, {
                                where: {
                                    id: messages[i].dataValues.id
                                }
                            });
                            notificationController.getBadgeCounts([user_id]);
                        }catch(err) {
                            console.log(err);
                            return res.status(500).json({result: "error", errorCode: 0}).end();
                        }
                    }
                    messages[i].dataValues = omit(messages[i].dataValues, ['read_users']);
                    if (messages[i].dataValues.user) {
                        messages[i].dataValues.user.dataValues.avatar = functions.convertLocalToPublic(messages[i].dataValues.user.dataValues.avatar);
                    }
                    if (messages[i].dataValues.media_file) {
                        messages[i].dataValues.media_file = functions.convertLocalToPublic(messages[i].dataValues.media_file);
                    }
                }

                return res.status(200).json({result: "success", messages, lastValue: messages.length > 0 ? '' + messages[messages.length - 1].id : null});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    sendMessage: (req, res) => {
        const { room_id, text } = req.body;
        let user_id = null, level = null, val_where = { id: room_id };

        if (req.session.admin) {
            user_id = 0;
            level = 'admin';
        }
        if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        }
        if (level) {
            val_where.level = level;
        }
        val_where.user_ids = {
            [Op.contains]: [user_id]
        };

        return models['chat_rooms'].findOne({
            where: val_where
        }).then((room) => {
            if (!room)
                return res.status(500).json({result: 'error', errorCode: 3});

            return models['messages'].create({
                content: text,
                room_id: room_id,
                user_id: user_id,
                read_users: [user_id]
            }).then(async (row) => {
                try {
                    room.changed('updatedAt', true);
                    await room.update({updatedAt: moment().toDate()});
                }catch(err) {
                    console.log(err);
                }
                const receivers = room.user_ids.filter(el => parseInt(el) !== user_id);
                models['archived_rooms'].destroy({
                    where: {
                        room_id: room_id,
                        user_id: receivers
                    }
                });
                for (let i = 0; i < receivers.length; i ++) {
                    notificationController.createChatNotification({
                        sender_id: user_id,
                        receiver_id: receivers[i],
                        title: req.session.user ? (req.session.user.first_name + ' ' + req.session.user.last_name) : 'Admin',
                        description: text,
                        is_broadcast: false,
                        message_id: row.id,
                        is_read: false
                    }, row.dataValues, receivers[i]);
                }
                room.update({is_archived: false, last_message: row.id});
                pusherTrigger('message', room.dataValues.chat_type + "-" + room.dataValues.level + "-" + room.dataValues.id, row);
                notificationController.getBadgeCounts(receivers);
                return res.status(200).json({result: "success", message: row});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    sendMediaMessage: (req, res) => {
        const { room_id } = req.body, media_file = req.file;
        let user_id = null, level = null;
        if (req.session.admin) {
            user_id = 0;
            level = 'admin';
        }
        if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            level = 'user';
        }

        return models['chat_rooms'].findOne({
            where: {
                id: room_id,
                level,
                user_ids: {
                    [Op.contains]: [user_id]
                },
            }
        }).then((room) => {
            if (!room)
                return res.status(500).json({result: 'error', errorCode: 18});

            let media_type = 'file';
            const file_type = media_file.mimetype.split('/');
            if (file_type[0] === 'image') {
                media_type = 'image'
            }

            return models['messages'].create({
                content: media_file.originalname,
                media_file: media_file.path,
                media_type: media_type,
                room_id: room_id,
                user_id: user_id,
                read_users: [user_id]
            }).then((row) => {
                let receivers = room.dataValues.user_ids.filter(el => parseInt(el) !== user_id);
                models['archived_rooms'].destroy({
                    where: {
                        room_id: room_id,
                        user_id: receivers
                    }
                });
                row.dataValues.media_file = functions.convertLocalToPublic(row.dataValues.media_file);
                for (let i = 0; i < receivers.length; i ++) {
                    notificationController.createChatNotification({
                        sender_id: user_id,
                        receiver_id: receivers[i],
                        title: req.session.user ? (req.session.user.first_name + ' ' + req.session.user.last_name) : 'Admin',
                        description: `Sent ${media_type === 'image' ? 'a photo' : 'a file - ' + media_file.originalname}.`,
                        is_broadcast: false,
                        message_id: row.id,
                        is_read: false
                    }, row.dataValues, receivers[i]);
                }
                room.update({is_archived: false, last_message: row.id});
                pusherTrigger('message', room.dataValues.chat_type + "-" + room.dataValues.level + "-" + room.dataValues.id, row);
                return res.status(200).json({result: "success", message: row});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    setMessageAsRead: (req, res) => {
        const { message_ids } = req.body;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['messages'].findAll({
            where: {
                id: message_ids
            }
        }).then((messages) => {
            for (let i = 0; i < messages.length; i ++) {
                let read_users = messages[i].dataValues.read_users;
                if (!read_users.find(el => el === user_id)) {
                    read_users.push(user_id);
                    models['messages'].update({read_users}, {
                        where: {
                            id: messages[i].dataValues.id
                        }
                    });
                }
            }

            return res.status(200).json({result: 'success', message_ids});
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    addUserToChat: function(req, res) {
        const { room_id, user_ids } = req.body;
        let level = null, user_id = null;

        if (req.session.admin) {
            level = 'admin';
            user_id = 0;
        } else if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            level = 'user';
        }

        return models['chat_rooms'].findOne({
            where: {
                id: room_id,
                user_ids: {
                    [Op.contains]: [user_id]
                },
                level
            }
        }).then((room) => {
            if (!room) {
                return res.status(500).json({result: "error", errorCode: 1});
            }

            const current_user_ids = room.user_ids.concat(user_ids);
            return room.update({user_ids: current_user_ids})
                .then(() => res.status(200).json({result: "success", room: room}).end())
                .catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    deleteUserFromChat: function(req, res) {
        const { room_id, user_id } = req.body;
        let level = null;
        if (req.session.admin) {
            level = 'admin';
        } else if (req.session.user) {
            level = 'user';
        }

        return models['chat_rooms'].findOne({
            where: {
                id: room_id,
                user_ids: {
                    [Op.contains]: [user_id]
                },
                level
            }
        }).then(room => {
            if (!room) {
                return res.status(500).json({result: "error", errorCode: 3});
            }

            const user_ids = room.user_ids.filter(item => user_id !== parseInt(item));
            return room.update({user_ids})
                .then(() => res.status(200).json({result: "success", room}).end())
                .catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    leaveUserFromChat: function(req, res) {
        const {room_id} = req.body;
        let level = null, user_id = null;
        if (req.session.admin) {
            level = 'admin';
            user_id = 0;
        } else if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
            level = 'user';
        }

        return models['chat_rooms'].findOne({
            where: {
                id: room_id,
                user_ids: {
                    [Op.contains]: [user_id]
                },
                level
            }
        }).then((room) => {
            if (!room) {
                return res.status(500).json({result: "error", errorCode: 1});
            }

            const user_ids = room.dataValues.user_ids.filter(el => parseInt(el) !== user_id);
            return room.update({user_ids: user_ids})
                .then(() => res.status(200).json({result: "success", room: room}).end())
                .catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    updateChat: function (req, res) {
        const { id } = req.params;
        let level = null, user_id = null;
        if (req.session.admin) {
            level = 'admin';
            user_id = 0;
        } else if (req.session.user) {
            level = 'user';
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        }

        return models['chat_rooms'].findOne({
            where: {
                id, level,
                user_ids: {
                    [Op.contains]: [user_id]
                }
            }
        }).then(row => {
            if (!row)
                return res.status(500).json({result: "error", errorCode: 1});

            return row.update(req.body).then(() => {
                return res.status(200).json({result: "success", room: row});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    archiveChat: function (req, res) {
        const { room_id } = req.body;
        let user_id = null;

        if (req.session.admin) {
            user_id = req.session.admin.id;
        } else if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        }

        return models['chat_rooms'].findOne({
            where: {
                id: room_id,
                user_ids: {
                    [Op.contains]: [user_id]
                }
            }
        }).then((room) => {
            if (!room) {
                return res.status(500).json({result: "error", errorCode: 1});
            }

            const archived_room = { room_id,user_id };
            return models['archived_rooms'].create(archived_room)
                .then(() => res.status(200).json({result: "success"}).end())
                .catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    getMessage: (req, res) => {
        const { id } = req.params;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['messages'].findOne({
            where: { id },
            include: [{
                model: models['users'],
                attributes: ["id", "first_name", "last_name", "avatar", "jobber_type"],
                as: 'user'
            }]
        }).then((message) => {
            if (!message)
                return res.status(500).json({result: "error", errorCode: 1});

            return models['chat_rooms'].findOne({
                where: {
                    id: message.room_id
                }
            }).then((room) => {
                if (!room)
                    return res.status(500).json({result: "error", errorCode: 1});

                if (room.dataValues.owner_id === user_id || room.dataValues.user_ids.find(el=>el === user_id)) {
                    return res.status(200).json({result: "success", message: message});
                } else {
                    return res.status(500).json({result: "error", errorCode: 1});
                }
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    getChatRoom: (req, res) => {
        const { id } = req.params;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['chat_rooms'].findOne({
            where: {
                id,
                user_ids: {
                    [Op.contains]: [user_id]
                }
            },
            include: [{
                model: models['jobs'],
                attributes: ["id", "title", "avatar", "category", "description", "owner_id"],
                as: 'job'
            }],
        }).then(async (row) => {
            if (!row)
                return res.status(200).json({result: "success", room: null});

            const last_message = await models['messages'].findAll({
                where: {
                    room_id: row.id
                },
                limit: 1,
                order: [['createdAt', 'DESC']]
            });
            row.dataValues.last_message = last_message.length > 0 ? last_message[0] : null;
            if(row.dataValues.job)
                row.dataValues.job.avatar = functions.convertLocalToPublic(row.dataValues.job.avatar);
            let { user_ids } = row.dataValues;
            return models['users'].findAll({
                where: {
                    id: user_ids
                }
            }).then((users) => {
                for(let i = 0; i < users.length; i += 1) {
                    users[i].dataValues.avatar = functions.convertLocalToPublic(users[i].dataValues.avatar);
                }
                row.dataValues.users = users;
                return res.status(200).json({result: "success", room: row});
            }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    getArchivedRooms: async function(req, res) {
        let { limit, orderBy, lastValue, keyword, roomId } = req.query;
        let val_where = { deleted_at: null }, user_id = null, level = null;

        if(roomId) {
            try {
                const room = await models['chat_rooms'].findOne({
                    where: {
                        id: parseInt(roomId)
                    }
                });

                room.changed('updatedAt', true);
                await room.update({updatedAt: moment().toDate()});
            }catch(err) {
                console.log(err);
            }
        }

        if (req.session.admin) {
            user_id = 0;
            level = "admin";
        }
        if (req.session.user) {
            user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;
        }
        if (keyword && keyword.length > 0) {
            val_where.title = {
                [Op.iLike]: "%" + keyword + "%"
            };
        }
        if (lastValue) {
            if(orderBy === 'createdAt' || orderBy === 'updatedAt') {
                lastValue = moment(moment(lastValue).format('YYYY-MM-DDTHH:mm:ssZ')).toDate();
            }
            val_where[orderBy] = {
                [Op.lt]: lastValue
            };
        }
        if (level) {
            val_where.level = level;
        }
        val_where.user_ids = {
            [Op.contains]: [user_id]
        };
        val_where.having = Sequelize.where(Sequelize.literal('(SELECT COUNT(*) FROM archived_rooms WHERE archived_rooms.room_id ="chat_rooms"."id")'), '>', '0');

        return models['chat_rooms'].findAll({
            where: val_where,
            include: [{
                model: models['jobs'],
                attributes: ["id", "title", "avatar", "category", "description"],
                as: 'job'
            }],
            order: [
                [orderBy, 'DESC'],
            ],
            limit,
        }).then(async(rows) => {
            for (let i = 0; i < rows.length; i ++) {
                const { user_ids } = rows[i].dataValues;
                const users = await models['users'].findAll({
                    attributes: ["id", "avatar", "first_name", "last_name", "email", "availability", "company", "jobber_type", "birthday", "experience_from", "experience_years", "experience_months", "description"],
                    where: {
                        id: user_ids
                    }
                });
                for (let j = 0; j < users.length; j ++) {
                    users[j].avatar = functions.convertLocalToPublic(users[j].avatar);
                }
                const sum_count = await models['messages'].count({
                    where: {
                        room_id: rows[i].id
                    }
                });
                const read_count = await models['messages'].count({
                    where: {
                        room_id: rows[i].id,
                        read_users: {
                            [Op.contains]: [user_id]
                        }
                    }
                });
                rows[i].dataValues.unread_count = sum_count - read_count;
                const last_message = await models['messages'].findAll({
                    where: {
                        room_id: rows[i].id
                    },
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                });
                rows[i].dataValues.last_message = last_message.length > 0 ? last_message[0] : null;
                rows[i].dataValues.users = users;
                if (rows[i].dataValues.level === 'user') {
                    if (rows[i].dataValues.job) {
                        if (rows[i].dataValues.job.category) {
                            rows[i].dataValues.job.category = rows[i].dataValues.job.category[0];
                        }
                        rows[i].dataValues.job.avatar = functions.convertLocalToPublic(rows[i].dataValues.job.avatar);
                    }
                }
            }

            return res.status(200).json({result: "success", rooms: rows, lastValue: rows.length > 0 ? ("" + rows[rows.length - 1][orderBy]) : null});
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    getChatRoomByJobber: (req, res) => {
        const { jobId, userId } = req.query;
        const loggUserId = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['chat_rooms'].findOne({
            where: {
                job_id: jobId,
                user_ids: {
                    [Op.contains]: [loggUserId, userId]
                }
            }
        }).then((row) => {
            return res.status(200).json({room: row}).end();
        }).catch(err => console.error(err) || res.status(500).json({result: 'error', errorCode: 0}).end());
    },

    getIsArchivedRoom: (req, res) => {
        const { roomId } = req.query;
        const user_id = req.session.main_user?req.session.main_user.id:req.session.user.id;

        return models['archived_rooms'].findOne({
            where: {
                room_id: roomId,
                user_id: user_id
            }
        }).then((row) => {
            return res.status(200).json({result: "success", isArchived: row?true:false});
        }).catch((error) => {
            console.log(error);
            return res.status(500).json({result: "error", errorCode: 0}).end();
        })
    }
};
