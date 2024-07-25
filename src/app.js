const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const moment = require('moment-timezone');
moment.locale('Europe/Paris')
require('dotenv').config();

require('./utils/debug.js')

const app = express();

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

const rateLimit = require('express-rate-limit');
const todoApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 20 requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


app.use('/api', todoApiLimiter)

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

const cors = require('cors');
// Middleware to enable CORS (allow all origins)
app.use(cors(process.env.CORS || ""));

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

const frenchkiss = require('frenchkiss');
const en = require('./locales/en.json');
const fr = require('./locales/fr.json');
frenchkiss.set('en', en);
frenchkiss.set('fr', fr);
// Middleware to set language based on query parameter or default to 'en'
app.use((req, res, next) => {
    const lang = req.query.lang || 'en';
    res.locals.lang = lang;
    res.locals.t = (key) => frenchkiss.t(key, {}, lang);
    next();
});


const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Serve static files from the client's dist directory
app.use('/dist', express.static(path.join(process.cwd(), 'client', 'dist')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'todo_boilerplate',
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    const lang = res.locals.lang;
    const localeData = lang === 'fr' ? fr : en;
    res.render('index', { localeData: JSON.stringify(localeData), lang });
});

app.use('/api/todos', require('./routes/todo-routes'));

// Start server
app.listen(PORT, () => {
    require('./schedules/logRotator')
    console.log(`Server running on port ${PORT}`);
});
