//var assert = require('assert');

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

/* Test catalog */
describe('/GET catalog profiles', function() {
  this.timeout(1500);
  it('it should GET all the profiles', (done) => {
        chai.request(app)
        .get('/catalog/profiles')
        .end((err, res) => {
            //test overall response
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(13181)
            //test an element of the response
            a_profile = res.body[0];
            console.log('A profile is: ' + JSON.stringify(a_profile));
            a_profile.should.include.keys('_id', 'date', 'cycle_number', 'geoLocation');
            a_profile._id.should.be.a('string');
            moment(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
            (a_profile['platform_number'] * 1).should.be.a('number');
            (a_profile.cycle_number * 1).should.be.a('number');
            a_profile.geoLocation.coordinates.should.be.a('array');
            a_profile.geoLocation.coordinates.length.should.be.eql(2);
            a_profile.geoLocation.type.should.be.eql('Point');
            done();
        });
  });
});

describe('/GET catalog platform', function() {
  this.timeout(200);
  it('it should GET all the platforms', (done) => {
        chai.request(app)
        .get('/catalog/platforms')
        .end((err, res) => {
            //test overall response
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(99);
            //test an element of the response
            a_platform = res.body[0];
            console.log('A platform is: ' + JSON.stringify(a_platform));
            a_platform.should.include.keys('_id', 'most_recent_date', 'cycle_number', 'geoLocation');
            a_platform._id.should.be.a('string');
            moment(a_platform.most_recent_date).format('YYYY-MM-DD').should.be.a('string');
            (a_platform['platform_number'] * 1).should.be.a('number');
            (a_platform.cycle_number * 1).should.be.a('number');
            a_platform.geoLocation.coordinates.should.be.a('array');
            a_platform.geoLocation.coordinates.length.should.be.eql(2);
            a_platform.geoLocation.type.should.be.eql('Point');
            done();
        });
  });
});

describe('/GET catalog dacs', function() {
  this.timeout(200);
  it('it should GET all the dacs', (done) => {
        chai.request(app)
        .get('/catalog/dacs')
        .end((err, res) => {
            //test overall response
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(11);
            //test an element of the response
            a_dac = res.body[0];
            console.log('A dac is: ' + JSON.stringify(a_dac));
            a_dac.should.include.keys('_id', 'number_of_profiles', 'dac');
            a_dac._id.should.be.a('string');
            a_dac.number_of_profiles.should.be.a('number');
            moment(a_dac.most_recent_date).format('YYYY-MM-DD').should.be.a('string');
            a_dac.dac.should.be.a('string');
            done();
        });
  });
});

/* Test selection */
describe('/GET most last reported profiles', function() {
  this.timeout(200);
  it('it should GET the last profiles reported for each platform.', (done) => {
        chai.request(app)
        .get('/selection/lastProfiles')
        .end((err, res) => {
            //test overall response
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(99);
            //test an element of the response
            a_profile = res.body[0];
            console.log('A profile is: ' + JSON.stringify(a_profile));
            a_profile.should.include.keys('_id', 'date', 'cycle_number','profile_id', 'geoLocation');
            a_profile._id.should.be.a('string');
            moment(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
            (a_profile['platform_number'] * 1).should.be.a('number');
            (a_profile.cycle_number * 1).should.be.a('number');
            a_profile.geoLocation.coordinates.should.be.a('array');
            a_profile.geoLocation.coordinates.length.should.be.eql(2);
            a_profile.geoLocation.type.should.be.eql('Point');
            done();
        });
  });
});



