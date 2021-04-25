/**
 * Random password generator.
 * Copyright (c) 2018, Walter B. Varela
 */
module.exports = class PassGenerator {
  static ascii_lowercase = 'abcdefghijklmnopqrstuvwxyz';
  static ascii_uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static digits = '0123456789';
  static symbols = '!"#$%^&@*\'()+_,-.`{|}[\\]:;/?<=>~';
  // static similarCharacters = /[ilLI|`oO0]/g;
  // static strictRules = [
  //   { name: 'ascii_lowercase', rule: /[a-z]/ },
  //   { name: 'ascii_uppercase', rule: /[A-Z]/ },
  //   { name: 'digits', rule: /[0-9]/ },
  //   { name: 'symbols', rule: /[!"#$%^&@*\'()+_-={|}[\\\]:;/?.><,`~]/ }
  // ];

  /**
   *
   * @param {Array} charset
   * @param {Integer} length
   * @returns {String} randomizedCharacters
   */
  static genCharacters(charset, length) {
    const charsetLen = charset.length;
    if (!charsetLen) return false;
    const maxByte = 256 - 256 % charsetLen;
    const random = this.randomBytes(Math.ceil(length * 256 / maxByte));
    const chars = [];
    while (length > 0) {
      for (let i = 0; i < random.length && length > 0; i++) {
        const randomByte = random[i];
        if (randomByte < maxByte) {
          chars.push(charset[randomByte % charsetLen]);
          length--;
        }
      }
    }
    return chars.join('');
  }

  /**
   *
   * @param {Integer} length
   */
  static ascii(length = 16) {
    const chars = [this.ascii_uppercase, this.ascii_lowercase, this.symbols, this.digits];
    return this.genCharacters(chars, length);
  }

  /**
   *
   * @param {Integer} length
   */
  static alphaNumeric(length = 16) {
    const alphanum = [this.ascii_uppercase, this.ascii_lowercase, this.digits];
    return this.genCharacters(alphanum, length);
  }

  /**
   *
   * @param {Integer} length
   */
  static hex(length = 16) {
    const hexChars = [this.digits, this.ascii_uppercase.slice(0, 6)];
    return this.genCharacters(hexChars, length);
  }

  /**
   * Retrieve secure random byte array of the specified length
   * @param {Integer} length Length in bytes to generate
   * @returns {Uint8Array} Random byte array
   */
  static randomBytes(length) {
    const buf = new Uint8Array(length);
    // window.crypto.getRandomValues(buf);
    const bytes = require('crypto').randomBytes(buf.length);
    buf.set(bytes);
    return buf;
  }
}
