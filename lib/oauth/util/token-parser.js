function getTokenFromHeader(request, tokenType) {
    let accessToken = request.get('Authorization');
    if (accessToken === null) {
        return null;
    }
    if (accessToken.trim().length === 0) {
        return null;
    }
    let match = new RegExp(`${tokenType}\\s(\\S+)`);
    let matches = accessToken.match(match);
    if (!matches) {
        return null;
    } else {
        return matches[1]
    }
};


function getTokenFromBody(request) {
    return request.body.access_token || request.body.accessToken;
};


module.exports.getToken = function (request, tokenType) {
    let accessToken = getTokenFromHeader(request, tokenType);
    if (!accessToken) {
        accessToken = getTokenFromBody(request);
    }
    return accessToken;
};



