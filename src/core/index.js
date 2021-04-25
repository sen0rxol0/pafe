const PassGenerator = require('./PassGenerator');
const Storage = require('./storage');

class PafeDatastore {
  constructor(webContents) {
    this.webContents = webContents;
  }

  encryptData(plain, key) {
    return new Promise((resolve, reject) => {
      this.webContents.executeJavaScript(`
        window.cryptoAPI.pbkdf2.extractKey("${key}").then(decodedKey => {
          return window.cryptoAPI.gcm.encrypt("${plain}", decodedKey).then(encrypted => encrypted);
        });
      `).then(resolve);
    });
  }

  decryptData(encrypted, key) {
    return new Promise((resolve, reject) => {
      this.webContents.executeJavaScript(`
        window.cryptoAPI.pbkdf2.extractKey("${key}").then(decodedKey => {
          return window.cryptoAPI.gcm.decrypt("${encrypted}", decodedKey).then(plain => plain);
        });
      `).then(resolve);;
    });
  }

  verifyCrendentials(key, passphrase) {
    return new Promise((resolve, reject) => {
      this.webContents.executeJavaScript(`
        window.cryptoAPI.pbkdf2.verifyKey("${key}", "${passphrase}").then(isValid => isValid);
      `).then(resolve);
    });
  }

  deriveMasterKey(passphrase) {
    return new Promise((resolve, reject) => {
      this.webContents.executeJavaScript(`
        window.cryptoAPI.pbkdf2.deriveKey("${passphrase}").then(encodedKey => encodedKey);
      `).then(resolve);
    });
  }

  generatePassphrase(length = 12, type = 'alphanum') {
    return PassGenerator.alphaNumeric(length);
  }
}

// class PafeCredentials {
//
// }

module.exports = {
  Datastore: PafeDatastore,
  Storage,
}
