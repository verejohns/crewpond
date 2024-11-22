import { actions, paths } from '../../../../utils';

export default {
  runReport: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.RUN_REPORT_REQUEST,
        actions.RUN_REPORT_SUCCESS,
        actions.RUN_REPORT_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_RUN_REPORT, postData)
    }
  }),

  downloadReport: id => ({
    [actions.CALL_API]: {
      types: [
        actions.DOWNLOAD_REPORT_REQUEST,
        actions.DOWNLOAD_REPORT_SUCCESS,
        actions.DOWNLOAD_REPORT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_DOWNLOAD_REPORT, id))
    }
  }),
  
};
