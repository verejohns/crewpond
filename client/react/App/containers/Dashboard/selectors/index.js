import { createSelector } from 'reselect';

const getLoadingState = state => state.jobs.isLoading;
const getSearchParams = state => state.jobs.searchParams;
const getNavbarParams = state => state.settings.navbarParams;

export default createSelector([
  getLoadingState,
  getSearchParams,
  getNavbarParams
], (isLoading, searchParams, navbarParams) => ({
  isLoading,
  searchParams,
  navbarParams
}));
