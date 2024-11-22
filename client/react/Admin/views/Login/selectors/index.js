import { createSelector } from 'reselect';

const getSubmitState = state => state.authentication.isSubmitting;
const getIsFormInvalid = state => state.authentication.isFormInvalid;

export default createSelector([
  getSubmitState,
  getIsFormInvalid,
], (isSubmitting, isFormInvalid) => ({
  isSubmitting,
  isFormInvalid,
}));
