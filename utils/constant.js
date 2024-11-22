module.exports = {
    DEFAULT_TITLE: 'Crew Pond',
    AUTHENTICATION: 'snAuthCookie',
    PASSWORD_MIN_LENGTH: 6,
    LOGGED_ACCOUNT: 'user_info',
    SUB_USERS: 'sub_users_info',
    ADMIN_ACCOUNT: 'admin_info',
    DOMAIN: `${process.env.PROTOCOL}://${process.env.DOMAIN}`,
    PAYMENT_METHOD: 'payment_method',
    USER_TOKEN: 'user_token',
    SCHEDULE_PARAMS: 'schedule_params'
};
