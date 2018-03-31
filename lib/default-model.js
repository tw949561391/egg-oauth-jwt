// {app_root}/app/extend/oauth.js
'use strict';


module.exports = app => {
    //-----
    const certPrimary = `-----BEGIN RSA PRIVATE KEY-----\n${app.config.oauthJwt.primaryKey}\n-----END RSA PRIVATE KEY-----`;
    //---
    const certPublic = `-----BEGIN CERTIFICATE-----\n${app.config.oauthJwt.publicKey}\n-----END CERTIFICATE-----`;
    //---
    const algorithm = app.config.oauthJwt.algorithm || 'RS256';
    //--
    const accessTokenExpireIn = app.config.oauthJwt.accessTokenLifeTime;
    const refreshTokenExpireIn = app.config.oauthJwt.refreshTokenLifeTime;

    return class OauthModel {
        async createToken(client, user, scopes, params) {
            app.coreLogger.debug('createToken');
            return new Promise((resolve) => {
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
                    expiresIn: accessTokenExpireIn * 1000,
                    algorithm: algorithm
                };

                const refreshTokenOptions = {
                    expiresIn: refreshTokenExpireIn * 1000,
                    algorithm: algorithm
                };
                const accessToken = app.Jwt.sign(accessTokenData, certPrimary, accessTokenOptions);
                const refreshToken = app.Jwt.sign(refreshTokenData, certPrimary, refreshTokenOptions);

                resolve({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
            })
        }

        async getAccessToken(bearerToken) {
            app.coreLogger.debug('get access token:' + bearerToken);
            return new Promise(resolve => {
                app.Jwt.verify(bearerToken, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
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
            app.coreLogger.debug('get refresh token:' + refreshToken);
            return new Promise((resolve) => {
                app.Jwt.verify(refreshToken, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
                        resolve(null);
                    } else if ("refresh_token" === data.type) {
                        resolve(data);
                    } else {
                        resolve(null);
                    }
                });
            });
        }


    }
};



