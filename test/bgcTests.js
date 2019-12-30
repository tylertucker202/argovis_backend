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


describe('/GET bgc profile render', function() {
    this.timeout(500);
    it('it should GET the selected bgc profile.', (done) => {
      const urlQuery = '/catalog/profiles/2902755_199'
      chai.request(app)
      .get(urlQuery)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          a_profile = res.body;
          a_profile.should.include.keys('_id','id',
                                        'platform_number',
                                        'dac',
                                        'nc_url',
                                        'date',
                                        'date_qc',
                                        'date_added',
                                        'max_pres',
                                        'bgcMeas',
                                        'position_qc',
                                        'lat',
                                        'lon',
                                        'cycle_number', 
                                        'measurements', 
                                        'geoLocation', 
                                        'station_parameters',
                                        'station_parameters_in_nc',
                                        'VERTICAL_SAMPLING_SCHEME',
                                        'WMO_INST_TYPE',
                                        'DATA_MODE',
                                        //'DATA_CENTRE',
                                        'DIRECTION',
                                        'PI_NAME',
                                        'POSITIONING_SYSTEM',
                                        'PLATFORM_TYPE',
                                        'BASIN',
                                        'pres_max_for_TEMP',
                                        'pres_min_for_TEMP',
                                        'pres_max_for_PSAL',
                                        'pres_min_for_PSAL',
                                        'formatted_station_parameters',
                                        'date_formatted',
                                        'ifremerProfile',
                                        'jcompsPlatform',
                                        'roundLat',
                                        'roundLon',
                                        'strLat',
                                        'strLon',
                                        'url');
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
  this.timeout(9000);
  it('it should GET one bgc platform', (done) => {
    chai.request(app)
    .get('/catalog/platforms/5903260')
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        let profiles = res.body;
        const profile = profiles[1]
        should.not.exist(profile.bgcMeas) //bgc not allowed in platforms
        done();
    })
  })
})