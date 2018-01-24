'use strict';

const path = require('path');
const OAuth2Server = require('./lib/server');

module.exports = app => {
  app.coreLogger.info('[egg-oauth-jwt] init begin');

  const config = app.config.oauthJwt;
  const extendModelFileName = config.extend || 'oauth';
  let Model = app.loader.loadFile(path.join(app.config.baseDir, `app/extend/${extendModelFileName}.js`));

  if (Model === null) {
    Model = app.loader.loadFile('./lib/default-model.js');
    app.coreLogger.warn('[egg-oauth-jwt]  use default oauthModel');
  }
  try {
    app.oauthJwt = new OAuth2Server(config, new Model(app));
    app.coreLogger.info('[egg-oauth-jwt] init success');
  } catch (e) {
    app.coreLogger.error('[egg-oauth-jwt] init error, %s', e.message);
  }
};
