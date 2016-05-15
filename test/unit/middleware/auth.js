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
    beforeEach(function(done) {
      passport.serializeUser({
        username: 'test-anonymouse',
        name: {
          givenName: 'Anony',
          familyName: 'Mouse'
        },
        language: 'zh'
      }, done);
    });

    it('should serialize to username', function(done) {
      var callback = sinon.spy();

      passport.serializeUser({
        username: 'test-abc',
        name: {}
      }, function() {
        callback(arguments[0], arguments[1]);

        sinon.assert.calledWith(callback, null, 'test-abc');

        done();
      });
    });

    it('should deserialize an existing user', function(done) {
      var callback = sinon.spy();

      passport.deserializeUser('test-anonymouse', function(err, user) {
        callback(err, user);

        sinon.assert.calledWith(callback, null, {
          createdAt: user.createdAt,
          givenName: 'Anony',
          id: user.id,
          language: 'zh',
          updatedAt: user.updatedAt,
          username: 'test-anonymouse'
        });

        done();
      });
    });

    it('should return null if user not found', function(done) {
      var callback = sinon.spy();

      passport.deserializeUser('test-nonexistant-user', function() {
        callback(arguments[0], arguments[1]);

        sinon.assert.calledWith(callback, null, false);

        done();
      });
    });

    it('should update a user', function(done) {
      passport.serializeUser({
        username: 'test-anonymouse',
        name: {
          givenName: 'Albert',
          familyName: 'Mouse'
        },
        language: 'ko'
      }, function() {
        passport.deserializeUser('test-anonymouse', function(err, user) {
          expect(user.username).to.equal('test-anonymouse');
          expect(user.language).to.equal('ko');
          expect(user.givenName).to.equal('Albert');

          done();
        });
      });
    });
  });
});
