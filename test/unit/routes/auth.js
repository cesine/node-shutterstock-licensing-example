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

  it('should login', function() {
    var req = {
      user: {
        username: 'anoymous',
        email: 'anony@mouse.org'
      }
    };
    var res = {
      render: sinon.spy(),
      send: sinon.spy()
    };

    auth.getLogin(req, res);

    sinon.assert.calledWith(res.render, 'login', {
      user: req.user,
      json: JSON.stringify(req.user, null, 2)
    });

    expect(res.send.calledOnce).to.equal(false);
  });
});
