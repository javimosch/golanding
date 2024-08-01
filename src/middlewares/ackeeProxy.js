module.exports = app => {
    if (process.env.ACKEE_SERVER) {
        const { createProxyMiddleware } = require('http-proxy-middleware');
        // Set up proxy for Ackee API
        app.use('/ackee', createProxyMiddleware({
            target: process.env.ACKEE_SERVER,//'https://ackee.admin.savoietech.fr',
            changeOrigin: true,
            /*pathRewrite: {
              '^/ackee': '/api', // rewrite path
            },*/
        }));
    }
}