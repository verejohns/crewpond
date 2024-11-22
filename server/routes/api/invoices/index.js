const { paths } = require('../../../../utils');
const {invoiceController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_INVOICE, invoiceController.createInvoice);
    router.put(paths.api.APP_INVOICE_ID, invoiceController.updateInvoice);
    router.delete(paths.api.APP_INVOICE_ID, invoiceController.deleteInvoice);
    router.get(paths.api.APP_INVOICES_CONTRACT, invoiceController.getContractInvoices);
    router.get(paths.api.APP_INVOICES_JOB, invoiceController.getJobInvoices);
    router.get(paths.api.APP_INVOICES_RECEIVED, invoiceController.getReceivedInvoices);
    router.get(paths.api.APP_INVOICES_RECEIVED_ALL, invoiceController.getAllReceivedInvoices);
    router.get(paths.api.APP_INVOICES_SENT, invoiceController.getSentInvoices);
    router.get(paths.api.APP_INVOICES_SENT_ALL, invoiceController.getAllSentInvoices);
    router.get(paths.api.APP_INVOICE_ID, invoiceController.getInvoiceById);
    router.get(paths.api.APP_INVOICE_LAST, invoiceController.getLastInvoice);
    router.get(paths.api.APP_INVOICE_DOWNLOAD, invoiceController.downloadFile);
};
