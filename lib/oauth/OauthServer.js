const OauthError = require('./error/OauthError');
const TokenParser = require('./AccessTokenParser');
//-------------


module.exports = class OauthServer {
    constructor(initOptions) {
        this.options = initOptions.oauth;
        this.logger = initOptions.logger;
        this.model = initOptions.model;
    }


    /**
     * 授权
     * @param request
     * @returns {Promise<*>}
     */
    async token(request, ctx) {
        if (this.options.clientSide) {
            throw new OauthError(500, "CLIENT_SIDE_ONLY");
        }
        if (this.logger) this.logger.info('OauthServer.token:开始登陆....');
        if ("POST" !== request.method.toUpperCase()) {
            throw new OauthError("NOT_POST", 401);
        }
        const grantType = request.body.grant_type;
        if ("password" === grantType) {
            return await this.passwordGrant(request, ctx);
        } else if ('refresh_token' === grantType) {
            return await this.refreshGrant(request, ctx);
        } else if ('authorization_code' === grantType) {
            return await this.authorizationCodeGrant(request, ctx);
        } else {
            throw new OauthError("GRANT_TYPE_NOT_SUPPORT", 401)
        }
    }


    async authorize(request, ctx) {
        return await this.authorizePreGrant(request, ctx);
    }

    /**
     * 验证权限，获取用户信息
     * @param request
     * @param scopes
     * @returns {Promise<void>}
     */
    async auth(request, scopes, ctx) {
        const token = TokenParser.getToken(request, this.options.tokenType);
        if (!token || token.length === 0) {
            throw new OauthError('NO_TOKEN', 401);
        }
        let data = null;
        try {
            data = await this.model.getAccessToken(token, scopes, ctx);
        } catch (error) {
            this.logger.error(error);
            if ("TokenExpiredError" === error.name) {
                throw new OauthError("TOKEN_EXPIRE", 401);
            }
        }
        if (data === null) {
            throw new OauthError('UN_AUTH', 401);
        }
        return data;
    }

    /**
     * 密码授权方式
     * @param request
     * @returns {Promise<*>}
     */
    //
    // {
    //     access_token:'',
    //     expire_in:3600,
    //     refresh_token:'',
    //     token_type:'Bear/Mac'
    // }
    async passwordGrant(request, ctx) {
        const username = request.body.username;
        const password = request.body.password;
        const scopes = request.body.scopes;
        const status = request.body.status || 0;
        const clientId = request.body.client_id;
        const clientSecret = request.body.client_secret;
        const params = request.body;

        const client = await this.model.getClient(clientId, clientSecret, 'password', params);

        if (client == null) {
            throw new OauthError("NO_CLIENT", 401);
        }
        const isScope = await this.model.validateScopes(scopes, client);

        if (!isScope) {
            throw new OauthError("SCOPE_INVALIDATE", 401);
        }

        const user = await this.model.getUser(username, password, params, ctx);

        if (user === null) {
            throw new OauthError("NO_USER", 401);
        }

        const token = await this.model.createToken(client, user, scopes, params, ctx) || {};
        token.expire_in = this.options.accessTokenLifeTime;
        token.token_type = this.options.tokenType;
        token.status = status;
        return token;
    }

    /**
     * 刷新令牌
     * @param request
     * @returns {Promise<*|{}>}
     */
    async refreshGrant(request, ctx) {
        const refreshToken = request.body.refresh_token;
        const status = request.body.status || 0;
        const clientId = request.body.client_id;
        const clientSecret = request.body.client_secret;
        const params = request.body;
        let data = null;
        try {
            data = await this.model.getRefreshToken(refreshToken, params, ctx);
        } catch (error) {
            this.logger.error(error);
            if ("TokenExpiredError" === error.name) {
                throw new OauthError("TOKEN_EXPIRE", 401);
            }
        }
        if (!data) {
            throw new OauthError('TOKEN_ERROR', 401);
        }
        const client = await this.model.getClient(clientId, clientSecret, params, ctx);
        if (client === null) {
            throw new OauthError("NO_CLIENT", 401);
        }
        const token = await this.model.createToken(client, data.user, data.scopes, params, ctx);
        token.expire_in = this.options.accessTokenLifeTime;
        token.token_type = this.options.tokenType;
        token.status = status;
        return token;
    }


    async authorizePreGrant(request, ctx) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const status = params.status || 0;
        const clientId = params.client_id;
        const scopes = params.scopes;
        const client = await this.model.getClient(clientId, null, "authorization_code", params)
        if (client == null) {
            throw new OauthError("NO_CLIENT", 401);
        }
        const isScope = await this.model.validateScopes(scopes, client);

        if (!isScope) {
            throw new OauthError("SCOPE_INVALIDATE", 401);
        }
        return client;
    }


    async authorizeLogin(request, ctx) {


    }

    /**
     *
     * @param request
     * @param ctx
     * @returns {Promise<*>}
     */
    async authorizationCodeGrant(request, ctx) {
        const status = request.body.status || 0;
        const clientId = request.body.client_id;
        const clientSecret = request.body.client_secret;
        const code = request.body.code;
        const paramsAll = request.body;
        const codeData = await this.model.getAuthorizationCode(code);
        if (!codeData) {
            throw new OauthError("CODE_ERROR", 401);
        }

        if (codeData.client.clientId !== clientId) {
            throw new OauthError("CLIENT_INVALIDATE", 401);
        }

        let client = await this.model.getClient(clientId, clientSecret, 'authorization_code', paramsAll);
        if (client === null || client === undefined) {
            throw new OauthError("CLIENT_INVALIDATE", 401);
        }

        const token = await this.model.createToken(codeData.client, codeData.user, code.scopes, paramsAll);
        token.expire_in = this.options.accessTokenLifeTime;
        token.token_type = this.options.tokenType;
        token.status = status;
        return token;
    }

};


