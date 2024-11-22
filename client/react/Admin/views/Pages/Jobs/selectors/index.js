import { createSelector } from 'reselect';

const getIsSubmitting = state => state.jobs.isSubmitting;
const getIsJobsLoaded = state => state.jobs.isJobsLoaded;
const getInitialState = state => state.jobs.jobs;

export default createSelector([
  getIsSubmitting,
  getIsJobsLoaded,
  getInitialState
], (isSubmitting, isJobsLoaded, jobs) => ({
  isSubmitting,
  isJobsLoaded,
  jobs
}));
