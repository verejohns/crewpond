const { paths } = require('../../../../utils');
const {contractController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_CONTRACTS, contractController.createContract);
    router.post(paths.api.APP_CONTRACTS_TEST, contractController.createContractTest);
    router.get(paths.api.APP_CONTRACTS, contractController.getContracts);

    router.get(paths.api.APP_CONTRACT_ID, contractController.getContractById);
    router.post(paths.api.APP_CLOSE_CONTRACT, contractController.closeContract);
    router.post(paths.api.APP_ARCHIVE_CONTRACT, contractController.archiveContract);
    router.post(paths.api.APP_CLOSE_CONTRACT_ALL, contractController.closeContractAll);
    router.post(paths.api.APP_CLOSE_CONTRACT_ALL_TEST, contractController.closeContractAllTest);
    router.post(paths.api.APP_ARCHIVE_CONTRACT_ALL, contractController.archiveContractAll);

    router.post(paths.api.APP_ADD_SCHEDULE_TO_CONTRACT, contractController.addScheduleToContract);
    router.post(paths.api.APP_REMOVE_SCHEDULE_FROM_CONTRACT, contractController.removeScheduleFromContract);

    router.get(paths.api.APP_ARCHIVED_CONTRACTS, contractController.getArchivedContracts);
    router.get(paths.api.APP_CONTRACT_BY_JOBBER, contractController.getContractByJobber);
    router.get(paths.api.APP_CONTRACT_JOBBERS, contractController.findContractJobbers);
};
