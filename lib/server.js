'use strict';

const AuthServer = require('./oauth/OauthServer');
const OauthError = require('./oauth/error/OauthError');


class OAuth2 {
    constructor(config, model, logger) {
        let conf = config.oauth;
        conf.model = model;
        conf.logger = logger;
        this.server = new AuthServer(Object.assign(config.oauth, {
            model: model,
        }));
    }

    /**
     * 获取token插件
     * @param {object} options
     */
    token() {
        const _this = this;
        return async (ctx, next) => {
            ctx.token = await _this.server.token(ctx.request,ctx);
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
            const princple = await _this.server.auth(ctx.request,ctx);
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
