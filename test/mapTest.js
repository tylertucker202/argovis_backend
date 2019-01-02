process.env.NODE_ENV = 'test';

var chai = require('chai');
var moment = require('moment');
var assert = chai.assert;
var profileController = require('../controllers/profileController')
let mongoose = require("mongoose");
let Profile = require('../models/profile');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

/* Test selection */
describe('/GET map from /', function() {
    this.timeout(500);
    it('it successfully get the angular map page from /.', (done) => {
          chai.request(app)
          .get('/')
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              done();
          });
    });
  });

describe('/GET map', function() {
    this.timeout(500);
    it('it successfully get the pug map page from /map.', (done) => {
          chai.request(app)
          .get('/map')
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              done();
          });
    });
  });

  describe('/GET map', function() {
    this.timeout(500);
    it('it successfully get the angular map page from /map=WM.', (done) => {
          chai.request(app)
          .get('/?map=WM')
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              done();
          });
    });
  });

describe('/GET somthing that is not there', function() {
    this.timeout(500);
    it('it successfully gets a 404 from a made up link.', (done) => {
          chai.request(app)
          .get('/index')
          .end((err, res) => {
              //test overall response
              res.should.have.status(404);
              done();
          });
    });
  });