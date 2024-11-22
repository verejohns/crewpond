import { actions } from '../../../../../utils';

const initialState = {
  isLoading: true,
  invoice: {}
};

const actionMap = {
  [actions.GET_INVOICES_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_INVOICES_SUCCESS]: (state) => ({ ...state, isLoading: false }),
  [actions.GET_INVOICES_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_INVOICE_REQUEST]: state => ({ ...state, isLoading: true }),
  [actions.GET_INVOICE_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, invoice: result.data.invoice }),
  [actions.GET_INVOICE_FAILURE]: state => ({ ...state, isLoading: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
