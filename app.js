'use strict';

const path = require('path');
const OAuth2ServerBuilder = require('./lib/server');
const fs = require('fs');

module.exports = app => {
    app.coreLogger.info('[egg-oauth-jwt] init begin');
    const config = app.config.oauthjwt;
    const extendModelFileName = config.extend || 'oauth';
    let modalPath = path.join(app.config.baseDir, `app/extend/${extendModelFileName}`);

    try {
        const Model = require(modalPath);
        const model = new Model(app);
        app.oauthjwt = new OAuth2ServerBuilder(config, model, app.coreLogger);
        app.coreLogger.info('[egg-oauth-jwt] init success');
    } catch (e) {
        app.coreLogger.error(`no extend model at app/extend/${extendModelFileName}.js`)
    }
};
