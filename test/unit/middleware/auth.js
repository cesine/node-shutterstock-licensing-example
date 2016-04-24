'use strict';

var expect = require('chai').expect;

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
});
