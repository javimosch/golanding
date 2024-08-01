const express = require('express');
const path = require('path');
require('dotenv').config();
require('./utils/debug.js')
const app = express();

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(process.cwd(), 'client', 'dist')));
app.set('view engine', 'ejs');

require('./globals/injectGlobals')(require('path').join(__dirname, 'globals'));
global.loadModelsSync(require('path').join(__dirname, 'models'));
global.loadRoutesSync(app,'middlewares');
global.loadRoutesSync(app);

const PORT = process.env.PORT || 3000;

// Routes
app.get('/', (req, res) => {
    const lang = res.locals.lang;
    const localeData = lang === 'fr' ? global.localeData.fr : global.localeData.en;
    res.render('index', { localeData: JSON.stringify(localeData), lang });
});

// Start server
app.listen(PORT, () => {
    require('./schedules/logRotator')
    console.log(`Server running on port http://localhost:${PORT}`);
});
