module.exports = app => {

    const helmet = require('helmet');
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdnjs.cloudflare.com', 'unpkg.com', 'cdn.tailwindcss.com'],
                    styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
                    imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
                    connectSrc: ["'self'", "https://ackee.admin.savoietech.fr"],
                    fontSrc: ["'self'", 'cdnjs.cloudflare.com'],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            frameguard: {
                action: 'deny',
            },
            hidePoweredBy: true,
            xssFilter: true,
            referrerPolicy: {
                policy: 'strict-origin-when-cross-origin',
            },
            noSniff: true,
        })
    );
}