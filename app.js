'use strict';

const path = require('path');
const OAuth2ServerBuilder = require('./lib/server');
const Jwt = require('jsonwebtoken');

module.exports = app => {
    app.coreLogger.info('[egg-oauth-jwt] init begin');
    app.Jwt = Jwt;
    const config = app.config.oauthJwt;
    const extendModelFileName = config.extend || 'oauth';
    let Model = require(path.join(app.config.baseDir, `app/extend/${extendModelFileName}.js`));
    const model = new Model(app);
    app.oauthJwt = new OAuth2ServerBuilder(config, model, app.logger);
    app.coreLogger.info('[egg-oauth-jwt] init success');
};
