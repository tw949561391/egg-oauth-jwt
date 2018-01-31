'use strict';

const path = require('path');
const OAuth2Server = require('./lib/server');
const Jwt = require('jsonwebtoken');
const util = require('util');

module.exports = app => {
    app.coreLogger.info('[egg-oauth-jwt] init begin');
    app.Jwt = Jwt;
    const config = app.config.oauthJwt;
    const extendModelFileName = config.extend || 'oauth';
    const BaseModel = app.loader.loadFile(path.join(__dirname, './lib/default-model.js'));
    let Model = app.loader.loadFile(path.join(app.config.baseDir, `app/extend/${extendModelFileName}.js`));
    if (Model) {
        util.inherits(Model, BaseModel);
    } else {
        Model = BaseModel;
    }
    try {
        const model = new Model(app);
        app.oauthJwt = new OAuth2Server(config, model);
        app.coreLogger.info('[egg-oauth-jwt] init success');
    } catch (e) {
        app.coreLogger.error('[egg-oauth-jwt] init error, %s', e.message);
    }
};
