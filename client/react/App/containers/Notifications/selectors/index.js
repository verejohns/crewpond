import { createSelector } from 'reselect';

const getLoadingState = state => state.notifications.isLoading;

export default createSelector([
  getLoadingState
], (isLoading) => ({
  isLoading
}));
