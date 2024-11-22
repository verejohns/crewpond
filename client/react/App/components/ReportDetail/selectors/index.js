import { createSelector } from 'reselect';

const getInitialState = state => state.offers.offer;
const getLoadingState = state => state.offers.isLoading;

export default createSelector([
  getInitialState,
  getLoadingState
], (offer, isLoading) => ({
  offer,
  isLoading
}));
