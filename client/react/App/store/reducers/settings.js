import { actions } from '../../../../../utils';

const initialState = {
  isLoading: true,
  terms: null,
  faqs: null,

  navbarParams: {}
};

const actionMap = {
  [actions.GET_TERMS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_TERMS_SUCCESS]: (state, {result}) => ({ ...state, isLoading: false, terms: result.data.terms }),
  [actions.GET_TERMS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_FAQS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_FAQS_SUCCESS]: (state, {result}) => ({ ...state, isLoading: false, faqs: result.data.faqs }),
  [actions.GET_FAQS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.UPDATE_NAVBAR_PARAMS]: (state, { params }) => ({ ...state, navbarParams: params})
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
