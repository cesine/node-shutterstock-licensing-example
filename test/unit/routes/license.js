'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var license = require('./../../../routes/license');

describe.only('license', function() {
  var req;
  var res;

  beforeEach(function() {
    req = {
      user: {
        username: 'anoymous',
        email: 'anony@mouse.org'
      },
      isAuthenticated: function() {
        return true;
      },
      params: {
        image_id: '123'
      }
    };
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
      send: sinon.spy()
    };
  })

  it('should load', function() {
    expect(license).to.be.a('object');
    expect(license.router).to.be.a('function');
    expect(license.getImage).to.be.a('function');
  });

  it('should license an image', function() {
    var next = sinon.spy();

    license.ensureAuthenticated(req, res, next);
    expect(next.calledOnce).to.equal(true);

    license.getImage(req, res);
    sinon.assert.calledWith(res.send, {
      user: req.user,
      image: {
        id: req.params.image_id
      }
    });

    expect(res.redirect.calledOnce).to.equal(false);
    expect(res.render.calledOnce).to.equal(false);
  });

  it('should redirect to login if unauthenticated', function() {
    var next = sinon.spy();

    req.isAuthenticated = function() {
      return false;
    };

    license.ensureAuthenticated(req, res, next);

    sinon.assert.calledWith(res.redirect, '/v1/auth/login');

    expect(next.calledOnce).to.equal(false);
    expect(res.send.calledOnce).to.equal(false);
    expect(res.render.calledOnce).to.equal(false);
  });
});
