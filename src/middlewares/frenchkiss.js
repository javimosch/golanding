module.exports = app => {
    const frenchkiss = require('frenchkiss');
    const en = require('../locales/en.json');
    const fr = require('../locales/fr.json');
    frenchkiss.set('en', en);
    frenchkiss.set('fr', fr);
    // Middleware to set language based on query parameter or default to 'en'
    app.use((req, res, next) => {
        const lang = req.query.lang || 'en';
        res.locals.lang = lang;
        res.locals.t = (key) => frenchkiss.t(key, {}, lang);
        next();
    });

    global.localeData = {
        en,fr
    }
}