import { createSelector } from 'reselect';

const getInitialState = state => state.invites.invite;
const getLoadingState = state => state.invites.isLoading;

export default createSelector([
  getInitialState,
  getLoadingState
], (invite, isLoading) => ({
  invite,
  isLoading
}));
