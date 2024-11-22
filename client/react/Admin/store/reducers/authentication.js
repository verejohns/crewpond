import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  isFormInvalid: false
};

const actionMap = {
  [actions.ADMIN_LOGIN_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.ADMIN_LOGIN_SUCCESS]: (state, {}) => ({ ...state, isSubmitting: false, isFormInvalid: false }),
  [actions.ADMIN_LOGIN_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, isFormInvalid: !!status, isSubmitting: false }),

  [actions.RESET_ADMIN_LOGIN_STATE]: state => ({ ...state, isFormInvalid: false }),

};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
