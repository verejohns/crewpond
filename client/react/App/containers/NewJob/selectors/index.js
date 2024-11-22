import { createSelector } from 'reselect';

const getLoadingState = state => state.jobs.isLoading;
const getSubmittingState = state => state.jobs.isSubmitting;
const getJobInfo = state => state.jobs.job;

export default createSelector([
  getLoadingState,
  getSubmittingState,
  getJobInfo
], (isLoading, isSubmitting, job) => ({
  isLoading,
  isSubmitting,
  job
}));
