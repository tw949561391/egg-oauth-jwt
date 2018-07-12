'use strict';

const OauthError = require('./error/OauthError');
const TokenParser = require('./AccessTokenParser');
const Util = require('../util');

//-------------

const Authorization_Code = 'authorization_code';
const Password = 'password';
const Client_Credentials = 'client_credentials';
const Refresh_Token = 'refresh_token';
const Implicit = 'implicit';

class OauthServer {
    constructor(initOptions) {
        this.options = initOptions.oauth;
        this.logger = initOptions.logger;
        this.model = initOptions.model;
    }

    /**
     * 授权
     * @param request
     * @return {Promise<*>}
     */
    async token(request, ctx) {
        const params = Object.assign({}, request.params, request.query, request.body);
        if (this.options.clientSide) {
            throw new OauthError(500, 'CLIENT_SIDE_ONLY');
        }
        if (this.logger) this.logger.info('OauthServer.token:开始登陆....');
        const grantType = params.grant_type;
        if (grantType === 'password') {
            return await this.passwordGrant(request, ctx);
        } else if (grantType === 'refresh_token') {
            return await this.refreshGrant(request, ctx);
        } else if (grantType === 'authorization_code') {
            return await this.authorizationCodeGrant(request, ctx);
        } else {
            throw new OauthError('GRANT_TYPE_NOT_SUPPORT', 401);
        }
    }


    async authorize(request, ctx) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const state = params.state || 0;
        const clientId = params.client_id;
        const scopes = params.scopes;
        const response_type = params.response_type;
        const redirect_uri = params.redirect_uri;

        if (Util.isEmpty(clientId)) {
            throw new OauthError('"client_id" is required', 400);
        }
        if (Util.isEmpty(scopes)) {
            throw new OauthError('"scopes" is required', 400);
        }
        if (Util.isEmpty(response_type)) {
            throw new OauthError('"response_type" is required', 400);
        }
        if (!Util.isUrl(redirect_uri)) {
            throw new OauthError('"redirect_uri" is required', 400);
        }
        const client = await this.model.getClient(clientId, null, 'authorization_code', params);
        if (client == null) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }

        const isGrantTypeValidate = this.model.validateGrantType(Authorization_Code, client, params);

        if (!isGrantTypeValidate) {
            throw new OauthError('GRANT_TYPE_INVALIDATE', 401);
        }
        const isScopeValidate = this.model.validateScopes(scopes, client, params);
        if (!isScopeValidate) {
            throw new OauthError('SCOPE_INVALIDATE', 401);
        }

        return {
            client: client,
            state: state,
            redirectUri: redirect_uri,
            responseType: response_type,
            scopes: scopes
        };
    }


    /**
     * 登陆获取code
     * @param request
     * @param ctx
     * @returns {Promise<void>}
     */
    async authorizeLogin(request, ctx) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const state = params.state || 0;
        const username = params.username;
        const password = params.password;
        const clientId = params.client_id;
        const scopes = params.scopes;
        const redirect_uri = params.redirect_uri;

        if (Util.isEmpty(clientId)) {
            throw new OauthError('"client_id" is required', 400);
        }
        if (Util.isEmpty(scopes)) {
            throw new OauthError('"scopes" is required', 400);
        }

        if (!Util.isUrl(redirect_uri)) {
            throw new OauthError('"redirect_uri" is required', 400);
        }

        const client = await this.model.getClient(clientId, null, 'authorization_code', params);
        if (!client) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }

        if (!this.model.validateScopes(scopes, client, params)) {
            throw new OauthError('SCOPE_INVALIDATE', 401);
        }

        if (!await this.model.validateRedirectUri(redirect_uri, client, params)) {
            throw new OauthError('REDIRECT_URI_INVALIDATE', 401);
        }

        const user = await this.model.getUser(username, password, params);
        if (user === null || user === undefined) {
            throw new OauthError('USER_INVALIDATE', 401);
        }

        try {
            const code = await this.model.createAuthorizationCode(client, user, scopes, params);
            return {
                client: client,
                user: user,
                state: state,
                redirectUri: redirect_uri,
                code: code
            }
        } catch (error) {
            this.logger.error(error.message);
            if (error.name === 'TokenExpiredError') {
                throw new OauthError('CODE_EXPIRE', 401);
            }
            throw error;
        }

    }

    /**
     *
     * @param request
     * @param ctx
     * @return {Promise<*>}
     */
    async authorizationCodeGrant(request, ctx) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const state = params.state || 0;
        const clientSecret = params.client_secret;
        const code = params.code;
        const codeData = await this.model.getAuthorizationCode(code);
        if (!codeData) {
            throw new OauthError('CODE_ERROR', 401);
        }

        const client = await this.model.getClient(codeData.client.clientId, clientSecret, Authorization_Code, params);
        if (client === null) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }
        const token = await this.model.createToken(codeData.client, codeData.user, code.scopes, params);
        return {
            token: token,
            state: state,
            user: codeData.user,
            client: client
        };
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
        const params = Object.assign({}, request.params, request.query, request.body);
        const username = params.username;
        const password = params.password;
        const scopes = params.scopes;
        const state = params.state || 0;
        const clientId = params.client_id;
        const clientSecret = params.client_secret;

        const client = await this.model.getClient(clientId, clientSecret, 'password', params);


        if (client == null) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }
        const isScope = await this.model.validateScopes(scopes, client);

        if (!isScope) {
            throw new OauthError('SCOPE_INVALIDATE', 401);
        }

        const user = await this.model.getUser(username, password, params, ctx);

        if (user === null) {
            throw new OauthError('USER_INVALIDATE', 401);
        }

        const token = await this.model.createToken(client, user, scopes, params, ctx) || {};
        return {
            token: token,
            state: state,
            user: user,
            client: client
        };
    }

    /**
     * 刷新令牌
     * @param request
     * @return {Promise<*|{}>}
     */
    async refreshGrant(request, ctx) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const refreshToken = params.refresh_token;
        const state = params.state || 0;
        const clientId = params.client_id;
        const clientSecret = params.client_secret;
        let data = null;
        try {
            data = await this.model.getRefreshToken(refreshToken, params, ctx);
        } catch (error) {
            this.logger.error(error);
            if (error.name === 'TokenExpiredError') {
                throw new OauthError('TOKEN_EXPIRE', 401);
            }
        }
        if (!data) {
            throw new OauthError('TOKEN_ERROR', 401);
        }
        const client = await this.model.getClient(clientId, clientSecret, params, ctx);
        if (client === null || client.clientId !== data.client.clientId) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }
        const token = await this.model.createToken(client, data.user, data.scopes, params, ctx);
        return {
            token: token,
            state: state,
            user: data.user,
            client: client
        };
    }


    /**
     * 验证权限，获取用户信息
     * @param request
     * @param scopes
     * @return {Promise<void>}
     */
    async auth(request, scopes, ctx) {
        const token = TokenParser.getToken(request, this.options.tokenType);
        if (!token || token.length === 0) {
            throw new OauthError('NO_TOKEN', 401);
        }
        try {
            return await this.model.getAccessToken(token, scopes);
        } catch (error) {
            this.logger.error(error);
            if (error.name === 'TokenExpiredError') {
                throw new OauthError('TOKEN_EXPIRE', 401);
            }
            throw error;
        }

    }
};

module.exports = OauthServer;


