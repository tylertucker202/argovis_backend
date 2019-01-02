

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
              //test an element of the response
              a_profile = res.body[0];
              console.log('A profile is: ' + JSON.stringify(a_profile));
              a_profile.should.include.keys('_id', 'date', 'platform_number', 'cycle_number', 'geoLocation');
              a_profile._id.should.be.a('string');
              moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              a_profile.geoLocation.coordinates.should.be.a('array');
              a_profile.geoLocation.coordinates.length.should.be.eql(2);
              a_profile.geoLocation.type.should.be.eql('Point');
              done();
          });
    });
  });

  describe('/GET latest reported profiles', function() {
    this.timeout(2000);
    it('it should GET the last profiles reported for each platform.', (done) => {
          chai.request(app)
          .get('/selection/latestProfiles')
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              res.body.should.be.a('array');
              //test an element of the response
              a_profile = res.body[0];
              console.log('A profile is: ' + JSON.stringify(a_profile));
              a_profile.should.include.keys('_id', 'date', 'platform_number', 'cycle_number', 'geoLocation');
              a_profile._id.should.be.a('string');
              moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              a_profile.geoLocation.coordinates.should.be.a('array');
              a_profile.geoLocation.coordinates.length.should.be.eql(2);
              a_profile.geoLocation.type.should.be.eql('Point');
              done();
          });
    });
  });

  describe('/GET last 3 days profiles', function() {
    this.timeout(2000);
    var myDate = '2018-08-30'
    it('it should GET the last 3 days of profiles ending at date.', (done) => {
          chai.request(app)
          .get('/selection/lastThreeDays/' + myDate)
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              res.body.should.be.a('array');
              //test an element of the response
              a_profile = res.body[0];
              console.log('A profile is: ' + JSON.stringify(a_profile));
              a_profile.should.include.keys('_id', 'date', 'platform_number', 'cycle_number', 'geoLocation');
              a_profile._id.should.be.a('string');
              moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              a_profile.geoLocation.coordinates.should.be.a('array');
              a_profile.geoLocation.coordinates.length.should.be.eql(2);
              a_profile.geoLocation.type.should.be.eql('Point');
              done();
          });
    });
  });

describe('/GET last month year profiles', function() {
    this.timeout(2000);
    var year = '2010'
    var month = '4'
    it('it should GET the month-year meta information from profiles.', (done) => {
          chai.request(app)
          .get('/selection/profiles/' + month + '/' + year)
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              res.body.should.be.a('array');
              //test an element of the response
              a_profile = res.body[0];
              console.log('A profile is: ' + JSON.stringify(a_profile));
              a_profile.should.include.keys('_id',
                                            'platform_number',
                                            'dac',
                                            'date',
                                            'date_qc',
                                            'date_added',
                                            'containsBGC',
                                            'isDeep',
                                            'position_qc',
                                            'lat',
                                            'lon',
                                            'cycle_number', 
                                            'station_parameters',
                                            'VERTICAL_SAMPLING_SCHEME',
                                            'DATA_MODE',
                                            'PI_NAME',
                                            'POSITIONING_SYSTEM',
                                            'PLATFORM_TYPE',
                                            'BASIN',
                                            'pres_max_for_TEMP',
                                            'pres_min_for_TEMP',
                                            'pres_max_for_PSAL',
                                            'pres_min_for_PSAL');
              a_profile._id.should.be.a('string');
              moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              done();
          });
    });
  });
