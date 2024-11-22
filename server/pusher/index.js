const Pusher = require('pusher');
const pusher = new Pusher({
    appId      : process.env.PUSHER_APP_ID,
    key        : process.env.PUSHER_APP_KEY,
    secret     : process.env.PUSHER_APP_SECRET,
    cluster    : process.env.PUSHER_CLUSTER,
    useTLS  : true,
});

module.exports.pusherTrigger = (status, channel, data) => {
    pusher.trigger(
        channel,
        status, 
        data
    );
}