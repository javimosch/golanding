// utils/debug.js

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const DEBUG_LEVEL = parseInt(process.env.DEBUG_LEVEL) || 0;
const DEBUG_SCOPES = (process.env.DEBUG_SCOPES || '').split(',').map(scope => scope.trim());

console.log({
  DEBUG_SCOPES,
  DEBUG_LEVEL
})

const debug = (message, level = 1, scope = 'other') => {
  if (DEBUG_LEVEL >= level && (DEBUG_SCOPES.includes('*') || DEBUG_SCOPES.includes(scope))) {
    const timestamp = moment().tz('Europe/Paris').format('DD-MM-YYYY HH:mm:ss');
    const logMessage = `[${timestamp}] [${scope}] [Level ${level}]: ${message}\n`;

    fs.appendFile(path.join(process.cwd(), 'debug.log'), logMessage, (err) => {
      if (err) console.error('Error writing to debug log:', err);
    });

    console.log(logMessage);
  }
};

// Replace console.debug with the custom debug function
console.debug = (message, level = 1, scope = 'other') => {
  debug(message, level, scope);
};

module.exports = debug;
