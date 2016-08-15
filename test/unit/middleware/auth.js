/* globals Promise */
'use strict';

var expect = require('chai').expect;
var passport = require('passport');
var sinon = require('sinon');
var User = require('../../../models/user').User;

var auth = require('../../../middleware/auth');

describe('auth', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should load', function() {
    expect(auth).to.be.a('function');
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

    it('should create the user if they dont exist', function(done) {
      var callback = sinon.spy();
      var username = 'test-' + Date.now();
      passport.serializeUser({
        username: username,
        name: {}
      }, function() {
        callback(arguments[0], arguments[1]);

        sinon.assert.calledWith(callback, null, username);

        done();
      });
    });

    it('should handle an empty profile', function(done) {
      var callback = sinon.spy();

      passport.serializeUser({}, function() {
        callback(arguments[0], arguments[1]);

        sinon.assert.calledWith(callback,
          new Error('Failed to serialize user into session, undefined'));

        done();
      });
    });

    it('should handle db errors', function(done) {
      var callback = sinon.spy();

      var userFindStub = sandbox.stub(User, 'find');
      userFindStub.returns(Promise.reject(new Error('test-error')));

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

    it('should set up passport', function(done) {
      expect(passport.shutterstock._realm).to.equal(null);
      expect(passport.shutterstock.name).to.equal('shutterstock');
      expect(typeof passport.shutterstock._verify).to.equal('function');
      expect(passport.shutterstock._callbackURL).to.equal(
        'https://localhost:3000/v1/auth/login/shutterstock/callback');
      expect(passport.shutterstock._userProfileURL).to.equal(
        'https://api.shutterstock.com/v2/user');

      expect(passport.shutterstock._oauth2._authorizeUrl).to.equal(
        'https://api.shutterstock.com/v2/oauth/authorize');
      expect(passport.shutterstock._oauth2._accessTokenUrl).to.equal(
        'https://api.shutterstock.com/v2/oauth/access_token');
      expect(passport.shutterstock._oauth2._accessTokenName).to.equal('access_token');
      expect(passport.shutterstock._oauth2._authMethod).to.equal('Bearer');
      expect(passport.shutterstock._oauth2._useAuthorizationHeaderForGET).to.equal(true);

      expect(passport.shutterstock._scope).to.deep.equal([
        'licenses.create',
        'licenses.view',
        'purchases.view',
        'user.view'
      ]);

      expect(passport.shutterstock._trustProxy).to.be.undefined;
      expect(passport.shutterstock._passReqToCallback).to.be.undefined;
      expect(passport.shutterstock._skipUserProfile).to.be.false;

      var user = {
        username: 'test-abc'
      };

      passport.shutterstock._verify('2/abc', null, user, function(err, profile) {
        expect(profile).to.deep.equal({
          username: 'test-abc',
          token: '2/abc'
        });

        done();
      });
    });
  });
});
