import { actions, paths } from '../../../../utils';

export default {
  getAllBankAccounts: () => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_BANK_ACCOUNTS_REQUEST,
        actions.GET_BANK_ACCOUNTS_SUCCESS,
        actions.GET_BANK_ACCOUNTS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_GET_BANK_ACCOUNTS),
    },
  }),

  verifyUserAccount: ({ refresh_url, return_url }) => ({
    [actions.CALL_API]: {
      types: [
        actions.VERIFY_USER_ACCOUNT_REQUEST,
        actions.VERIFY_USER_ACCOUNT_SUCCESS,
        actions.VERIFY_USER_ACCOUNT_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_VERIFY_USER_ACCOUNT, { params: { refresh_url, return_url } }),
    },
  }),

  checkAccountVerified: () => ({
    [actions.CALL_API]: {
      types: [
        actions.CHECK_ACCOUNT_VERIFIED_REQUEST,
        actions.CHECK_ACCOUNT_VERIFIED_SUCCESS,
        actions.CHECK_ACCOUNT_VERIFIED_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CHECK_ACCOUNT_VERIFIED),
    },
  }),

  getCards: () => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_BANK_ACCOUNT_REQUEST,
        actions.CREATE_BANK_ACCOUNT_SUCCESS,
        actions.CREATE_BANK_ACCOUNT_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CARDS),
    },
  }),

  createBankAccount: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_BANK_ACCOUNT_REQUEST,
        actions.CREATE_BANK_ACCOUNT_SUCCESS,
        actions.CREATE_BANK_ACCOUNT_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CREATE_BANK_ACCOUNT, postData)
    }
  }),

  createCard: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_CARD_REQUEST,
        actions.CREATE_CARD_SUCCESS,
        actions.CREATE_CARD_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CARDS, postData)
    }
  }),

  updateCard: (id, query) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_CARD_REQUEST,
          actions.UPDATE_CARD_SUCCESS,
          actions.UPDATE_CARD_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_CARDS_BY_ID, id), query)
      }
    }
  },

  deleteCard: (id) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.DELETE_CARD_REQUEST,
          actions.DELETE_CARD_SUCCESS,
          actions.DELETE_CARD_FAILURE,
        ],
        promise: client => client.delete(paths.build(paths.api.APP_CARDS_BY_ID, id))
      }
    }
  },

  deleteBank: (id) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.DELETE_BANK_REQUEST,
          actions.DELETE_BANK_SUCCESS,
          actions.DELETE_BANK_FAILURE,
        ],
        promise: client => client.delete(paths.build(paths.api.APP_PAYMENT_BY_ID, id))
      }
    }
  },

  updateBank: (id, query) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_BANK_REQUEST,
          actions.UPDATE_BANK_SUCCESS,
          actions.UPDATE_BANK_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_PAYMENT_UPDATE_BY_ID, id), query)
      }
    }
  },

  payoutExtraUser: () => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.PAYOUT_EXTRA_USER_REQUEST,
          actions.PAYOUT_EXTRA_USER_SUCCESS,
          actions.PAYOUT_EXTRA_USER_FAILURE,
        ],
        promise: client => client.post(paths.api.APP_PAYOUT_EXTRA_USER)
      }
    }
  }
};
