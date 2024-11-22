const { paths } = require('../../../../utils');
const { adminController } = require("../../../controllers");

module.exports = (router) => {
    router.get(paths.api.ADMIN_CARD_GRAPH, adminController.getCardGraph);
    router.get(paths.api.ADMIN_PAYMENT_GRAPH, adminController.getPaymentGraph);
    router.get(paths.api.ADMIN_CONTRACT_GRAPH, adminController.getContractGraph);
    router.get(paths.api.ADMIN_TOP_RATED_USERS, adminController.getTopRatedUsers);
    router.get(paths.api.ADMIN_USERS_INFO, adminController.getUsersInfo);
    router.get(paths.api.ADMIN_JOBS_INFO, adminController.getJobsInfo);
}
