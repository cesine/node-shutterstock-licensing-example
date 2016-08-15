'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var passport = require('passport');

var license = require('./../../../routes/license');

describe('license', function() {
  var req;
  var res;
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    req = {
      user: {
        username: 'anoymous',
      },
      session: {
        token: 'abc123'
      },
      isAuthenticated: function() {
        return true;
      },
      params: {
        imageId: '123'
      },
      query: {
        subscriptionId: 456
      }
    };
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
      json: sinon.spy()
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should load', function() {
    expect(license).to.be.a('object');
    expect(license.router).to.be.a('function');
    expect(license.licenseImage).to.be.a('function');
  });

  it('should require a subscription', function(done) {
    delete req.query;
    req.url = '/v1/licenses/images/123';

    license.licenseImage(req, res, function(err) {
      expect(err.message).to.equal('Subscription ID is required');

      done();
    });
  });

  it('should license an image', function(done) {
    req.url = '/v1/licenses/images/123?subscriptionId=456';

    /*jshint camelcase: false */
    var data = {
      data: [{
        image_id: '123',
        download: {
          url: 'https://download/123.jpg'
        },
        allotment_charge: 0
      }]
    };
    /*jshint camelcase: true */

    var expectations = function(err) {
      expect(res.redirect.calledOnce).to.equal(false);
      expect(res.render.calledOnce).to.equal(false);
      expect(err).to.be.undefined;

      done(err);
    };

    res.json = function(license) {
      expect(license).to.deep.equal(data);

      expectations();
    };

    sinon.stub(passport.shutterstock._oauth2, '_request',
      function(method, url, headers, body, token, callback) {
        expect(method).to.equal('POST');
        expect(url).to.equal('https://api.shutterstock.com/v2/images/licenses?subscription_id=456');
        expect(headers).to.deep.equal({
          Authorization: 'Bearer abc123',
          'Content-Type': 'application/json'
        });
        expect(body).to.deep.equal(JSON.stringify({
          images: [{
            'image_id': '123',
          }]
        }));
        expect(typeof callback).to.equal('function');

        callback(null, JSON.stringify(data));
      });

    license.licenseImage(req, res, expectations);
  });

  it('should redirect to login if unauthenticated', function() {
    var next = sinon.spy();
    req.url = '/v1/licenses/images/123';
    req.isAuthenticated = function() {
      return false;
    };

    license.licenseImage(req, res, next);

    sinon.assert.calledWith(res.redirect,
      '/v1/auth/login/shutterstock?next=/v1/licenses/images/123');

    expect(next.calledOnce).to.equal(false);
    expect(res.json.calledOnce).to.equal(false);
    expect(res.render.calledOnce).to.equal(false);
  });

  it('should use the session.token to list licenses', function() {
    delete req.session.token;
    req.url = '/v1/licenses';

    license.list(req, res);

    sinon.assert.calledWith(res.redirect,
      '/v1/auth/login/shutterstock?next=/v1/licenses');
  });

  it('should list licenses', function(done) {
    req.url = '/v1/licenses';

    /*jshint camelcase: false */
    var data = {
      data: [{
        id: 'i876',
        user: {
          username: 'tester'
        },
        license: 'standard',
        subscription_id: 's456',
        download_time: '2016-03-02T22:56:37-05:00',
        image: {
          id: '123',
          format: {
            size: 'huge'
          }
        }
      }],
      page: 1,
      per_page: 20
    };
    /*jshint camelcase: true */

    var expectations = function(err) {
      expect(res.redirect.calledOnce).to.equal(false);
      expect(res.render.calledOnce).to.equal(false);
      expect(err).to.be.undefined;

      done(err);
    };

    res.json = function(license) {
      expect(license).to.deep.equal(data);

      expectations();
    };

    sinon.stub(passport.shutterstock._oauth2, 'get',
      function(url, token, callback) {
        expect(url).to.equal('https://api.shutterstock.com/v2/images/licenses');
        expect(token).to.equal('abc123');
        expect(typeof callback).to.equal('function');

        callback(null, JSON.stringify(data));
      });

    license.list(req, res, expectations);
  });
});
