module.exports = class OauthError extends Error {
    constructor(message, code, obj) {
        super(message);
        this.code = code;
        this.info = obj;
    }
};