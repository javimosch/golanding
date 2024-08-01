module.exports = app => {
    const cors = require('cors');
    // Middleware to enable CORS (allow all origins)
    app.use(cors(process.env.CORS || ""));
}