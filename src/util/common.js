const isUint8Array = (data) =>
  Uint8Array.prototype.isPrototypeOf(data);

// const encodeUTF8 = (arr) => {
//   const s = [];
//   for (let i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
//   return decodeURIComponent(escape(s.join('')));
// };

// const decodeUTF8 = (s) => {
//   const d = unescape(encodeURIComponent(s)),
//     b = new Uint8Array(d.length);
//   for (let i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
//   return b;
// };


/**
 * Convert an array of 8-bit integers to a string
 * @param {Uint8Array} bytes An array of 8-bit integers to convert
 * @returns {String} String representation of the array
 */
const Uint8ArrayToStr = (bytes) => {
  bytes = new Uint8Array(bytes);
  const result = [];
  const bs = 1 << 14;
  const j = bytes.length;
  for (let i = 0; i < j; i += bs) {
    result.push(
      String.fromCharCode.apply(
        String,
        bytes.subarray(i, i + bs < j ? i + bs : j)
      )
    );
  }
  return result.join('');
};

/**
 * Convert a string to an array of 8-bit integers
 * @param {String} str String to convert
 * @returns {Uint8Array} An array of 8-bit integers
 */
const strToUint8Array = (str) => {
  const result = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    result[i] = str.charCodeAt(i);
  }
  return result;
};

/**
 * Convert a Base-64 encoded string an array of 8-bit integer
 *
 * Note: accepts both Radix-64 and URL-safe strings
 * @param {String} base64 Base-64 encoded string to convert
 * @returns {Uint8Array} An array of 8-bit integers
 */
const b64ToUint8Array = (base64) => {
  return atob(base64.replace(/\-/g, '+').replace(/_/g, '/'));
  // return b64.decode(base64.replace(/\-/g, '+').replace(/_/g, '/'));
};

/**
 * Convert an array of 8-bit integer to a Base-64 encoded string
 * @param {Uint8Array} bytes An array of 8-bit integers to convert
 * @param {bool}       url   If true, output is URL-safe
 * @returns {String}          Base-64 encoded string
 */
const Uint8ArrayToB64 = (bytes) => {
  return btoa(Uint8ArrayToStr(bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  // return b64.encode(bytes, url).replace('\n', '');
};
/**
 * Convert a hex string to an array of 8-bit integers
 * @param {String} hex  A hex string to convert
 * @returns {Uint8Array} An array of 8-bit integers
 */
 const hexToArrayBuffer = (hexString) => {
  const arrayBuffer = new Uint8Array(hexString.length >> 1);
  for (let k = 0; k < hexString.length >> 1; k++) {
    arrayBuffer[k] = parseInt(hexString.substr(k << 1, 2), 16);
  }
  return arrayBuffer;
};

/**
 * Convert an array of bit integers to a hex string
 * @param bytes Array of bit integers to convert
 * @returns {String} Hexadecimal representation of the array
 */
const arrayBufferToHex = (bytes) => {
  const hexBytes = [];
  bytes = new Uint8Array(bytes);
  for (let i = 0; i < bytes.length; i++) {
    let byteString = bytes[i].toString(16);
    if (byteString.length < 2) byteString = '0' + byteString;
    hexBytes.push(byteString);
  }
  return hexBytes.join('');
};

exports.Uint8ArrayToStr = Uint8ArrayToStr;
exports.strToUint8Array = strToUint8Array;
exports.b64ToUint8Array = b64ToUint8Array;
exports.Uint8ArrayToB64 = Uint8ArrayToB64;
exports.hexToArrayBuffer = hexToArrayBuffer;
exports.arrayBufferToHex = arrayBufferToHex;
