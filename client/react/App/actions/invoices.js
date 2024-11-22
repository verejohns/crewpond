import { actions, paths } from '../../../../utils';

export default {
  createInvoice: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_INVOICE_REQUEST,
        actions.CREATE_INVOICE_SUCCESS,
        actions.CREATE_INVOICE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_INVOICE, postData)
    }
  }),

  getReceivedInvoices: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVOICES_REQUEST,
        actions.GET_INVOICES_SUCCESS,
        actions.GET_INVOICES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_INVOICES_RECEIVED, {params})
    }
  }),

  getAllReceivedInvoices: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVOICES_REQUEST,
        actions.GET_INVOICES_SUCCESS,
        actions.GET_INVOICES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_INVOICES_RECEIVED_ALL, {params})
    }
  }),

  getSentInvoices: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVOICES_REQUEST,
        actions.GET_INVOICES_SUCCESS,
        actions.GET_INVOICES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_INVOICES_SENT, {params})
    }
  }),

  getAllSentInvoices: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVOICES_REQUEST,
        actions.GET_INVOICES_SUCCESS,
        actions.GET_INVOICES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_INVOICES_SENT_ALL, {params})
    }
  }),

  getInvoiceById: (id, tz) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVOICE_REQUEST,
        actions.GET_INVOICE_SUCCESS,
        actions.GET_INVOICE_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_INVOICE_ID, id), {params: {tz}})
    }
  }),

  getLastInvoice: () => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LAST_INVOICE_REQUEST,
        actions.GET_LAST_INVOICE_SUCCESS,
        actions.GET_LAST_INVOICE_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_INVOICE_LAST)
    }
  }),
};
