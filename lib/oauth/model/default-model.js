// {app_root}/app/extend/oauth.js
'use strict';
const fs = require('fs');
const Jwt = require('jsonwebtoken');


class OauthModel {
    constructor(app) {
        this.app = app;
    }


    async getClient(clientId, clientSecret, grantType, params) {
        this.app.coreLogger.debug('getClient');
        return null;
    };

    async getUser(username, password, params) {
        this.app.coreLogger.debug('getUser');
        return null;
    }

    async validateScopes(requestScopes, client, params) {
        this.app.coreLogger.debug('validateScopes');
        return true;
    }


    async validateGrantType(requestGrantType, client, params) {
        this.app.coreLogger.debug('validateGrantType');
        return true;
    }

    async validateRedirectUri(redirectUri, client, params) {
        this.app.coreLogger.debug('validateRedirectUri');
        return true;
    }

    async createToken(client, user, scopes, params) {
        this.app.coreLogger.debug('createToken');
        return null;
    }

    async getAccessToken(bearerToken) {
        this.app.coreLogger.debug('get access token:' + bearerToken);
        return null;

    }

    async getRefreshToken(refreshToken) {
        this.app.coreLogger.debug('get refresh token:' + refreshToken);
        return null;
    }

    async createAuthorizationCode(client, user, scopes, params) {
        this.app.coreLogger.debug('createAuthorizationCode' + bearerToken);
        return null;
    }


    async getAuthorizationCode(authorizationCode) {
        this.app.coreLogger.debug('get authorization_code:' + authorizationCode);
        return null;
    }

    async getRoles(user, client) {
        this.app.coreLogger.debug('getRoles:');
        return [];
    }

    async getAuths(user, client) {
        this.app.coreLogger.debug('getAuth:');
        return [];
    }
};
module.exports = OauthModel;

