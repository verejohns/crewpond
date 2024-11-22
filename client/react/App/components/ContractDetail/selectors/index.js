import { createSelector } from 'reselect/lib/index';

const getInitialState = state => state.contracts.contract;
const getLoadingState = state => state.contracts.isLoading;
const getInitialContractsState = state => state.contracts.contracts;

export default createSelector([
  getInitialState,
  getLoadingState,
  getInitialContractsState
], (contract, isLoading, contracts) => ({
  contract,
  isLoading,
  contracts
}));
