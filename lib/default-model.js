// {app_root}/app/extend/oauth.js
'use strict';

module.exports = app => {
    //-----
    const certPrimary =
        `${app.config.oauthJwt.primaryKeyBefore}
${app.config.oauthJwt.primaryKey}
${app.config.oauthJwt.primaryKeyAfter}`;
    //---
    const certPublic =
        `${app.config.oauthJwt.publicKeyBefore}
${app.config.oauthJwt.publicKey}
${app.config.oauthJwt.publicKeyAfter}`;
    //---
    const algorithm = app.config.oauthJwt.algorithm;


    return class OauthModel {
        async saveToken(token, client, user) {
            app.coreLogger.debug('savetoken');
            return new Promise(resolve => {
                const data = {
                    token: token,
                    client: client,
                    user: user
                };
                const accessToken = app.Jwt.sign(data, certPrimary, {algorithm: algorithm});
                const refreshToken = app.Jwt.sign(data, certPrimary, {algorithm: algorithm});
                const accessTokenExpiresAt = token.accessTokenExpiresAt;
                const refreshTokenExpiresAt = token.refreshTokenExpiresAt;
                const res = {
                    accessToken: accessToken,
                    accessTokenExpiresAt: accessTokenExpiresAt,
                    refreshToken: refreshToken,
                    refreshTokenExpiresAt: refreshTokenExpiresAt,
                    client: client,
                    user: user
                };
                resolve(res);
            })
        }

        async revokeToken(token) {
            app.coreLogger.debug("revokeToken:" + token);
            return true;
        }

        async getAccessToken(bearerToken) {
            app.coreLogger.debug('get accesstoken:' + bearerToken);
            return new Promise(resolve => {
                app.Jwt.verify(bearerToken, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
                        resolve();
                    } else {
                        const res = {
                            accessToken: bearerToken,
                            accessTokenExpiresAt: new Date(data.token.accessTokenExpiresAt),
                            scope: data.token.scope,
                            client: data.client,
                            user: data.user
                        };
                        resolve(res);
                    }
                });
            });

        }

        async getRefreshToken(refreshToken) {
            app.coreLogger.debug('get accesstoken:' + bearerToken);
            return new Promise(resolve => {
                app.Jwt.verify(bearerToken, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
                        resolve();
                    } else {
                        const res = {
                            refreshToken: refreshToken,
                            refreshTokenExpiresAt: new Date(data.token.refreshTokenExpiresAt),
                            scope: data.token.scope,
                            client: data.client,
                            user: data.user
                        };
                        resolve(res);
                    }
                });
            });
        }

        async saveAuthorizationCode(code, client, user) {
            app.coreLogger.debug('saveAuthorizationCode');
            return new Promise(resolve => {
                const data = {
                    token: code,
                    client: client,
                    user: user
                };
                const authorizationCode = app.Jwt.sign(data, certPrimary, {algorithm: algorithm});
                const res = {
                    authorizationCode: authorizationCode,
                    expiresAt: code.expiresAt,
                    redirectUri: code.redirectUri,
                    scope: code.scope,
                    client: client,
                    user: user
                };
                resolve(res);
            });
        }

        async revokeAuthorizationCode(code) {
            app.coreLogger.debug('revokeAuthorizationCode')
            return true;
        }

        async getAuthorizationCode(authorizationCode) {
            app.coreLogger.debug('getAuthorizationCode:' + authorizationCode);
            return new Promise(resolve => {
                app.Jwt.verify(authorizationCode, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
                        resolve();
                    } else {
                        const res = {
                            code: authorizationCode,
                            expiresAt: new Date(data.code.expiresAt),
                            redirectUri: data.code.redirectUri,
                            scope: data.code.scope,
                            client: data.client,
                            user: data.user
                        };
                        resolve(res);
                    }
                });
            });
        }
    }
};



