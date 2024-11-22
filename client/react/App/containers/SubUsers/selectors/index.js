import { createSelector } from 'reselect';

const getLoadingState = state => state.users.isLoading;
const getSubUsers = state => state.users.sub_users;

export default createSelector([
  getLoadingState,
  getSubUsers,
], (isLoading, sub_users) => ({
  isLoading,
  sub_users
}));
