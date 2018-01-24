// {app_root}/app/extend/oauth.js
'use strict';


module.exports = app => {
  class OauthModel {

    async getClient(clientId, clientSecret) {
      return null;
    }

    async getUser(jobnumber, password) {
      return null;
    }

    async getAccessToken(bearerToken) {
      return null;
    }

    async saveToken(token, client, user) {
      return null;
    }

    async revokeToken(token) {
      return null;
    }

    async getAuthorizationCode(authorizationCode) {
      return null;
    }

    async saveAuthorizationCode(code, client, user) {
      return null;
    }

    async revokeAuthorizationCode(code) {
      return null;
    }
  }

  return OauthModel;
};
