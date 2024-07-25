// logRotator.js

const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
fs.ensureDirSync(LOG_DIR);

const rotateLog = async (logFile) => {
  try {
    const stats = await fs.stat(logFile);
    if (stats.size >= MAX_LOG_SIZE) {
      const ext = path.extname(logFile);
      const baseName = path.basename(logFile, ext);
      const date = moment().format('YYYY-MM-DD');
      const newName = `${baseName}-${date}${ext}`;
      const newPath = path.join(LOG_DIR, newName);

      await fs.move(logFile, newPath);
      console.log(`Rotated ${logFile} to ${newPath}`);

      // Create a new empty log file
      await fs.writeFile(logFile, '');
    }
  } catch (error) {
    console.error(`Error rotating ${logFile}:`, error);
  }
};

// Schedule the cron job to run every 6 hours
cron.schedule(process.env.LOG_ROTATOR_CRON_STRING||'0 */6 * * *', async () => {
  console.log('Running log rotation...');
  await rotateLog(path.join(process.cwd(), 'error.log'));
  await rotateLog(path.join(process.cwd(), 'debug.log'));
  await rotateLog(path.join(process.cwd()
  , 'access.log'));
});

console.log('Log rotation scheduler started');
