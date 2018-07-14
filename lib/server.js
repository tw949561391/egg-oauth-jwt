'use strict';

const AuthServer = require('./oauth/OauthServer');
const OauthError = require('./oauth/error/OauthError');


class OAuth2 {
    constructor(config, model, logger) {
        const conf = {};
        conf.conf = config;
        conf.model = model;
        conf.logger = logger;
        this.server = new AuthServer(conf);
    }

    /**
     * 获取token插件
     * @param {object} options
     */
    token() {
        return async (ctx, next) => {
            ctx.oauthData = await this.server.token(ctx.request);
            await next();
        };
    }

    authorize() {
        return async (ctx, next) => {
            ctx.oauthData = await this.server.authorize(ctx.request);
            await next();
        };
    }

    authorizeCode() {
        return async (ctx, next) => {
            ctx.oauthData = await this.server.authorizeLogin(ctx.request);
            await next();
        };
    }


    /**
     *
     * @param {string} scopes
     * @param {object} options
     */
    auth(...scopes) {
        return async (ctx, next) => {
            const princple = await this.server.auth(ctx.request, scopes);
            if (princple) {
                ctx.princple = princple;
                ctx.user = princple.user;
            } else {
                throw new OauthError('UN_AUTH', 401);
            }
            await next();
        };
    }
}

module.exports = OAuth2;
