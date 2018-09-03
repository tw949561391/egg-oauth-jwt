'use strict';

const OauthError = require('./error/OauthError');
const TokenParser = require('./util/token-parser');
const Util = require('../util');

//-------------

const GRANT_TYPES = {
    authorization_code: 'authorization_code',
    password: 'password',
    client_credentials: 'client_credentials',
    refresh_token: 'refresh_token',
    implicit: 'implicit'
};


class OauthServer {
    constructor(initOptions) {
        this.options = initOptions.conf;
        this.logger = initOptions.logger;
        this.model = initOptions.model;
    }

    /**
     * 授权
     * @param request
     * @return {Promise<*>}
     */
    async token(request) {
        const params = Object.assign({}, request.params, request.query, request.body);
        if (this.logger) this.logger.info('OauthServer.token....');
        const grantType = params.grant_type;
        if (grantType === GRANT_TYPES.password) {
            return await this.passwordGrant(request);
        } else if (grantType === GRANT_TYPES.refresh_token) {
            return await this.refreshGrant(request);
        } else if (grantType === GRANT_TYPES.authorization_code) {
            return await this.authorizationCodeGrant(request);
        } else {
            throw new OauthError('GRANT_TYPE_NOT_SUPPORT', 401);
        }
    }


    async authorize(request) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const state = params.state || 0;
        const clientId = params.client_id;
        const scopes = params.scope;
        const response_type = params.response_type;
        const redirect_uri = params.redirect_uri;

        if (Util.isEmpty(clientId)) {
            throw new OauthError('"client_id" is required', 400);
        }
        if (Util.isEmpty(scopes)) {
            throw new OauthError('"scope" is required', 400);
        }
        if (Util.isEmpty(response_type)) {
            throw new OauthError('"response_type" is required', 400);
        }
        if (!Util.isUrl(redirect_uri)) {
            throw new OauthError('"redirect_uri" is required', 400);
        }
        const client = await this.model.getClient(clientId, null, GRANT_TYPES.authorization_code, params);
        if (client === null) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
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
     * @returns {Promise<void>}
     */
    async authorizeLogin(request) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const state = params.state || 0;
        const username = params.username;
        const password = params.password;
        const clientId = params.client_id;
        const scopes = params.scope;
        const redirect_uri = params.redirect_uri;

        if (Util.isEmpty(clientId)) {
            throw new OauthError('"client_id" is required', 400);
        }
        if (Util.isEmpty(scopes)) {
            throw new OauthError('"scope" is required', 400);
        }

        if (!Util.isUrl(redirect_uri)) {
            throw new OauthError('"redirect_uri" is required', 400);
        }

        const client = await this.model.getClient(clientId, null, GRANT_TYPES.authorization_code, params);
        if (!client) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }

        const isGrantTypeValidate = this.model.validateGrantType(GRANT_TYPES.authorization_code, client, params);

        if (!isGrantTypeValidate) {
            throw new OauthError('GRANT_TYPE_INVALIDATE', 401);
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


        const code = await this.model.createAuthorizationCode(client, user, scopes, params);
        return {
            client: client,
            user: user,
            state: state,
            redirectUri: redirect_uri,
            code: code
        };
    }

    /**
     *
     * @param request
     * @return {Promise<*>}
     */
    async authorizationCodeGrant(request) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const state = params.state || 0;
        const clientSecret = params.client_secret;
        const code = params.code;
        const codeData = await this.model.getAuthorizationCode(code);

        if (!codeData) {
            throw new OauthError('CODE_INVALIDATE', 401);
        }

        const client = await this.model.getClient(codeData.client.clientId, clientSecret, GRANT_TYPES.password, params);
        if (client === null) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }
        const user = codeData.user;

        if (user === null) {
            throw new OauthError('USER_INVALIDATE', 401);
        }
        user.auths = await this.model.getAuths(user, client, params);
        user.roles = await this.model.getRoles(user, client, params);

        const token = await this.model.createToken(client, user, codeData.scopes, params);
        return {
            token: token,
            state: state,
            user: user,
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
    async passwordGrant(request) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const username = params.username;
        const password = params.password;
        const scopes = params.scope;
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

        const user = await this.model.getUser(username, password, params);

        if (user === null) {
            throw new OauthError('USER_INVALIDATE', 401);
        }
        user.auths = await this.model.getAuths(user, client, params);
        user.roles = await this.model.getRoles(user, client, params);
        const token = await this.model.createToken(client, user, scopes, params) || {};
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
    async refreshGrant(request) {
        const params = Object.assign({}, request.params, request.query, request.body);
        const refreshToken = params.refresh_token;
        const state = params.state || 0;
        const clientId = params.client_id;
        const clientSecret = params.client_secret;
        let data = await this.model.getRefreshToken(refreshToken, params);

        if (!data) {
            throw new OauthError('TOKEN_ERROR', 401);
        }
        const client = await this.model.getClient(clientId, clientSecret, params);
        if (client === null || client.clientId !== data.client.clientId) {
            throw new OauthError('CLIENT_INVALIDATE', 401);
        }
        const user = data.user;

        if (user === null) {
            throw new OauthError('USER_INVALIDATE', 401);
        }
        user.auths = await this.model.getAuths(user, client, params);
        user.roles = await this.model.getRoles(user, client, params);

        const token = await this.model.createToken(client, user, data.scopes, params);
        return {
            token: token,
            state: state,
            user: user,
            client: client
        };
    }

    async logout(request) {
        const token = TokenParser.getToken(request, this.options.tokenType);
        if (token) {
            const params = Object.assign({}, request.params, request.query, request.body);
            await this.model.removeToken(token, params)
        }
    }

    /**
     * 验证权限，获取用户信息
     * @param request
     * @param scopes
     * @return {Promise<void>}
     */
    async auth(request, scopes) {
        const token = TokenParser.getToken(request, this.options.tokenType);
        return await this.getUseer(token);

    }


    async getUseer(token) {
        if (!token) {
            throw new OauthError('Unauthorized', 401);
        }
        const tokenData = await this.model.getAccessToken(token, scopes);
        if (!tokenData) {
            throw new OauthError('Unauthorized', 401);
        }
        return tokenData;
    }
};

module.exports = OauthServer;


