import { createSelector } from 'reselect';

const getIsUserLoadedState = state => state.users.isUserLoaded;
const getUser = state => state.users.user;
const getIsCategoriesLoadedState = state => state.category.isCategoriesLoaded;
const getCategories = state => state.category.categories;
const getIsUserUpdatingState = state => state.users.isUpdatingUser;

export default createSelector([
    getIsUserLoadedState,
    getUser,
    getIsCategoriesLoadedState,
    getCategories,
    getIsUserUpdatingState
], (isUserLoaded, user, isCategoriesLoaded, categories, isUpdatingUser) => ({
    isUserLoaded,
    user,
    isCategoriesLoaded,
    categories,
    isUpdatingUser
}));
