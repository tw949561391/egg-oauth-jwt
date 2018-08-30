// {app_root}/app/extend/oauth.js
'use strict';
const fs = require('fs');
const Jwt = require('jsonwebtoken');
const OauthModel = require('./default-model');


class JwtOauthModel extends OauthModel {
    constructor(app) {
        super(app);
        this.certPrimary = fs.readFileSync(app.config.oauthjwt.primaryKey);
        this.certPublic = fs.readFileSync(app.config.oauthjwt.publicKey);
        this.algorithm = app.config.oauthjwt.algorithm;
    }



    async createToken(client, user, scopes, params) {
        this.app.coreLogger.debug('createToken');
        return await new Promise((resolve) => {
            const accessTokenData = {
                createTime: Date.now(),
                client: client,
                user: user,
                scopes: scopes,
                type: 'access_token'
            };
            const refreshTokenData = {
                createTime: Date.now(),
                client: client,
                user: user,
                scopes: scopes,
                type: 'refresh_token'
            };
            const accessTokenOptions = {
                expiresIn: this.accessTokenExpireIn,
                algorithm: this.algorithm
            };

            const refreshTokenOptions = {
                expiresIn: this.refreshTokenExpireIn,
                algorithm: this.algorithm
            };
            const accessToken = Jwt.sign(accessTokenData, this.certPrimary, accessTokenOptions);
            const refreshToken = Jwt.sign(refreshTokenData, this.certPrimary, refreshTokenOptions);

            resolve({
                access_token: accessToken,
                refresh_token: refreshToken,
                expire_in: this.accessTokenExpireIn,
                token_type: this.tokenType
            });
        })
    }

    async getAccessToken(bearerToken) {
        this.app.coreLogger.debug('get access token:' + bearerToken);
        return await new Promise(resolve => {
            Jwt.verify(bearerToken, this.certPublic, (err, data) => {
                if (err) {
                    this.app.coreLogger.error(err.message);
                    resolve(null);
                } else if ('access_token' === data.type) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        });

    }

    async getRefreshToken(refreshToken) {
        this.app.coreLogger.debug('get refresh token:' + refreshToken);
        return await new Promise((resolve) => {
            Jwt.verify(refreshToken, this.certPublic, (err, data) => {
                if (err) {
                    this.app.coreLogger.error(err.message);
                    resolve(null);
                } else if ("refresh_token" === data.type) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async createAuthorizationCode(client, user, scopes, params) {
        this.app.coreLogger.debug('create code');
        return await new Promise((resolve) => {
            const codeData = {
                createTime: Date.now(),
                client: client,
                user: user,
                scopes: scopes,
                type: 'access_token'
            };

            const codeDataOptions = {
                expiresIn: this.authorizationCodeLifeTime,
                algorithm: this.algorithm
            };
            const code = Jwt.sign(codeData, this.certPrimary, codeDataOptions);
            resolve(code);
        })

    }


    async getAuthorizationCode(authorizationCode) {
        this.app.coreLogger.debug('get authorization_code:' + authorizationCode);
        return await new Promise((resolve) => {
            Jwt.verify(authorizationCode, this.certPublic, (err, data) => {
                if (err) {
                    this.app.coreLogger.error(err.message);
                    resolve(null);
                } else {
                    resolve(data);
                }
            });
        });
    }
};

module.exports = JwtOauthModel;

