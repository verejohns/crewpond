import { createSelector } from 'reselect';

const getHeaderParams = state => state.schedules.headerParams;

export default createSelector([
  getHeaderParams,
], (headerParams) => ({
  headerParams
}));
