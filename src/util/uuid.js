const crypto = require('crypto');
const { arrayBufferToHex } = require('./common.js');
/**
 * Returns a new universally unique identifier.
 *
 * UUID v4, generated using a cryptographically strong random number generator.
 */

// Annontation
// function b(
//   a                  // placeholder
// ){
//   return a           // if the placeholder was passed, return
//     ? (              // a random number from 0 to 15
//       a ^            // unless b is 8,
//       crypto.getRandomValues(new Uint8Array(1))[0]  // in which case
//       % 16           // a random number from
//       >> a/4         // 8 to 11
//       ).toString(16) // in hexadecimal
//     : (              // or otherwise a concatenated string:
//       [1e7] +        // 10000000 +
//       -1e3 +         // -1000 +
//       -4e3 +         // -4000 +
//       -8e3 +         // -80000000 +
//       -1e11          // -100000000000,
//       ).replace(     // replacing
//         /[018]/g,    // zeroes, ones, and eights with
//         b            // random hex digits
//       )
// }

// const uuid = a =>
//   a
//     ? (
//         a ^
//         ((crypto.getRandomValues(new Uint8Array(1))[0] % 16) >> (a / 4))
//       ).toString(16)
//     : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);

function uuid() {
  const rand = new Uint8Array(16);
  const bytes = crypto.randomBytes(rand.length);
  rand.set(bytes);
  rand[6] = (rand[6] & 0x0f) | 0x40;
  rand[8] = (rand[8] & 0x3f) | 0x80;
  const buff = arrayBufferToHex(rand);
  return [
    buff.substring(0, 8),
    buff.substring(8, 12),
    buff.substring(12, 16),
    buff.substring(16, 20),
    buff.substring(20, 32)
  ].join('-');
}
module.exports = uuid;
