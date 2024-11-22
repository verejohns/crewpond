import { createSelector } from 'reselect';

const getSearchParams = state => state.users.searchParams;

export default createSelector([
  getSearchParams
], (searchParams) => ({
  searchParams
}));
