'use strict';

const OauthModel = require('egg-oauth-jwt').OauthModel;
const UUID = require('uuid/v1');

module.exports = class Model extends OauthModel {
    constructor(app) {
        super(app);
        this.redisAccessTokenKey = 'oauth:AccessToken:';
        this.redisCodeKey = 'oauth:authorization_code:';
        this.redsRefreshTokenKey = 'oauth:refresh_token:';
    }

    async getRoles(user, client, params) {
        return [];
    }

    async getAuths(user, client, params) {
        return [];
    }

    async createToken(client, user, scopes, params) {
        const accessToken = UUID().replace(/\-/g, '');
        const accessTokenKey = this.redisAccessTokenKey + accessToken;
        const refreshToken = UUID().replace(/\-/g, '');
        const refreshTokenKey = this.redsRefreshTokenKey + refreshToken;
        const accessTokenData = {
            createTime: Date.now(),
            client: client,
            user: user,
            scopes: scopes,
            type: 'access_token',
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
        const refreshTokenData = {
            createTime: Date.now(),
            client: client,
            user: user,
            scopes: scopes,
            type: 'refresh_token'
        };


        await this.app.redis
            .multi()
            .set(accessTokenKey, JSON.stringify(accessTokenData))
            .expire(accessTokenKey, this.accessTokenExpireIn / 1000)
            .set(refreshTokenKey, JSON.stringify(refreshTokenData))
            .expire(refreshTokenKey, this.refreshTokenExpireIn / 1000)
            .exec();
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expire_in: this.accessTokenExpireIn,
            token_type: this.tokenType
        }
    }

    async getAccessToken(bearerToken) {
        const accessTokenKey = this.redisAccessTokenKey + bearerToken;
        const data = await this.app.redis.get(accessTokenKey);
        if (!data) {
            return null;
        } else {
            try {
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
    }

    async getRefreshToken(refreshToken) {
        const refreshTokenKey = this.redsRefreshTokenKey + refreshToken;
        const data = await this.app.redis.get(refreshTokenKey);
        if (!data) {
            return null;
        } else {
            try {
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
    }

    async createAuthorizationCode(client, user, scopes, params) {
        const code = UUID().replace(/\-/g, '');
        const codeKey = this.redisCodeKey + code;
        const codeData = {
            createTime: Date.now(),
            client: client,
            user: user,
            scopes: scopes,
            type: 'code'
        };
        await this.app.redis
            .multi()
            .set(codeKey, JSON.stringify(codeData))
            .expire(codeKey, this.authorizationCodeLifeTime / 1000)
            .exec();
        return code;
    }

    async getAuthorizationCode(authorizationCode, params) {
        const codeKey = this.redisCodeKey + authorizationCode;
        const data = await this.app.redis.get(codeKey);
        if (!data) {
            return null;
        } else {
            try {
                await  this.app.redis.del(codeKey);
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
    }

    async removeToken(bearerToken, params) {
        await  super.removeToken(bearerToken, params);
        const token = await  this.getAccessToken(bearerToken, params);
        if (token === null || token === undefined) {
            return null;
        } else {
            const accessTokenKey = this.redisAccessTokenKey + token.accessToken;
            const refreshTokenKey = this.redsRefreshTokenKey + token.refreshToken;
            await this.app.redis
                .multi()
                .del(accessTokenKey)
                .del(refreshTokenKey)
                .exec();
        }
    }
};

