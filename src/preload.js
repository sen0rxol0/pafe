const { pbkdf2, verifyRaw, extractKey } = require('./core/pbkdf2');
const { encrypt, decrypt } = require('./core/gcm');

window.cryptoAPI = {
  pbkdf2: { deriveKey: pbkdf2, verifyKey: verifyRaw, extractKey },
  gcm: { encrypt, decrypt }
};
