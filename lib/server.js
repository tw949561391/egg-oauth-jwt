'use strict';

const AuthServer = require('oauth2-server');
const Request = require('oauth2-server').Request;
const Response = require('oauth2-server').Response;


class OAuth2 {
  constructor(config, model) {
    this.server = new AuthServer(Object.assign(config, {
      model
    }));
  }

  /**
   * 获取token插件
   * @param {object} options
   */
  token(options = {}) {
    const _this = this;
    return async(ctx, next) => {
      const request = new Request(ctx.request);
      const response = new Response(ctx.request);
      ctx.token = await _this.server.token(request, response, options);
      await next();
    };
  }

  /**
   * 获取authorizeCode
   * @param {string} options 
   */
  authorize(options = {}) {
    const _this = this;
    return async(ctx, next) => {

      options = Object.assign(options, {
        authenticateHandler: {
          async handle(req) {
            const {
              username,
              password
            } = req.body;
            const user = await _this.server.options.model.getUser(
              username,
              password
            );
            return user;
          },
        },
      });

      const request = new Request(ctx.request);
      const response = new Response(ctx.request);
      ctx.authorizeCode = await _this.server.authorize(request, response, options);
      await next();
    };
  }

  /**
   *
   * @param {string} scopes
   * @param {object} options
   */
  authenticate(scopes, options = {}) {
    const _this = this;
    options.scope = scopes;
    return async(ctx, next) => {
      const request = new Request(ctx.request);
      const response = new Response(ctx.request);
      ctx.princple = await _this.server.authenticate(request, response, options);
      await next();
    };
  }

}

module.exports = OAuth2;