import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  isLoading: true,
  offer: null
};

const actionMap = {
  [actions.CREATE_OFFER_REQUEST]: state => ({ ...state, isSubmitting: true}),
  [actions.CREATE_OFFER_SUCCESS]: (state) => ({ ...state, isSubmitting: false }),
  [actions.CREATE_OFFER_FAILURE]: (state) => ({ ...state, isSubmitting: false }),

  [actions.GET_OFFERS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_OFFERS_SUCCESS]: (state) => ({ ...state, isLoading: false }),
  [actions.GET_OFFERS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_ARCHIVED_OFFERS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_ARCHIVED_OFFERS_SUCCESS]: (state) => ({ ...state, isLoading: false }),
  [actions.GET_ARCHIVED_OFFERS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_OFFER_REQUEST]: state => ({ ...state, isLoading: true }),
  [actions.GET_OFFER_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, offer: result.data.offer }),
  [actions.GET_OFFER_FAILURE]: state => ({ ...state, isLoading: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
