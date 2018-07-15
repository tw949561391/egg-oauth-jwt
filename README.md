# egg-oauth-jwt

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-oauth-jwt.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-oauth-jwt
[travis-image]: https://img.shields.io/travis/eggjs/egg-oauth-jwt.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-oauth-jwt
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-oauth-jwt.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-oauth-jwt?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-oauth-jwt.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-oauth-jwt
[snyk-image]: https://snyk.io/test/npm/egg-oauth-jwt/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-oauth-jwt
[download-image]: https://img.shields.io/npm/dm/egg-oauth-jwt.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-oauth-jwt

<!--
Description here.
-->

## Install

```bash
$ npm i egg-oauth-jwt --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.oauthjwt = {
  enable: true,
  package: 'egg-oauth-jwt',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.oauthjwt = {
    extend: 'oauth',
    algorithm: 'RS256',
    primaryKey: path.join(__dirname, "private.pem"),
    publicKey: path.join(__dirname, 'public.pem'),
    clientSide: false,
    accessTokenLifeTime: 7200,
    refreshTokenLifeTime: 864000,
    authorizationCodeLifeTime: 120,
    tokenType: 'Bearer'
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
