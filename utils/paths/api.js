module.exports = {
    // ---------------------------------------------
    // All of the APP API Paths are defined here.
    // ---------------------------------------------
    // authentication paths
    APP_LOGIN: '/api/app/login',
    APP_LOGOUT: '/api/app/logout',
    APP_REGISTER: '/api/app/register',
    APP_RESET_PASSWORD: '/api/app/reset-pwd',
    APP_FORGOT_PASSWORD: '/api/app/forgot-pwd',
    APP_SET_TOKEN: '/api/app/set-token',
    APP_RESEND_VERIFICATION_EMAIL: '/api/app/resend/verify',
    APP_SWITCH_ACCOUNT: '/api/app/switch-account',
    APP_CLEAR_FCM_TOKEN: '/api/app/clear-token',
    APP_SEND_VERIFICATION_CODE: '/api/app/send/verification',
    APP_CHECK_VERIFICATION_CODE: '/api/app/check/verification',
    // stripe paths
    APP_STRIPE_CHARGE: '/api/app/stripe/charge',
    APP_STRIPE_TRANSFER: '/api/app/stripe/transfer',
    //User management api
    APP_USER_ID: '/api/app/user/:id',
    APP_USERS: '/api/app/users',
    APP_USERS_IDS: '/api/app/users/ids',
    APP_USER_CLOSE: '/api/app/user/close',
    APP_GET_JOBBER_TYPE: '/api/app/jobber-type',
    APP_UPDATE_PASSWORD:  '/api/app/user/reset-pwd',
    APP_SUB_USERS: '/api/app/sub-users',
    APP_SUB_USER_BY_ID: '/api/app/sub-users/:id',

    APP_GET_BADGE_COUNT: '/api/app/badge',

    //Job management api
    APP_JOB:  '/api/app/job',
    APP_JOBS:  '/api/app/jobs',
    APP_JOB_ID: '/api/app/job/:id',
    APP_JOB_CLOSE: '/api/app/close-job',
    APP_JOB_IN_TIME: '/api/app/job-in-time',
    APP_JOB_ASSIGNED: '/api/app/job-assigned',
    APP_JOBBERS: '/api/app/jobbers/:id',
    APP_RENTP_XML: '/api/rentp/xml',

    //Invitation management api
    APP_INVITE: '/api/app/invite',
    APP_INVITE_ID: '/api/app/invite/:id',
    APP_INVITE_RECEIVED: '/api/app/receive-invite',
    APP_INVITE_SENT: '/api/app/sent-invite',
    APP_INVITES: '/api/app/invites',
    APP_INVITE_DECLINE: '/api/app/decline-invite',
    //Offer management api
    APP_OFFERS: '/api/app/offers',
    APP_OFFER_ID: '/api/app/offer/:id',
    APP_ARCHIVE_OFFER: '/api/app/offer/archive',
    APP_DECLINE_OFFER: '/api/app/offer/decline',
    APP_LAST_OFFER: '/api/app/offers/last',

    //Contract management api
    APP_CONTRACT: '/api/app/contract',
    APP_CONTRACT_JOBBERS: '/api/app/contract-jobbers',
    APP_CONTRACTS: '/api/app/contracts',
    APP_CONTRACTS_TEST: '/api/app/contracts-test',
    APP_CONTRACT_ID: '/api/app/contract/:id',
    APP_CLOSE_CONTRACT: '/api/app/close-contract',
    APP_ARCHIVE_CONTRACT: '/api/app/archive-contract',
    APP_CLOSE_CONTRACT_ALL: '/api/app/close-contract/all',
    APP_CLOSE_CONTRACT_ALL_TEST: '/api/app/close-contract/all-test',
    APP_ARCHIVE_CONTRACT_ALL: '/api/app/archive-contract/all',
    APP_ADD_SCHEDULE_TO_CONTRACT: '/api/app/contract/schedule/add',
    APP_REMOVE_SCHEDULE_FROM_CONTRACT: '/api/app/contract/schedule/remove',
    APP_CONTRACT_BY_JOBBER: '/api/app/contracts/jobber',

    //Feedback management api
    APP_FEEDBACK: '/api/app/feedback',
    APP_FEEDBACKS: '/api/app/feedbacks',
    APP_FEEDBACK_BY_USER: '/api/app/feedbacks-user/:id',
    APP_FEEDBACK_ID: '/api/app/feedback/:id',
    APP_FEEDBACK_TO_PRIVATE: '/api/app/feedback/private',
    //Notification management api
    APP_NOTIFICATIONS: '/api/app/notifications',
    ADMIN_NOTIFICATION_SEND: '/api/app/notification/send',
    //Invoice management api
    APP_INVOICE: '/api/app/invoice',
    APP_INVOICE_ID: '/api/app/invoice/:id',
    APP_INVOICES: '/api/app/invoices',
    APP_INVOICE_LAST: '/api/app/invoices/last',
    APP_INVOICE_DOWNLOAD: '/api/app/invoices/download',
    APP_INVOICES_RECEIVED: '/api/app/invoices/received',
    APP_INVOICES_RECEIVED_ALL: '/api/app/invoices/received/all',
    APP_INVOICES_SENT: '/api/app/invoices/sent',
    APP_INVOICES_SENT_ALL: '/api/app/invoices/sent/all',
    APP_INVOICES_JOB: '/api/app/invoices/job',
    APP_INVOICES_CONTRACT: '/api/app/invoices/contract',
    //Payment management api
    APP_PAYMENT: '/api/app/payment',
    APP_KEY_JOBBER_SUBSCRIPTION: '/api/app/key-jobber/subscription',
    APP_KEY_HIRER_SUBSCRIPTION: '/api/app/key-hirer/subscription',
    APP_SUPER_USER_SUBSCRIPTION: '/api/app/super-user/subscription',
    APP_RESUME_SUBSCRIPTION: '/api/app/subscription/resume',
    APP_LIST_SUBSCRIPTIONS: '/api/app/subscription/list',
    APP_KEY_JOBBER_SUBSCRIPTION_CANCEL: '/api/app/key-jobber/subscription/cancel',
    APP_KEY_HIRER_SUBSCRIPTION_CANCEL: '/api/app/key-hirer/subscription/cancel',
    APP_PAYMENT_BY_ID: '/api/app/payment/:id',
    APP_PAYMENT_UPDATE_BY_ID: '/api/app/payment/:id',
    APP_REFUND_PAYMENT: '/api/app/payment/refund',
    APP_BUY_CONNECTION: '/api/app/connection/buy',
    APP_PURCHASE_SOS_URGENT_JOB: '/api/app/sos-job/purchase',
    APP_GIVE_REFUND: '/api/admin/refund',
    APP_GET_KEY_CUSTOMER: '/api/app/st-key',
    APP_CREATE_BANK_ACCOUNT: '/api/app/bank-account/create',
    APP_GET_BANK_ACCOUNTS: '/api/app/bank-accounts',
    APP_VERIFY_USER_ACCOUNT: '/api/app/verify-user-account',
    APP_CHECK_ACCOUNT_VERIFIED: '/api/app/check-account-verified',
    APP_CARDS: '/api/app/cards',
    APP_CARDS_BY_ID: '/api/app/cards/:id',
    ADMIN_PAYMENT_HISTORY: '/api/app/payment-history',
    APP_PAYOUT_EXTRA_USER: '/api/app/extra-user/buy',


    //Favorite management api
    APP_FAVORITE: '/api/app/favorite',
    APP_IS_FAVORITE_USER: '/api/app/user/:id/favorite/check',
    APP_GET_FAVORITE_USERS: '/api/app/favorites',
    APP_GET_FAVORITE_JOBBERS: '/api/app/favorite-jobbers/:id',
    //Worktime management api
    APP_WORKTIME: '/api/app/worktime',
    APP_WORKTIME_ID: '/api/app/worktime/:id',
    APP_WORKTIMES: '/api/app/worktimes',

    //category api
    APP_CATEGORIES: '/api/app/categories',

    ADMIN_CHAT: '/api/app/admin-chat',
    APP_CHAT: '/api/app/chat',
    APP_CHATS: '/api/app/chats',
    APP_CHATS_BY_JOBID: '/api/app/chats-job',
    APP_CHAT_ID: '/api/app/chat/:id',
    APP_CHAT_BY_JOBBER: '/api/app/chat-jobber',
    APP_ADD_USER_TO_CHAT: '/api/app/chat/add',
    APP_DEL_USER_FROM_CHAT: '/api/app/chat/remove',
    APP_LEAVE_FROM_CHAT: '/api/app/chat/leave',
    APP_ARCHIVE_CHAT: '/api/app/chat/archive',
    APP_IS_ARCHIVED_ROOM: '/api/app/chats/archived',

    APP_MESSAGES: '/api/app/messages',
    APP_MESSAGE_ID: '/api/app/message/:id',
    APP_TEXT_MESSAGE: '/api/app/message/text',
    APP_MEDIA_MESSAGE: '/api/app/message/media',
    APP_MESSAGE_AS_READ: '/api/app/message/read',

    APP_SCHEDULES: '/api/app/schedules',
    APP_SCHEDULES_LINK: '/api/app/schedules',
    APP_SCHEDULES_IN_TIME: '/api/app/schedules-in-time',

    // ---------------------------------------------
    // All of the ADMIN API Paths are defined here.
    // ---------------------------------------------
    //admin api
    ADMIN_LOGIN: '/api/admin/auth',
    //admin dashboard
    ADMIN_CARD_GRAPH: '/api/admin/card-graph',
    ADMIN_PAYMENT_GRAPH: '/api/admin/payment-graph',
    ADMIN_CONTRACT_GRAPH: '/api/admin/contract-graph',
    ADMIN_USERS_INFO: '/api/admin/users-info',
    ADMIN_JOBS_INFO: '/api/admin/jobs-info',
    ADMIN_TOP_RATED_USERS: '/api/admin/top-rated',
    //admin chat
    ADMIN_CREATE_DIRECT_CHAT: '/api/admin/direct-chat/create',
    ADMIN_CREATE_GROUP_CHAT: '/api/admin/group-chat/create',
    ADMIN_GET_CHAT_LIST: '/api/admin/chat-list',
    ADMIN_GET_DIRECT_CHAT_HISTORY: '/api/admin/direct/chats/history',
    ADMIN_GET_GROUP_CHAT_HISTORY: '/api/admin/group/chats/history',
    ADMIN_SEND_GROUP_CHAT: '/api/admin/group/chat/send',
    ADMIN_SEND_DIRECT_CHAT: '/api/admin/direct/chat/send',
    ADMIN_DELETE_CHAT_ROOM: '/api/admin/chat-room/delete/:id',
    //admin email
    ADMIN_SEND_EMAIL: '/api/admin/email/send',
    ADMIN_GET_SENT_EMAILS: '/api/admin/sent-emails',
    ADMIN_GET_SENT_EMAIL: '/api/admin/sent-email/:id',
    ADMIN_DELETE_SENT_EMAIL: '/api/admin/sent-email/delete/:id',

    APP_ARCHIVED_ROOMS: '/api/app/archived-rooms',
    APP_ARCHIVED_CONTRACTS: '/api/app/archived-contracts',
    APP_ARCHIVED_OFFERS: '/api/app/archived-offers',

    APP_STRIPE_WEBHOOK: '/api/stripe/webhook',

    APP_RUN_REPORT: '/api/report/run',
    APP_DOWNLOAD_REPORT: '/api/report/:id',
    APP_JOB_COMPLETED: '/api/admin/complete-job',
    APP_JOB_UNCOMPLETED: '/api/admin/uncomplete-job',

    APP_TEMP_URL: '/api/temp'
};
