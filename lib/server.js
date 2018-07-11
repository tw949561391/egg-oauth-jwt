'use strict';

const AuthServer = require('./oauth/OauthServer');
const OauthError = require('./oauth/error/OauthError');


class OAuth2 {
    constructor(config, model, logger) {
        const conf = {};
        conf.oauth = config.oauth;
        conf.model = model;
        conf.logger = logger;
        this.server = new AuthServer(conf);
    }

    /**
     * 获取token插件
     * @param {object} options
     */
    token() {
        const _this = this;
        return async (ctx, next) => {
            ctx.oauthData = await _this.server.token(ctx.request, ctx);
            await next();
        };
    }

    authorize() {
        return async (ctx, next) => {
            ctx.oauthData = await this.server.authorize(ctx.request, ctx);
            await next();
        };
    }

    authorizeCode() {
        return async (ctx, next) => {
            ctx.oauthData = await this.server.authorizeLogin(ctx.request, ctx);
            await next();
        };
    }


    /**
     *
     * @param {string} scopes
     * @param {object} options
     */
    auth(scopes, required = true) {
        const _this = this;
        return async (ctx, next) => {
            const princple = await _this.server.auth(ctx.request, ctx);
            if (princple) {
                ctx.princple = princple;
                ctx.user = princple.user;
            } else {
                if (required) {
                    throw new OauthError('UN_AUTH', 401);
                }
            }
            await next();
        };
    }
}

module.exports = OAuth2;
