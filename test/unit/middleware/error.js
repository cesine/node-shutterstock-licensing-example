'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var error = require('./../../../middleware/error');

describe('error', function() {
  var err = new Error('oops');
  err.status = 500;

  var req = {
    app: {
      locals: {}
    }
  };
  var res = {};

  it('should load', function() {
    expect(error).to.be.a('function');
  });

  describe('pages', function() {
    beforeEach(function() {
      req.url = '/nothinghere';
      res.json = sinon.spy();
      res.render = sinon.spy();
      res.status = sinon.spy();
    });

    describe('in dev', function() {
      beforeEach(function() {
        req.app.locals.ENV = 'dev';
      });

      it('should expose stack traces', function() {
        error(err, req, res, function() {});

        expect(res.json.called).to.equal(false);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.render, 'error', {
          error: err,
          message: err.message,
          status: err.status
        });
      });

    });

    describe('in prod', function() {
      beforeEach(function() {
        req.app.locals.ENV = 'production';
      });

      it('should not expose stack traces', function() {
        error(err, req, res, function() {});

        expect(res.json.called).to.equal(false);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.render, 'error', {
          error: {},
          message: err.message,
          status: err.status
        });
      });
    });
  });

  describe('api endpoint', function() {
    beforeEach(function() {
      req.url = '/v1/nodata';
      res.json = sinon.spy();
      res.render = sinon.spy();
      res.status = sinon.spy();
    });

    describe('in dev', function() {
      beforeEach(function() {
        req.app.locals.ENV = 'dev';
      });

      it('should expose stack traces', function() {
        error(err, req, res, function() {});

        expect(res.render.called).to.equal(false);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.json, {
          error: err,
          message: err.message,
          status: err.status
        });
      });

    });

    describe('in prod', function() {
      beforeEach(function() {
        req.app.locals.ENV = 'production';
      });

      it('should not expose stack traces', function() {
        error(err, req, res, function() {});

        expect(res.render.called).to.equal(false);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.json, {
          error: {},
          message: err.message,
          status: err.status
        });
      });
    });
  });
});
