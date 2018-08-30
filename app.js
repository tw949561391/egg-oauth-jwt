'use strict';

const path = require('path');
const OAuth2ServerBuilder = require('./lib/server');

module.exports = app => {
    app.coreLogger.info('[egg-oauth-jwt] init begin');
    const config = app.config.oauthjwt;
    const extendModelFileName = config.extend || 'oauth';
    let modalPath = path.join(app.config.baseDir, `app/extend/${extendModelFileName}.js`);
    try {
        let Model = null;
        try {
            Model = require(modalPath);
        } catch (e) {
            app.coreLogger.info(`[egg-oauth-jwt] no extend at  "app/extend/${extendModelFileName}"`);
            Model = require('./index').JwtOauthModel;
        }
        const model = new Model(app);
        app.oauthjwt = new OAuth2ServerBuilder(config, model, app.coreLogger);
        app.coreLogger.info('[egg-oauth-jwt] init success');
    } catch (e) {
        app.coreLogger.error(`no extend model at app/extend/${extendModelFileName}.js`)
    }
};
