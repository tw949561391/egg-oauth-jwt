'use strict';

const AuthServer = require('./oauth/oauth-server');


class OAuth2 {
    constructor(config, model, logger) {
        const conf = {};
        conf.conf = config;
        conf.model = model;
        conf.logger = logger;
        this.server = new AuthServer(conf);
        this.logger = logger;
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
            ctx.oauthPrincple = await this.server.auth(ctx.request, scopes);
            await next();
        };
    }

    user() {
        return async (ctx, next) => {
            try {
                ctx.oauthPrincple = await this.server.auth(ctx.request);
            } catch (e) {
                this.logger.error(e.message)
            }
            await next();
        };
    }


}

module.exports = OAuth2;
