//var assert = require('assert');

process.env.NODE_ENV = 'test';

var chai = require('chai');

var assert = chai.assert;


let mongoose = require("mongoose");
let Profile = require('../models/profile');

let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET catalog profile profile', () => {
    it('it should GET all the profiles', (done) => {
          chai.request(app)
          .get('/catalog/profiles')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
            done();
          });
    });
});

describe('/GET catalog platform', () => {
  it('it should GET all the platforms', (done) => {
        chai.request(app)
        .get('/catalog/platforms')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
          done();
        });
  });
});

describe('/GET catalog dacs', () => {
  it('it should GET all the dacs', (done) => {
        chai.request(app)
        .get('/catalog/platforms')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
          done();
        });
  });
});



