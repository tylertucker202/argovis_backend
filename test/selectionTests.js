process.env.NODE_ENV = 'test';

var chai = require('chai');
var moment = require('moment');
var assert = chai.assert;
let mongoose = require("mongoose");
let Profile = require('../models/profile');

let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

/* Test selection */
describe('/GET last reported profiles', function() {
    this.timeout(2000);
    it('it should GET the last profiles reported for each platform.', (done) => {
          chai.request(app)
          .get('/selection/lastProfiles')
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(395);
              //test an element of the response
              a_profile = res.body[0];
              //console.log('A profile is: ' + JSON.stringify(a_profile));
              a_profile.should.include.keys('_id', 'date', 'platform_number', 'cycle_number', 'geoLocation');
              a_profile._id.should.be.a('string');
              moment(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              a_profile.geoLocation.coordinates.should.be.a('array');
              a_profile.geoLocation.coordinates.length.should.be.eql(2);
              a_profile.geoLocation.type.should.be.eql('Point');
              done();
          });
    });
  });

describe('/GET atlantic selection', function() {
    this.timeout(200);
    it('it should GET the selected profiles within a speciied date range and lat-lon shape.', (done) => {
          const endDate = '2017-08-30';
          const startDate = '2017-08-15';
          const transformedShape = [[-80.09,14.94],
                                    [-80.09,50.06],
                                    [2.51,50.06],
                                    [2.51,14.94],
                                    [-80.09,14.94]];
          const base = '/selection/profiles';
          const urlQuery = base+'?startDate='+startDate+'&endDate='+endDate+'&shape='+JSON.stringify([transformedShape]);
          //console.log('A selection query is: ' + urlQuery);
          chai.request(app)
          .get(urlQuery)
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(12);
              //test an element of the response
              a_profile = res.body[0];
              //console.log('A profile is: ' + JSON.stringify(a_profile));
              a_profile.should.include.keys('_id', 'date', 'cycle_number','platform_number', 'geoLocation');
              a_profile._id.should.be.a('string');
              moment(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              a_profile.geoLocation.coordinates.should.be.a('array');
              a_profile.geoLocation.coordinates.length.should.be.eql(2);
              a_profile.geoLocation.type.should.be.eql('Point');
              done();
          });
    });
  });
  