const { paths } = require('../../../../utils');
const {paymentController} = require("../../../controllers");

module.exports = (router) => {
    router.get(paths.api.APP_PAYMENT, paymentController.findPayments);
    router.post(paths.api.APP_PAYMENT, paymentController.createPayment);

    router.post(paths.api.APP_GIVE_REFUND, paymentController.refundPayment);

    router.post(paths.api.APP_GET_KEY_CUSTOMER, paymentController.createKeyCustomer);

    router.get(paths.api.APP_GET_BANK_ACCOUNTS, paymentController.getAllBankAccounts);
    router.get(paths.api.APP_VERIFY_USER_ACCOUNT, paymentController.verifyUserAccount);
    router.get(paths.api.APP_CHECK_ACCOUNT_VERIFIED, paymentController.checkAccountVerified);
    
    router.get(paths.api.APP_CARDS, paymentController.getAllCards);

    router.post(paths.api.APP_CREATE_BANK_ACCOUNT, paymentController.createBankAccount);
    router.post(paths.api.APP_CARDS, paymentController.createCard);

    router.put(paths.api.APP_CARDS_BY_ID, paymentController.updateCard);

    router.delete(paths.api.APP_CARDS_BY_ID, paymentController.deleteCard);

    router.delete(paths.api.APP_PAYMENT_BY_ID, paymentController.deleteBank);
    
    router.put(paths.api.APP_PAYMENT_UPDATE_BY_ID, paymentController.updateBank);

    router.post(paths.api.APP_STRIPE_WEBHOOK, paymentController.getStripWebhook);

    router.get(paths.api.ADMIN_PAYMENT_HISTORY, paymentController.getPaymentsList);

    router.post(paths.api.APP_PAYOUT_EXTRA_USER, paymentController.payoutExtraUser);
};
