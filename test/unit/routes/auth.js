'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var passport = require('passport');

var auth = require('./../../../routes/auth');

describe('auth', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should load', function() {
    expect(auth).to.be.a('object');
    expect(auth.router).to.be.a('function');
    expect(auth.getLogin).to.be.a('function');
    expect(auth.getLogout).to.be.a('function');
    expect(auth.getShutterstock).to.be.a('function');
    expect(auth.getShutterstockCallback).to.be.a('function');
  });

  describe('logout', function() {
    it('should logout', function() {
      var req = {
        logout: sinon.spy()
      };
      var res = {
        send: sinon.spy(),
        redirect: sinon.spy()
      };

      auth.getLogout(req, res);

      expect(req.logout.calledOnce).to.equal(true);
      sinon.assert.calledWith(res.redirect, '/');

      expect(res.send.calledOnce).to.equal(false);
    });

    it('should logout and redirect', function() {
      var req = {
        query: {
          next: '/foo'
        },
        logout: sinon.spy()
      };
      var res = {
        send: sinon.spy(),
        redirect: sinon.spy()
      };

      auth.getLogout(req, res);

      expect(req.logout.calledOnce).to.equal(true);
      sinon.assert.calledWith(res.redirect, '/foo');

      expect(res.send.calledOnce).to.equal(false);
    });
  });

  describe('login', function() {
    it('should redirect user to shutterstock login if user is not defined', function() {
      var req = {
        isAuthenticated: function() {
          return false;
        }
      };
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };

      auth.getLogin(req, res);

      sinon.assert.calledWith(res.redirect, '/v1/auth/login/shutterstock');
    });

    it('should redirect user to shutterstock login if user is not defined', function() {
      var req = {
        query: {
          next: '/v1/licenses'
        },
        isAuthenticated: function() {
          return false;
        }
      };
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };

      auth.getLogin(req, res);

      sinon.assert.calledWith(res.redirect, '/v1/auth/login/shutterstock?next=/v1/licenses');
    });

    it('should not render login if user is authenticated', function() {
      var req = {
        isAuthenticated: function() {
          return true;
        }
      };
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };

      auth.getLogin(req, res);

      sinon.assert.calledWith(res.redirect, '/');
      expect(res.render.calledOnce).to.equal(false);
    });
  });

  describe('shutterstock login', function() {
    it('should not authenticate with shutterstock if user is authenticated', function() {
      var req = {
        isAuthenticated: function() {
          return true;
        }
      };
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };

      auth.getShutterstock(req, res);

      sinon.assert.calledWith(res.redirect, '/');
      expect(res.render.calledOnce).to.equal(false);
    });

    it('should redirect to the next', function() {
      var req = {
        query: {
          next: '/hi'
        },
        isAuthenticated: function() {
          return true;
        }
      };
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };

      auth.getShutterstock(req, res);

      sinon.assert.calledWith(res.redirect, '/hi');
      expect(res.render.calledOnce).to.equal(false);
    });

    it('should use passport', function(done) {
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };
      var req = {
        isAuthenticated: function() {
          return false;
        },
        logIn: function(user, callback) {
          callback(null);

          sinon.assert.calledWith(res.redirect, '/');
          expect(res.render.calledOnce).to.equal(false);
          done();
        }
      };

      sandbox.stub(passport, 'authenticate', function(name, callback) {
        /*jshint -W098 */
        return function(request, response, next) {
          /*jshint +W098 */
          request.user = {
            username: 'test-abc'
          };
          callback(null, req.user, {});
        };
      });

      auth.getShutterstock(req, res, done);
    });

    it('should redirect to next after using passport', function(done) {
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };
      var req = {
        query: {
          next: '/hi'
        },
        isAuthenticated: function() {
          return false;
        },
        logIn: function(user, callback) {
          callback(null);

          sinon.assert.calledWith(res.redirect, '/hi');
          expect(res.render.calledOnce).to.equal(false);
          done();
        }
      };

      sandbox.stub(passport, 'authenticate', function(name, callback) {
        /*jshint -W098 */
        return function(request, response, next) {
          /*jshint +W098 */
          request.user = {
            username: 'test-abc'
          };
          callback(null, req.user, {});
        };
      });

      auth.getShutterstock(req, res, done);
    });

    it('should handle errors', function(done) {
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };
      var req = {
        isAuthenticated: function() {
          return false;
        }
      };

      sandbox.stub(passport, 'authenticate', function(name, callback) {
        /*jshint -W098 */
        return function(request, response, next) {
          /*jshint +W098 */
          callback(new Error('Something happened'));
        };
      });

      auth.getShutterstock(req, res, function(err) {
        expect(err.message).to.equal('Something happened');
        expect(res.render.calledOnce).to.equal(false);
        expect(res.redirect.calledOnce).to.equal(false);

        done();
      });
    });

    it('should handle login errors', function(done) {
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };
      var req = {
        query: {
          next: '/hi'
        },
        isAuthenticated: function() {
          return false;
        },
        logIn: function(user, callback) {
          callback(new Error('Something happened'));
        }
      };

      sandbox.stub(passport, 'authenticate', function(name, callback) {
        /*jshint -W098 */
        return function(request, response, next) {
          /*jshint +W098 */
          request.user = {
            username: 'test-abc'
          };
          callback(null, req.user, {});
        };
      });

      auth.getShutterstock(req, res, function(err) {
        expect(err.message).to.equal('Something happened');
        expect(res.render.calledOnce).to.equal(false);
        expect(res.redirect.calledOnce).to.equal(false);

        done();
      });
    });

    it('should handle missing user', function(done) {
      var res = {
        redirect: function(url) {
          expect(url).to.equal('/v1/auth/login?next=/hi');
          done();
        },
        render: sinon.spy(),
      };
      var req = {
        query: {
          next: '/hi'
        },
        isAuthenticated: function() {
          return false;
        }
      };

      sandbox.stub(passport, 'authenticate', function(name, callback) {
        /*jshint -W098 */
        return function(request, response, next) {
          /*jshint +W098 */
          callback(null, null, null);
        };
      });

      auth.getShutterstock(req, res, function(err) {
        expect(err.message).to.equal('Something happened');
        expect(res.render.calledOnce).to.equal(false);
        expect(res.redirect.calledOnce).to.equal(false);

        done();
      });
    });
  });

  describe('shutterstock login callback', function() {
    it('should redirect to next after using passport', function(done) {
      var res = {
        redirect: sinon.spy(),
        render: sinon.spy(),
      };
      var req = {
        query: {
          next: '/hi'
        },
        session: {},
        isAuthenticated: function() {
          return false;
        },
        logIn: function(user, callback) {
          callback(null);

          expect(req.session.token).to.equal('2/efg');

          sinon.assert.calledWith(res.redirect, '/hi');
          expect(res.render.calledOnce).to.equal(false);
          done();
        }
      };

      sandbox.stub(passport, 'authenticate', function(name, callback) {
        /*jshint -W098 */
        return function(request, response, next) {
          /*jshint +W098 */
          request.user = {
            username: 'test-abc',
            token: '2/efg'
          };
          callback(null, req.user, {});
        };
      });

      auth.getShutterstockCallback(req, res, done);
    });
  });
});
