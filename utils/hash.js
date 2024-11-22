const crypto = require('crypto');

const PRIVATE_KEY = '6F6D6E692E7369676E65742E7574696C';

module.exports.authentication = (token, userId) => crypto.createHmac('sha256', [token, userId].join('/')).update(PRIVATE_KEY).digest('hex').toLowerCase();

module.exports.generateOTP = () => {
  let digits = '0123456789';
  let OTP = '';
  for(let i = 0; i < 6; i += 1) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

module.exports.password = (token, password) => crypto.createHmac('sha256', [token, password].join('/')).update(PRIVATE_KEY).digest('hex').toUpperCase();

module.exports.idToKey = (id) => {
  try {
    const iv = Buffer.from('');
    const key = Buffer.from(PRIVATE_KEY, 'hex');
    const cipher = crypto.createCipheriv('aes-128-ecb', key, iv);

    const chunks = [];
    chunks.push(cipher.update(Buffer.from(id.toString(), 'utf8'), 'buffer', 'hex'));
    chunks.push(cipher.final('hex'));

    return chunks.join('').toUpperCase();
  } catch (e) {
    return false;
  }
};

module.exports.keyToId = (key) => {
  try {
    const keyBuffer = Buffer.from(PRIVATE_KEY, 'hex');
    const phraseBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from('');
    const decipher = crypto.createDecipheriv('aes-128-ecb', keyBuffer, ivBuffer);

    let dec = decipher.update(phraseBuffer, 'buffer', 'utf8');
    dec += decipher.final('utf8');

    return dec;
  } catch (e) {
    return false;
  }
};
