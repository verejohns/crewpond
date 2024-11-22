import { createSelector } from 'reselect';

const getSubmitState = state => state.authentication.isSubmitting;

export default createSelector([
  getSubmitState
], (isSubmitting) => ({
  isSubmitting
}));
