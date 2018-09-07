module.exports = class OauthError extends Error {
    constructor(message, code, obj) {
        super(message);
        this.statusCode = code;
        this.info = obj;
    }
};