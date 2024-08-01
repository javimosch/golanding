module.exports = app => {
    // Apply compression in production mode
    const compression = require('compression');
    // Custom compression filter
    function shouldCompress(req, res) {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }

    // Apply compression in production mode
    if (process.env.NODE_ENV === 'production') {
        console.debug('Using compression', 2, 'core')
        app.use(compression({
            level: 9, // max compression
            filter: shouldCompress
        }));
    }
}