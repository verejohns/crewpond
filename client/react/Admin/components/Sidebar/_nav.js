import { paths } from '../../../../../utils'

export default {
  items: [{
    name: 'Dashboard',
    url: paths.client.ADMIN_DASHBOARD,
    icon: 'fa fa-tachometer'
  }, {
    name: 'Users',
    url: paths.client.ADMIN_USERS,
    icon: 'fa fa-users'
  }, {
    name: 'Jobs',
    url: paths.client.ADMIN_JOBS,
    icon: 'fa fa-tasks',
  }, {
    name: 'Payments',
    url: paths.client.ADMIN_SUBS,
    icon: 'fa fa-cc-stripe'
  }, {
    name: 'Chat',
    url: paths.client.ADMIN_CHAT,
    icon: 'fa fa-comments'
  }, {
    name: 'Email',
    url: paths.client.ADMIN_EMAIL,
    icon: 'fa fa-email'
  }]
};
