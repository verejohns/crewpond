import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  isPaymentsLoaded: false,
  payments: [],
  isPaymentLoaded: false,
  payment: {},
  isRefundedPayment: false
};

const actionMap = {
  [actions.ADMIN_GET_PAYMENTS_REQUEST]: state => ({ ...state, isSubmitting: true, isPaymentsLoaded: false }),
  [actions.ADMIN_GET_PAYMENTS_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isPaymentsLoaded: true,
    payments: result.data,
  }),
  [actions.ADMIN_GET_PAYMENTS_FAILURE]: state => ({ ...state, isSubmitting: false, isPaymentsLoaded: false }),

  [actions.ADMIN_GET_PAYMENT_REQUEST]: state => ({ ...state, isPaymentsLoaded: false }),
  [actions.ADMIN_GET_PAYMENT_SUCCESS]: (state, { result }) => ({
    ...state,
    isPaymentsLoaded: true,
    payment: result.data,
  }),
  [actions.ADMIN_GET_PAYMENT_FAILURE]: state => ({ ...state, isPaymentsLoaded: false }),


  [actions.ADMIN_REFUND_PAYMENT_REQUEST]: state => ({ ...state, isSubmitting: true, isRefundedPayment: false }),
  [actions.ADMIN_REFUND_PAYMENT_SUCCESS]: state => ({ ...state, isSubmitting: false, isRefundedPayment: true }),
  [actions.ADMIN_REFUND_PAYMENT_FAILURE]: state => ({ ...state, isSubmitting: false, isRefundedPayment: false }),
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
