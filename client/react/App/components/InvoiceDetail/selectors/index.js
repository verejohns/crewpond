import { createSelector } from 'reselect';

const getInitialState = state => state.invoices.invoice;
const getLoadingState = state => state.invoices.isLoading;

export default createSelector([
  getInitialState,
  getLoadingState
], (invoice, isLoading) => ({
  invoice,
  isLoading
}));
