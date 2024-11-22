const { paths } = require('../../../../utils');
const { jobsController } = require("../../../controllers");
const { fileParser } = require("../../../middlewares");

module.exports = (router) => {
    router.get(paths.api.APP_JOB, jobsController.getJobs);
    router.post(paths.api.APP_JOB, fileParser(), jobsController.createJob);

    router.post(paths.api.APP_JOBS, jobsController.findJobs);

    router.get(paths.api.APP_JOB_ID, jobsController.getJobById);
    router.put(paths.api.APP_JOB_ID, fileParser(), jobsController.updateJob);
    router.delete(paths.api.APP_JOB_ID, jobsController.deleteJob);

    router.post(paths.api.APP_JOB_CLOSE, jobsController.closeJob);
    router.post(paths.api.APP_JOB_COMPLETED, jobsController.completeJob);
    router.post(paths.api.APP_JOB_UNCOMPLETED, jobsController.uncompleteJob);

    router.get(paths.api.APP_JOB_IN_TIME, jobsController.getJobsInTime);
    router.get(paths.api.APP_JOB_ASSIGNED, jobsController.getAssignedJobs);

    router.get(paths.api.APP_JOBBERS, jobsController.getJobbers);
    router.post(paths.api.APP_RENTP_XML, fileParser(), jobsController.getRentpXML);
};
