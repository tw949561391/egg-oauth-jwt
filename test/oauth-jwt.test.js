'use strict';

const mock = require('egg-mock');

describe('test/oauth-jwt.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/oauth-jwt-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, oauthJwt')
      .expect(200);
  });
});
