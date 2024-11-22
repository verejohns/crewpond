import { paths } from '../../../../../utils'

export default {
    "job": [[{
        title: 'Search Jobs',
        url: `${paths.client.APP_JOBS}`
    }, {
        title: 'Offers',
        url: `${paths.client.APP_JOBS}#offers`
    }, {
        title: 'Invites',
        url: `${paths.client.APP_JOBS}#invites`
    }, {
        title: 'Favorites',
        url: `${paths.client.APP_JOBS}#favorites`
    }], [{
        title: 'Create Job',
        url: paths.client.APP_NEW_JOB
    }, {
        title: 'Contracts',
        url: `${paths.client.APP_JOBS}#contracts`
    }]],
    "account": [[{
        title: 'Notifications',
        url: paths.client.APP_NOTIFICATIONS
    }, {
        title: 'Password and Security',
        url: paths.client.APP_SECURITY
    }, {
        title: 'Invoices',
        url: paths.client.APP_INVOICES
    }, {
        title: 'Payment Options',
        url: paths.client.APP_PAYMENT_METHOD
    },{
        title: 'Subscriptions',
        url: paths.client.APP_SUBSCRIPTIONS
    }], [{
        title: 'Help Topics',
        url: paths.client.APP_JOBS
    }, {
        title: 'Terms and Conditions',
        url: paths.client.APP_JOBS
    }]],
    "dashboard": [[{
        title: 'Job Posts',
        url: `${paths.client.APP_BASE}`
    }, {
        title: 'Offers',
        url: `${paths.client.APP_BASE}#offers`
    }, {
        title: 'Contracts',
        url: `${paths.client.APP_BASE}#contracts`
    }, {
        title: 'Invites',
        url: `${paths.client.APP_BASE}#invites`
    }]]
}
