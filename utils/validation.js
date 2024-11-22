const { trim } = require('lodash');
const Payment = require('payment');

module.exports.isEmpty = value => !trim(value);
module.exports.isValidEmail = value => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
module.exports.isValidName = value => /^[a-zA-Z]+$/.test(value);
module.exports.isNumber = value => {
  console.log(value)
  if(value.length === 0) {
    return false
  }else if(value.match(/^-{0,1}\d+$/)){
    //valid integer (positive or negative)
    return true;
  }else if(value.match(/^\d+\.\d+$/)){
    //valid float
    return true;
  }else{
    //not valid number
    return false;
  }
}

module.exports.isDate = date => {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}


function clearNumber(value = '') {
  return value.replace(/\D+/g, '');
}

module.exports.formatCreditCardNumber = (value) => {
  if (!value) {
    return value;
  }

  const issuer = Payment.fns.cardType(value);
  const clearValue = clearNumber(value);
  let nextValue;

  switch (issuer) {
    case 'amex':
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10,
      )} ${clearValue.slice(10, 15)}`;
      break;
    case 'dinersclub':
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10,
      )} ${clearValue.slice(10, 14)}`;
      break;
    default:
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        8,
      )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 19)}`;
      break;
  }

  return nextValue.trim();
}

module.exports.formatCVC = (value, prevValue, allValues = {}) => {
  const clearValue = clearNumber(value);
  let maxLength = 4;

  if (allValues.number) {
    const issuer = Payment.fns.cardType(allValues.number);
    maxLength = issuer === 'amex' ? 4 : 3;
  }

  return clearValue.slice(0, maxLength);
}

module.exports.formatExpirationDate = (value) => {
  const clearValue = clearNumber(value);
  if (clearValue.length >= 3) {
    return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
  }

  return clearValue;
}

module.exports.formatFormData = (data) => {
  return Object.keys(data).map(d => `${d}: ${data[d]}`);
}