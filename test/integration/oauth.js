'use strict';

var mocha = require('mocha');
var expect = require('chai').expect;
var nock = require('nock');
var url = require('url');
var supertest = require('supertest');

var app = require('./../../');

describe('oauth', function() {
  var nockApiAuthorizationRequest;
  var nockApiTokenRequest;
  var nockApiUserDetails;

  beforeEach(function() {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');

    nockApiTokenRequest = nock('https://api.shutterstock.com')
      .filteringRequestBody(/.*/, '*')
      .post('/v2/oauth/access_token')
      .reply(200, {
        access_token: 'v2/zxy',
        token_type: 'Bearer'
      });

    nockApiUserDetails = nock('https://api.shutterstock.com')
      .get('/v2/user')
      .reply(200, {
        username: 'tester',
        customer_id: '1234',
        id: '1231234567890'
      });
  });

  after(function() {
    nock.enableNetConnect();
  });

  describe('authorization', function() {
    it('should implement authorization flow', function(done) {
      supertest(app)
        .get('/v1/auth/login/shutterstock')
        .expect(302)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var tokenUrl = url.parse(res.headers.location);
          var cookie = res.headers['set-cookie'].join(' ')
          var query = {};

          expect(tokenUrl).to.be.defined;

          // Get the state
          tokenUrl.query.split('&').map(function(item) {
            var parts = item.split('=');
            query[parts[0]] = parts[1];
          });

          // Simmulate a callback from api authorize
          supertest(app)
            .get('/v1/auth/login/shutterstock/callback?code=ABC&state=' + query.state)
            .set('set-cookie', cookie)
            .expect(302)
            .end(function(err, res) {
              if (err) {
                throw err;
              }

              expect(res.headers['set-cookie'][0]).not.to.equal(cookie);
              expect(res.headers.location).to.equal('/');

              nockApiTokenRequest.done();
              nockApiUserDetails.done();

              done();
            });
        });
    });
  });

  describe('access tokens', function() {
    it.skip('should implement token flow', function(done) {
      supertest(app)
        .get('/v1/auth/login/shutterstock/callback?code=ABC&state=987')
        .expect(302)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          expect(res.headers['set-cookie'][0]).to.be.defined;
          expect(res.headers.location).to.equal('/v1/auth/login');

          done();
        });
    });
  });
});
