const models = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const { sendNotification } = require('../../utils/functions');
const { time } = require('../../utils');

module.exports.alertJobIn24hours = () => {
    models['times'].findAll({
        raw: true,
        where: {
            from: {
                [Op.lt]: moment().add(24, 'hours'),
                [Op.gt]: moment().add(23, 'hours')
            }
        }
    }).then((times) => {
        for(let i = 0; i < times.length; i += 1) {
            models['contracts'].findAll({
                where: {
                    schedule_ids: {
                        [Op.contains]: [times[i].schedule_id]
                    }
                },
                include: [{
                    attributes: ["id", "first_name", "last_name", "avatar", "company"],
                    model: models['users'],
                    as: 'jobber'
                }, {
                    attributes: ["id", "title", "due_date", "price", "description", "avatar", "is_hourly", "is_urgent", "is_public", "is_completed", "is_assigned", "is_closed", "latitude", "longitude", "address", "place_name"],
                    model: models['jobs'],
                    as: 'job'
                },]
            }).then((contracts) => {
                for(let j = 0; j < contracts.length; j += 1) {
                    models['user_tokens'].findAll({
                        raw: true,
                        where: {
                            user_id: contracts[j].dataValues.jobber.dataValues.id
                        }
                    }).then((tokens) => {
                        if (tokens.length > 0) {
                            let ios_fcm_tokens = [];
                            let android_fcm_tokens = [];
                            let web_fcm_tokens = [];
                            for (let i = 0; i < tokens.length; i ++) {
                                if (tokens[i].token){
                                    if(tokens[i].platform === 'ios'){
                                        ios_fcm_tokens.push(tokens[i].token);
                                    }else if(tokens[i].platform === 'android') {
                                        android_fcm_tokens.push(tokens[i].token);
                                    }else if(tokens[i].platform === 'web') {
                                        web_fcm_tokens.push(tokens[i].token);
                                    }
                                }
                            }
                            const hhmmss = time.hhmmss(moment.duration(moment(times[i].from).diff(moment()))/1000, true);
                            console.log(tokens[0], hhmmss, 'push notification schedule')
                            
                            if(web_fcm_tokens.length > 0) {
                                sendNotification({
                                    notification: {
                                        title: contracts[j].dataValues.job.dataValues.title,
                                        body: `Your schedule will start in 24 hours`,
                                        notification: contracts[j],
                                    },
                                    registration_ids: web_fcm_tokens
                                });
                            }

                            if(ios_fcm_tokens.length > 0) {
                                sendNotification({
                                    notification: {
                                        title: contracts[j].dataValues.job.dataValues.title,
                                        body: `Your schedule will start in 24 hours`,
                                        notification: contracts[j],
                                    },
                                    registration_ids: ios_fcm_tokens
                                });
                            }
        
                            if(android_fcm_tokens.length > 0) {
                                sendNotification({
                                    notification: {
                                        title: contracts[j].dataValues.job.dataValues.title,
                                        body: `Your schedule will start in 24 hours`,
                                        notification: contracts[j],
                                    },
                                    registration_ids: android_fcm_tokens
                                });
                            }
                        }
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }).catch((err) => {
        console.log(err)
    })
};