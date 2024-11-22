import { paths } from '../../../../../utils';

export default {
  items: [{
    name: 'Dashboard',
    url: paths.client.APP_BASE
  }, {
    name: 'Jobs',
    url: paths.client.APP_JOBS
  }, {
    name: 'My Calendar',
    url: paths.client.APP_SCHEDULE
  }, {
    name: 'Chats',
    url: paths.client.APP_MESSAGES
  }, /*{
    name: 'Report',
    url: paths.client.APP_REPORTS
  },*/ {
    name: 'Invoices',
    url: paths.client.APP_INVOICES
  }, {
    name: 'Settings',
    children: [{
      name: 'Password and Security',
      url: paths.client.APP_SECURITY
    }, {
        name: 'Payment Options',
        url: paths.client.APP_PAYMENT_METHOD
    },{
      name: 'Subscriptions',
      url: paths.client.APP_SUBSCRIPTIONS
  }, {
        name: 'Archieved Folder',
        key: 'archieve_folder'
    }, {
        name: 'Support',
        key: 'support'
    }, {
        name: 'Help Topics',
        url: paths.client.APP_USER_FAQ
    }, {
        name: 'Terms and Conditions',
        url: paths.client.APP_USER_TERMS
    }, {
        name: 'Deactive Accounts',
        key: 'deactive_accounts'
    }, ]
  }, {
    name: 'Logout',
    url: paths.client.APP_LOGOUT
  }]
};
