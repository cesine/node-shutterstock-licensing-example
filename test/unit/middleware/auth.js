'use strict';

var expect = require('chai').expect;
var passport = require('passport');
var sinon = require('sinon');

var auth = require('./../../../middleware/auth');

describe('auth', function() {
  it('should load', function() {
    expect(auth).to.be.a('function');
  });

  it('should set authenticated false', function(done) {
    var req = {};

    auth(req, null, function() {
      expect(req.authenticated).to.be.false;

      done();
    });
  });

  describe('passport', function() {
    it('should serialize to username', function() {
      var done = sinon.spy();

      passport.serializeUser({
        username: 'abc'
      }, done);

      sinon.assert.calledWith(done, null, 'abc');
    });

    it('should deserialize from username', function() {
      var done = sinon.spy();

      passport.deserializeUser('efg', done);

      sinon.assert.calledWith(done, null, {
        username: 'efg'
      });
    });
  });
});
