import { createSelector } from 'reselect';

const getLoadingState = state => state.categories.isLoading;
const getCategories = state => state.categories.categories;
const getUsersState = state => state.users.users;
const getJobsState = state => state.jobs.jobs;
const getBadgeCount = state => state.notifications.badgeCount;
const getSchedulesState = state => state.schedules.jobs;
const getSubmitState = state => state.schedules.isSubmitting;
const getScheduleHeaderParams = state => state.schedules.headerParams;

export default createSelector([
  getLoadingState,
  getCategories,
  getUsersState,
  getJobsState,
  getBadgeCount,
  getSchedulesState,
  getSubmitState,
  getScheduleHeaderParams,
], (isLoading, categories, users, jobs, badgeCount, schedulesByJob, isPublishing, scheduleHeaderParams) => ({
  isLoading,
  categories,
  users,
  jobs,
  badgeCount,
  schedulesByJob,
  isPublishing,
  scheduleHeaderParams
}));
