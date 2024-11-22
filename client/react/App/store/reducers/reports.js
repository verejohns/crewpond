import { actions } from '../../../../../utils';

const initialState = {
  isRunningReport: true,
  report: null
};

const actionMap = {
  [actions.RUN_REPORT_REQUEST]: state => ({ ...state, isRunningReport: true}),
  [actions.RUN_REPORT_SUCCESS]: (state, {result}) => ({ ...state, isRunningReport: false, report: result.data }),
  [actions.RUN_REPORT_FAILURE]: (state) => ({ ...state, isRunningReport: false }),
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
