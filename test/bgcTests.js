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
let generate = require('./../public/javascripts/generate_arrays_for_plotting.js')


chai.use(chaiHttp);

describe('/GET a small bgc profile render', function() {
  this.timeout(500);
  it('it should GET the selected bgc profile.', (done) => {
    const urlQuery = '/catalog/profiles/5903260_237'
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        const a_profile = res.body;
        let keys = a_profile['bgcMeasKeys']
        a_profile.should.include.keys('bgcMeasKeys', 'containsBGC', 'bgcMeas');
        const keys_should_be = 'doxy,pres,psal,temp'
        const keys_equal = keys.sort().join(',') === keys_should_be
        keys_equal.should.be.true;
        done();
    });
  });
});

describe('/GET bgc profile render', function() {
    this.timeout(3500);
    it('it should GET the selected bgc profile.', (done) => {
      const urlQuery = '/catalog/profiles/2902755_199'
      chai.request(app)
      .get(urlQuery)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          a_profile = res.body;
          a_profile.should.include.keys('bgcMeasKeys', 'containsBGC', 'bgcMeas');
          a_profile._id.should.be.a('string');
          a_profile.platform_number.should.be.a('number');
          a_profile.dac.should.be.a('string');
          a_profile.nc_url.should.be.a('string');
          moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
          a_profile.position_qc.should.be.a('number');
          a_profile.lat.should.be.a('number');
          a_profile.lon.should.be.a('number');
          a_profile.cycle_number.should.be.a('number');
          a_profile.geoLocation.type.should.eql('Point');
          a_profile.PI_NAME.should.be.a('string');
          a_profile.POSITIONING_SYSTEM.should.be.a('string');
          a_profile.PLATFORM_TYPE.should.be.a('string');
          done();
      });
    });
  });

describe('/GET a bgc platform', function() {
  this.timeout(2000);
  it('it should GET one bgc platform', (done) => {
    chai.request(app)
    .get('/catalog/platforms/5903260')
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        let profiles = res.body;
        const a_profile = profiles[1]
        should.not.exist(a_profile.bgcMeas) //bgc not allowed in platforms
        done();
    })
  })

  it('it should GET one bgc platform data', (done) => {
    chai.request(app)
    .get('/catalog/bgc_platform_data/5903260/?xaxis=pres&yaxis=temp')
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        let profiles = res.body;
        const a_profile = profiles[1]
        should.exist(a_profile) //bgc not allowed in platforms
        a_profile.should.include.keys('bgcMeas', '_id');
        const a_meas = a_profile['bgcMeas'][0]
        should.exist(a_meas)
        a_meas.should.include.keys('pres', 'pres_qc', 'temp', 'temp_qc')

        done();
    })
  })
})

describe('/GET platform metadata', function() {
  this.timeout(500);
  it('it should GET the selected platform metadata.', (done) => {
    const urlQuery = '/catalog/platform_metadata/5903260'
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        a_profile = res.body[0];
        a_profile._id.should.be.a('number');
        a_profile.platform_number.should.be.a('number');
        a_profile.dac.should.be.a('string');
        a_profile.nc_url.should.be.a('string');
        moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
        a_profile.position_qc.should.be.a('number');
        a_profile.lat.should.be.a('number');
        a_profile.lon.should.be.a('number');
        a_profile.cycle_number.should.be.a('number');
        a_profile.geoLocation.type.should.eql('Point');
        a_profile.PI_NAME.should.be.a('string');
        a_profile.POSITIONING_SYSTEM.should.be.a('string');
        a_profile.PLATFORM_TYPE.should.be.a('string');
        done();
    });
  });
});
