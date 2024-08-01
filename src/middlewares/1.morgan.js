module.exports = app => {
    const path = require('path');
    const moment = require('moment-timezone');
    moment.locale('Europe/Paris')
    const morgan = require('morgan');
    // Create a custom Morgan token for compression status
    morgan.token('compression', (req, res) => {
        return res.getHeader('Content-Encoding') || 'none';
    });
    // Middleware to log HTTP requests with custom timestamp
    morgan.token('date', (req, res, tz) => {
        return moment().tz(tz).format('DD-MM-YYYY HH:mm:ss');
    });
    const fs = require('fs');
    app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :compression - [:date[Europe/Paris]]', {
        stream: fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' })
    }));
}