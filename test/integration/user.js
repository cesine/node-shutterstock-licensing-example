'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var app = require('./../../');

describe('/v1/users', function() {
  it('should load', function(done) {
    supertest(app)
      .get('/v1/users')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;

        expect(res.body).to.deep.equal({
          username: 'anonymouse'
        });

        done();
      });
  });
});
