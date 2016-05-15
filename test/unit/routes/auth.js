'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var auth = require('./../../../routes/auth');

describe('auth', function() {
  it('should load', function() {
    expect(auth).to.be.a('object');
    expect(auth.router).to.be.a('function');
    expect(auth.getLogin).to.be.a('function');
    expect(auth.getLogout).to.be.a('function');
    expect(auth.getShutterstock).to.be.a('function');
    expect(auth.getShutterstockCallback).to.be.a('function');
  });

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

  it('should render login if user is not defined', function() {
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

    sinon.assert.calledWith(res.render, 'login', {});
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
});
