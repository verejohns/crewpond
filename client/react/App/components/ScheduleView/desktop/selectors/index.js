import { createSelector } from 'reselect';

const getJobs = state => state.schedules.jobs;
const getHeaderParams = state => state.schedules.headerParams;
const getJobbersLoadingState = state => state.users.isLoading;
const getJobsLoadingState = state => state.schedules.isLoading;
const getCategories = state => state.categories.categories;
const getCategoriesLoadingState = state => state.categories.isLoading;

export default createSelector([
  getJobs,
  getHeaderParams,
  getJobbersLoadingState,
  getJobsLoadingState,
  getCategories,
  getCategoriesLoadingState
], (jobs, headerParams, isLoadingJobbers, isLoadingJobs, categories, isLoadingCategories) => ({
  jobs,
  headerParams,
  isLoadingJobbers,
  isLoadingJobs,
  categories,
  isLoadingCategories
}));
