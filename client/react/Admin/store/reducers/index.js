import { combineReducers } from 'redux';

import authentication from './authentication';
import users from './users';
import jobs from './jobs';
import category from './category';
import chat from './chat';
import payments from './payments';
import dashboard from './dashboard';
import feedbacks from './feedbacks';

export default combineReducers({
  authentication,
  users,
  jobs,
  category,
  chat,
  payments,
  dashboard,
  feedbacks
});
