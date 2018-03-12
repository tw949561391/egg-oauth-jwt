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
        async createToken(client, user, scopes, params) {
            app.coreLogger.debug('createToken');
            return new Promise((resolve, reject) => {
                const data = {
                    createTime: Date.now(),
                    client: client,
                    user: user,
                    scopes: scopes
                };
                const accessToken = app.Jwt.sign(data, certPrimary, {algorithm: algorithm});
                const refreshToken = app.Jwt.sign(data, certPrimary, {algorithm: algorithm});
                const res = {
                    access_token: accessToken,
                    refresh_token: refreshToken
                };
                resolve(res);
            })
        }

        async getAccessToken(bearerToken) {
            app.coreLogger.debug('get accesstoken:' + bearerToken);
            return new Promise(resolve => {
                app.Jwt.verify(bearerToken, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
                        resolve(null);
                    } else {
                        resolve(data);
                    }
                });
            });

        }

        async getRefreshToken(refreshToken, params) {
            app.coreLogger.debug('get accesstoken:' + refreshToken);
            return new Promise((resolve) => {
                app.Jwt.verify(refreshToken, certPublic, function (err, data) {
                    if (err) {
                        app.coreLogger.error(err.message);
                        resolve(null);
                    } else {
                        resolve(data);
                    }
                });
            });
        }


    }
};



