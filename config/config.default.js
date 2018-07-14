'use strict';
const path = require('path');

/**
 * egg-oauth-jwt default config
 * @member Config#oauthJwt
 * @property {String} SOME_KEY - some description
 */
exports.oauthJwt = {
    extend: 'oauth',
    algorithm: 'RS256',
    primaryKey: path.join(__dirname, "private.pem"),
    publicKey: path.join(__dirname, 'public.pem'),
    clientSide: false,
    accessTokenLifeTime: 7200,
    refreshTokenLifeTime: 864000,
    authorizationCodeLifeTime: 120,
    tokenType: 'Bearer'
};