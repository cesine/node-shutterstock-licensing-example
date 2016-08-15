'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var app = require('./../../');

describe('/v1', function() {
  it('should load', function() {
    expect(app).to.be.a('function');
  });

  describe('is production ready', function() {
    it('should handle pages which are not found', function(done) {
      process.env.NODE_ENV = 'production';

      supertest(app)
        .get('/notexistant')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(404)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).not.to.contain('shutterstock-licensing-example-node/app.js');
          expect(res.body).to.deep.equal({});

          done();
        });
    });

    it('should handle api endpoints which are not found', function(done) {
      process.env.NODE_ENV = 'production';

      supertest(app)
        .get('/v1/notexistant')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(404)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            error: {},
            message: 'Not Found',
            status: 404
          });

          done();
        });
    });

    it('should expose stack traces in dev', function(done) {
      process.env.NODE_ENV = 'development';
      app.set('view engine', 'notarealengine');

      supertest(app)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(500)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('express/lib/view.js');
          expect(res.body).to.deep.equal({});

          done();
        });
    });
  });
});
