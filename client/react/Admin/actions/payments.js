import { actions, paths } from '../../../../utils';

export default {
  getPayments: ({startingAfter, limit}) => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_PAYMENTS_REQUEST,
        actions.ADMIN_GET_PAYMENTS_SUCCESS,
        actions.ADMIN_GET_PAYMENTS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_PAYMENT, { params: { startingAfter, limit } }),
    },
  }),

  getPaymentsHistory: ({keyword, offset, limit}) => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_PAYMENTS_HISTORY_REQUEST,
        actions.ADMIN_GET_PAYMENTS_HISTORY_SUCCESS,
        actions.ADMIN_GET_PAYMENTS_HISTORY_FAILURE,
      ],
      promise: client => client.get(paths.api.ADMIN_PAYMENT_HISTORY, { params: { keyword, offset, limit } }),
    },
  }),

  refundPayments: (id) => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_REFUND_PAYMENT_REQUEST,
        actions.ADMIN_REFUND_PAYMENT_SUCCESS,
        actions.ADMIN_REFUND_PAYMENT_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_GIVE_REFUND), {id: id})
    }
  })
};
