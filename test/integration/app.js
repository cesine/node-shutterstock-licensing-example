var expect = require('chai').expect;
var supertest = require('supertest');

var app = require('./../../');

describe('app', function() {
  it('should load', function() {
    expect(app).to.be.a('function');
  });

  it('should handle routes which are not found', function(done) {
    supertest(app)
      .get('/notexistant')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect('Content-Length', '2873')
      .expect(404)
      .end(function(err, res) {
        if (err) throw err;

        expect(res.body).to.deep.equal({});

        done();
      });
  });
});
