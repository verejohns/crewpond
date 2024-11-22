import { createSelector } from 'reselect';

const getLogoutState = state => state.authentication.isLoggingOut;

export default createSelector([
    getLogoutState,
], (isLoggingOut) => ({
    isLoggingOut,
}));
