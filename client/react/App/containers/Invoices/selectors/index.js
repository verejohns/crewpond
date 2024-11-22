import { createSelector } from 'reselect';

const getLoadingState = state => state.invoices.isLoading;
const getNavbarParams = state => state.settings.navbarParams;
const getBadgeCount = state => state.notifications.badgeCount;

export default createSelector([
  getLoadingState,
  getNavbarParams,
  getBadgeCount
], (isLoading, navbarParams, badgeCount) => ({
  isLoading,
  navbarParams,
  badgeCount
}));
