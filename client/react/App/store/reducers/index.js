import { combineReducers } from 'redux';

import authentication from './authentication';
import jobs from './jobs';
import offers from './offers';
import contracts from './contracts';
import invites from './invites';
import categories from './categories';
import chats from './chats';
import schedules from './schedules';
import users from './users';
import favorite from './favorite';
import settings from './settings';
import feedbacks from './feedbacks';
import invoices from './invoices';
import notifications from "./notifications";
import reports from './reports';
import payments from './payments';

export default combineReducers({
  authentication,
  jobs,
  offers,
  contracts,
  invites,
  categories,
  chats,
  schedules,
  users,
  favorite,
  settings,
  feedbacks,
  invoices,
  notifications,
  reports,
  payments
});
