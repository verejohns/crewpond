import { createSelector } from 'reselect';

const getNavbarParams = state => state.settings.navbarParams;
const getExtraUserState = state => state.payments.isSubmittingExtraUser;
const getBadgeCount = state => state.notifications.badgeCount;

export default createSelector([
  getNavbarParams,
  getExtraUserState,
  getBadgeCount
], (navbarParams, isSubmittingExtraUser, badgeCount) => ({
  navbarParams,
  isSubmittingExtraUser,
  badgeCount
}));
