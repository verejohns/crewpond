import { createSelector } from 'reselect';

const getIsSubmitting = state => state.payments.isSubmitting;
const getIsPaymentsLoaded = state => state.payments.isPaymentsLoaded;
const getPayments = state => state.payments.payments;
const getIsPaymentLoaded = state => state.payments.isPaymentLoaded;
const getPayment = state => state.payments.payment;
const getIsRefundedSubscritption = state => state.payments.isRefundedPayment;

export default createSelector([
  getIsSubmitting,
  getIsPaymentsLoaded,
  getPayments,
  getIsPaymentLoaded,
  getPayment,
  getIsRefundedSubscritption
], (isSubmitting, isPaymentsLoaded, payments, isPaymentLoaded, payment, isRefundedPayment) => ({
    isSubmitting,
    isPaymentsLoaded,
    payments,
    isPaymentLoaded,
    payment,
    isRefundedPayment
}));
