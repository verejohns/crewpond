import { createSelector } from 'reselect/lib/index';

const getInitialState = state => state.contracts.contract;
const getLoadingState = state => state.contracts.isLoading;

export default createSelector([
  getInitialState,
  getLoadingState,
], (contract, isLoading) => ({
  contract,
  isLoading
}));
