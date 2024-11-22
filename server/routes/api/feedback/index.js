const { paths } = require('../../../../utils');
const { feedbackController } = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_FEEDBACK, feedbackController.createFeedback);
    router.get(paths.api.APP_FEEDBACKS, feedbackController.getFeedbacks);
    router.post(paths.api.APP_FEEDBACK_TO_PRIVATE, feedbackController.makeFeedbackAsPrivate);
    router.get(paths.api.APP_FEEDBACK_ID, feedbackController.getFeedbackById);
    router.put(paths.api.APP_FEEDBACK_BY_USER, feedbackController.updateFeedbackByUser);
};
