// utils/errorHandler.js

const fs = require('fs');
const moment = require('moment-timezone');

const errorHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const timestamp = moment().tz('Europe/Paris').format('DD-MM-YYYY HH:mm:ss');
    const errorLog = `[${timestamp}] ${error.stack}\n`;

    // Log to file
    fs.appendFile('error.log', errorLog, (err) => {
      if (err) console.error('Error writing to log file:', err);
    });

    // Log to stderr
    console.error(errorLog);

    // Send error response
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = errorHandler;
