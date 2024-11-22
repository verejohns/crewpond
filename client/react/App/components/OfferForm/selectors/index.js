import { createSelector } from 'reselect';

const getInitialState = state => state.jobs.job;
const getLoadingState = state => state.jobs.isLoading;

export default createSelector([
  getInitialState,
  getLoadingState
], (job, isLoading) => ({
  job,
  isLoading
}));
