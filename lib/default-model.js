// {app_root}/app/extend/oauth.js
'use strict';


module.exports = class OauthModel {
    constructor(app) {
        this.app = app;
        this.certPrimary = `-----BEGIN RSA PRIVATE KEY-----\n${this.app.config.oauthJwt.primaryKey}\n-----END RSA PRIVATE KEY-----`;
        this.certPublic = `-----BEGIN CERTIFICATE-----\n${this.app.config.oauthJwt.publicKey}\n-----END CERTIFICATE-----`;
        this.algorithm = this.app.config.oauthJwt.algorithm || 'RS256';
        this.accessTokenExpireIn = this.app.config.oauthJwt.accessTokenLifeTime;
        this.refreshTokenExpireIn = this.app.config.oauthJwt.refreshTokenLifeTime;
    }


    async getClient(clientId, clientSecret, grantType, params) {
        this.app.coreLogger.debug('getClient');
        return null;
    };

    async getUser(username, password, params) {
        this.app.coreLogger.debug('getUser');
        return null;
    }

    async validateScopes(requestScopes, client, params) {
        return true;
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
                expiresIn: this.accessTokenExpireIn * 1000,
                algorithm: this.algorithm
            };

            const refreshTokenOptions = {
                expiresIn: this.refreshTokenExpireIn * 1000,
                algorithm: this.algorithm
            };
            const accessToken = this.app.Jwt.sign(accessTokenData, this.certPrimary, accessTokenOptions);
            const refreshToken = this.app.Jwt.sign(refreshTokenData, this.certPrimary, refreshTokenOptions);

            resolve({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        })
    }

    async getAccessToken(bearerToken) {
        this.app.coreLogger.debug('get access token:' + bearerToken);
        return await new Promise(resolve => {
            this.app.Jwt.verify(bearerToken, this.certPublic, (err, data) => {
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
            this.app.Jwt.verify(refreshToken, this.certPublic, (err, data) => {
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

    async createAuthorizationCode(authorizationCode) {

    }


    async getAuthorizationCode(authorizationCode) {
        this.app.coreLogger.debug('get authorization_code:' + authorizationCode);
        return await new Promise((resolve) => {
            this.app.Jwt.verify(authorizationCode, this.certPublic, (err, data) => {
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



