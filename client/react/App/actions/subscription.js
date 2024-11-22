import { actions, paths } from '../../../../utils';

export default {
  resumeSubscription: (email, subscription_id) => ({
    [actions.CALL_API]: {
      types: [
        actions.RESUME_SUBSCRIPTION_REQUEST,
        actions.RESUME_SUBSCRIPTION_SUCCESS,
        actions.RESUME_SUBSCRPITION_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_RESUME_SUBSCRIPTION), {email, subscription_id})
    }
  }),

  createSuperUser: () => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_SUPER_SUBSCRIPTION_REQUEST,
        actions.CREATE_SUPER_SUBSCRIPTION_SUCCESS,
        actions.CREATE_SUPER_SUBSCRPITION_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_SUPER_USER_SUBSCRIPTION)
    }
  }),

  resumeSuperUser: (data) => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_SUPER_SUBSCRIPTION_REQUEST,
        actions.CREATE_SUPER_SUBSCRIPTION_SUCCESS,
        actions.CREATE_SUPER_SUBSCRPITION_FAILURE,
      ],
      promise: client => client.put(paths.api.APP_SUPER_USER_SUBSCRIPTION, data)
    }
  }),

  cancelSuperUser: () => ({
    [actions.CALL_API]: {
      types: [
        actions.CANCEL_SUPER_SUBSCRIPTION_REQUEST,
        actions.CANCEL_SUPER_SUBSCRIPTION_SUCCESS,
        actions.CANCEL_SUPER_SUBSCRPITION_FAILURE,
      ],
      promise: client => client.delete(paths.api.APP_SUPER_USER_SUBSCRIPTION)
    }
  }),

  cancelKeyHirer: () => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_KEY_HIRER_REQUEST,
        actions.UPDATE_KEY_HIRER_SUCCESS,
        actions.UPDATE_KEY_HIRER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_KEY_HIRER_SUBSCRIPTION_CANCEL)
    }
  }),
  createKeyJobber:(data) => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_KEY_JOBBER_REQUEST,
        actions.UPDATE_KEY_JOBBER_SUCCESS,
        actions.UPDATE_KEY_JOBBER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_KEY_JOBBER_SUBSCRIPTION, data)
    }
  }),
  cancelKeyJobber: () => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_KEY_JOBBER_REQUEST,
        actions.UPDATE_KEY_JOBBER_SUCCESS,
        actions.UPDATE_KEY_JOBBER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_KEY_JOBBER_SUBSCRIPTION_CANCEL)
    }
  }),
  listSubscriptions: () =>({
    [actions.CALL_API]: {
      types: [
        actions.LIST_SUBSCRIPTION_REQUEST,
        actions.LIST_SUBSCRIPTION_SUCCESS,
        actions.LIST_SUBSCRIPTION_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_LIST_SUBSCRIPTIONS)
    }
  }),
};
