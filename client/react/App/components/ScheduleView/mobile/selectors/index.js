import { createSelector } from 'reselect';

const getJobs = state => state.schedules.jobs;
const getHeaderParams = state => state.schedules.headerParams;
const getLoadingState = state => state.schedules.isLoading;

export default createSelector([
  getJobs,
  getHeaderParams,
  getLoadingState,
], (jobs, headerParams, isLoading) => ({
  jobs,
  headerParams,
  isLoading
}));
