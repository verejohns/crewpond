import { actions } from '../../../../../utils';

const initialState = {
  isLoadingCards: true,
  isLoadingBanks: true,
  cards: [],
  banks: [],
  isSubmittingExtraUser: false
};

const actionMap = {
  [actions.GET_BANK_ACCOUNTS_REQUEST]: state => ({ ...state, isLoadingBanks: true}),
  [actions.GET_BANK_ACCOUNTS_SUCCESS]: (state, {result}) => ({ ...state, isLoadingBanks: false, banks: result.data }),
  [actions.GET_BANK_ACCOUNTS_FAILURE]: (state) => ({ ...state, isLoadingBanks: false }),

  [actions.GET_CARDS_REQUEST]: state => ({ ...state, isLoadingCards: true}),
  [actions.GET_CARDS_SUCCESS]: (state, {result}) => ({ ...state, isLoadingCards: false, cards: result.data }),
  [actions.GET_CARDS_FAILURE]: (state) => ({ ...state, isLoadingCards: false }),

  [actions.PAYOUT_EXTRA_USER_REQUEST]: state => ({ ...state, isSubmittingExtraUser: true}),
  [actions.PAYOUT_EXTRA_USER_SUCCESS]: (state) => ({ ...state, isSubmittingExtraUser: false}),
  [actions.PAYOUT_EXTRA_USER_FAILURE]: (state) => ({ ...state, isSubmittingExtraUser: false }),
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
