const { appendFileSync } = require('fs');
const { join } = require('path');
function Logger(message, type, logsPath) {
  if (logsPath) {
    Logger.logsPath = logsPath;
    return;
  }
  let log = '\n';
  switch (type) {
    case Logger.Type.LOG:
      log += `[LOG]: ${message}`;
      break;
    case Logger.Type.INFO:
      log += `[INFO]: ${message}`;
      break;
    case Logger.Type.WARN:
      log += `[WARN]: ${message}`;
      break;
    case Logger.Type.ERROR:
      log += `[ERROR]: ${message}`;
      break;
    default:
      break;
  }
  appendFileSync(join(Logger.logsPath, 'logger.log'), log, 'utf8');
}
Logger.logsPath = null;
Logger.Type = {
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
}
module.exports = Logger;
