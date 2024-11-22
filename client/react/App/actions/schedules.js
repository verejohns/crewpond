import { actions, paths } from '../../../../utils';

export default {
  getSchedules: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_SCHEDULES_REQUEST,
        actions.GET_SCHEDULES_SUCCESS,
        actions.GET_SCHEDULES_FAILURE,
      ],
      promise: client => client.put(paths.api.APP_SCHEDULES_IN_TIME, params)
    }
  }),

  updateSchedules: data => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_SCHEDULES_REQUEST,
        actions.UPDATE_SCHEDULES_SUCCESS,
        actions.UPDATE_SCHEDULES_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_SCHEDULES, data)
    }
  }),
  updateSchedule: data => ({ type: actions.UPDATE_SCHEDULE, data }),
  removeJob: id => ({ type: actions.REMOVE_JOB, id })
};
