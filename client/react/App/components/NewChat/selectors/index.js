import { createSelector } from 'reselect';

const getJobbersInitialState = state => state.jobs.jobbers;
const getJobbersLoadingState = state => state.jobs.isJobbersLoading;
const getFavoritesInitialState = state => state.favorite.favorites;
const getFavoritesLoadingState = state => state.favorite.isFavoritesLoading

export default createSelector([
    getJobbersInitialState,
    getJobbersLoadingState,
    getFavoritesInitialState,
    getFavoritesLoadingState
], (jobbers, isJobbersLoading, favorites, isFavoritesLoading) => ({
    jobbers,
    isJobbersLoading, 
    favorites, 
    isFavoritesLoading
}));
