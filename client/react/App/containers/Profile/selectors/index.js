import { createSelector } from 'reselect';

const getIsUserLoadedState = state => state.users.isLoading;
const getUser = state => state.users.user;

export default createSelector([
    getIsUserLoadedState,
    getUser,
], (isLoading, user) => ({
    isLoading,
    user
}));
