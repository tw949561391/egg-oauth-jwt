const OauthError = require('./error/OauthError');


function getTokenFromHeader(request, tokenType) {
    let accessToken = request.get('Authorization');
    let match = /Bearer\s(\S+)/;
    if ('Mac' === tokenType) {
        match = /Mac\s(\S+)/;
    }
    let matches = accessToken.match(match);
    if (!matches) {
        return null;
    } else {
        return matches[1]
    }
};


function getTokenFromBody(request) {
    return request.body.access_token;
};


module.exports.getToken = function (request, tokenType) {
    let accessToken = getTokenFromHeader(request, tokenType);
    if (!accessToken) {
        accessToken = getTokenFromBody(request);
    }
    return accessToken;
};



