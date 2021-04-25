const locales = require('./locales');
const { readFromFile } = require('./csv');
const uuid = require('./uuid');
const Logger = require('./logger');

module.exports = {
  log: Logger,
  logType: Logger.Type,
  getDefaultLocales() {
    return locales;
  },
  uuidGenerator() {
    return uuid()
  },
  readFromCSV: readFromFile
}
