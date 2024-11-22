import { createSelector } from 'reselect';

const getIsJobLoadedState = state => state.jobs.isJobLoaded;
const getJob = state => state.jobs.job;
const getIsCategoriesLoadedState = state => state.category.isCategoriesLoaded;
const getIsJobUpdatingState = state => state.jobs.isUpdatingJob;

export default createSelector([
    getIsJobLoadedState,
    getJob,
    getIsCategoriesLoadedState,
    getIsJobUpdatingState
], (isJobLoaded, job, isCategoriesLoaded, isUpdatingJob) => ({
    isJobLoaded,
    job,
    isCategoriesLoaded,
    isUpdatingJob
}));
