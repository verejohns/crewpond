import { createSelector } from 'reselect';

const getIsSubmitting = state => state.users.isSubmitting;
const getIsUsersLoaded = state => state.users.isUsersLoaded;
const getInitialState = state => state.users.users;

export default createSelector([
  getIsSubmitting,
  getIsUsersLoaded,
  getInitialState
], (isSubmitting, isUsersLoaded, users) => ({
  isSubmitting,
  isUsersLoaded,
  users
}));
