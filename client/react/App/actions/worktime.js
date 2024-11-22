import { actions, paths } from '../../../../utils';

export default {
  createWorkTime: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_WORKTIME_REQUEST,
        actions.CREATE_WORKTIME_SUCCESS,
        actions.CREATE_WORKTIME_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_WORKTIME, postData)
    }
  }),

  getWorkTimes: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_WORKTIMES_REQUEST,
        actions.GET_WORKTIMES_SUCCESS,
        actions.GET_WORKTIMES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_WORKTIMES, {params})
    }
  }),

  updateWorkTIme: (id, query) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_WORKTIMES_REQUEST,
        actions.GET_WORKTIMES_SUCCESS,
        actions.GET_WORKTIMES_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.APP_WORKTIME_ID, id), query)
    }
  })
};
