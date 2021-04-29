const { appendFileSync } = require('fs');
const { join } = require('path');
function Logger(message, type, logsPath = null) {
  if (logsPath !== null) {
    Logger.path = logsPath;
  }
  let log = '\n';
  switch (type) {
    case Logger.LOG:
      log += `[LOG]: ${message}`;
      break;
    case Logger.INFO:
      log += `[INFO]: ${message}`;
      break;
    case Logger.WARN:
      log += `[WARN]: ${message}`;
      break;
    case Logger.ERROR:
      log += `[ERROR]: ${message}`;
      break;
    default:
      break;
  }
  appendFileSync(join(Logger.path, 'logger.log'), log, 'utf8');
}
Logger.path = null;
Object.assign(Logger, {
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
});
module.exports = Logger;
