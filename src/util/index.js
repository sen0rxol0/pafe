const locales = require('./locales');
const { readFromFile } = require('./csv');
const uuid = require('./uuid');
const Logger = require('./logger');

module.exports = {
  log: Logger,
  getDefaultLocales() {
    return locales;
  },
  uuidGenerator() {
    return uuid()
  },
  readFromCSV: readFromFile
}
