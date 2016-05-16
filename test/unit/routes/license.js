'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var license = require('./../../../routes/license');

describe('license', function() {
  var req;
  var res;

  beforeEach(function() {
    req = {
      user: {
        username: 'anoymous',
      },
      isAuthenticated: function() {
        return true;
      },
      params: {
        imageId: '123'
      }
    };
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
      json: sinon.spy()
    };
  });

  it('should load', function() {
    expect(license).to.be.a('object');
    expect(license.router).to.be.a('function');
    expect(license.licenseImage).to.be.a('function');
  });

  it('should license an image', function() {
    var next = sinon.spy();

    license.licenseImage(req, res, next);

    sinon.assert.calledWith(res.json, {
      user: req.user,
      image: {
        id: req.params.imageId,
        url: 'download'
      }
    });

    expect(next.calledOnce).to.equal(false);
    expect(res.redirect.calledOnce).to.equal(false);
    expect(res.render.calledOnce).to.equal(false);
  });

  it('should redirect to login if unauthenticated', function() {
    var next = sinon.spy();

    req.isAuthenticated = function() {
      return false;
    };

    license.licenseImage(req, res, next);

    sinon.assert.calledWith(res.redirect, '/v1/auth/login/shutterstock?next=/v1/licenses/123');

    expect(next.calledOnce).to.equal(false);
    expect(res.json.calledOnce).to.equal(false);
    expect(res.render.calledOnce).to.equal(false);
  });
});
