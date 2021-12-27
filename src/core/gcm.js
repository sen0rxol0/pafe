const {
  strToUint8Array,
  hexToArrayBuffer,
  Uint8ArrayToStr,
  arrayBufferToHex
} = require('../util/common');

const ivLength = 12; // size of the IV in bytes
const TAG_LEN = 128; // size of the tag in bytes
const ALGO = 'AES-GCM';

/**
 * Encrypt plaindata using AES-GCM with supplied CryptoKey.
 *
 * @param   {String} plaindata data to be encrypted.
 * @param   {String} key CryptoKey to be used on encryption.
 * @returns {String} encrypted plaindata -> cipherdata.
 *
 * @example
 *   const cipherdata = await encrypt('my secret text', key);
 */
async function encrypt(plaindata, key) {
  const crypto = window.crypto,
    iv = crypto.getRandomValues(new Uint8Array(ivLength)), // 96-bit random initialisation vector
    params = { name: ALGO, iv, tagLength: TAG_LEN },
    cipherBuffer = await crypto.subtle.encrypt(
      params,
      key,
      strToUint8Array(plaindata)
    ),
    cipherBase64 = btoa(Uint8ArrayToStr(cipherBuffer)),
    ivHex = arrayBufferToHex(iv);
  return ivHex + cipherBase64;
}

/**
 * Decrypts cipherdata encrypted with encrypt() using supplied key.
 *
 * @param   {String} cipherdata - cipherdata to be decrypted.
 * @param   {String} key - CryptoKey for decryption of cipherdata.
 * @returns {String} Decrypted cipherdata.
 *
 * @example
 *   const plaindata = await decrypt(cipherdata, key);
 */
async function decrypt(cipherdata, key) {
  const crypto = window.crypto,
    iv = hexToArrayBuffer(cipherdata.slice(0, 24)),
    cipherBuffer = strToUint8Array(atob(cipherdata.slice(24))),
    params = { name: ALGO, iv, tagLength: TAG_LEN },
    plainBuffer = await crypto.subtle.decrypt(params, key, cipherBuffer),
    plaindata = Uint8ArrayToStr(plainBuffer);
  return plaindata;
}

module.exports = {
  encrypt,
  decrypt
}
