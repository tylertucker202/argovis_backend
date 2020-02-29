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

/* Test catalog */
describe('/GET catalog list of platforms', function() {
  this.timeout(2000);
  it('it should GET all the platforms', (done) => {
    chai.request(app)
    .get('/catalog/platforms')
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        res.body.should.be.a('array');
        //test an element of the response
        a_platform = res.body[0];
        a_platform.should.include.keys('_id',
                                      'platform_number',
                                      'most_recent_date',
                                      'dac',
                                      'number_of_profiles',
                                      'cycle_number',
                                      'geoLocation', 
                                      'dac');
        a_platform._id.should.be.a('number');
        moment.utc(a_platform.most_recent_date).format('YYYY-MM-DD').should.be.a('string');
        a_platform.platform_number.should.be.a('number');
        a_platform.cycle_number.should.be.a('number');
        a_platform.geoLocation.coordinates.should.be.a('array');
        a_platform.geoLocation.coordinates.length.should.be.eql(2);
        a_platform.geoLocation.type.should.be.eql('Point');
        done();
    });
  });
});

describe('/GET a platform', function() {
  this.timeout(2000);
  it('it should GET one platform', (done) => {
    chai.request(app)
    .get('/catalog/platforms/2902972')
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);



        let profiles = res.body.splice(0);
        let psal = [];
        let pres = [];
        let temp = [];
        let cycle = [];
        for(var i=0; i < profiles.length; i++) {
            var profileMeas = generate.reduceGPSMeasurements(profiles[i], 200);
            profileMeas = generate.collateProfileMeasurements(profileMeas);
            psal = psal.concat(profileMeas.psal);
            pres = pres.concat(profileMeas.pres);
            temp = temp.concat(profileMeas.temp);
    
            let meas_idx = [];
            for (var j=0; j<profileMeas.pres.length; j++) {
                meas_idx.push(profiles[i].cycle_number); //just an array of cycle number
            }
            cycle = cycle.concat(meas_idx);
        };

        out = generate.filterProfiles(temp, pres, psal, cycle)
        // presVsTemp array lengths should be equal
        presVsTempLength = out.tempForPres.length;
        out.tempForPres.length.should.be.equal(presVsTempLength);
        out.presForTemp.length.should.be.equal(presVsTempLength);
        out.cycleForTemp.length.should.be.equal(presVsTempLength);

        // presVsPsal array lengths should be equal
        presVsPsalLength = out.psalForPres.length;
        out.presForPsal.length.should.be.equal(presVsPsalLength);
        out.psalForPres.length.should.be.equal(presVsPsalLength);
        out.cycleForTemp.length.should.be.equal(presVsPsalLength);
        done();
    });
  });
});

describe('/GET catalog dacs', function() {
  this.timeout(200);
  it('it should GET the dac summary', (done) => {
    chai.request(app)
    .get('/catalog/dacs')
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        res.body.should.be.a('array');
        //res.body.length.should.be.eql(11);
        //test an element of the response
        a_dac = res.body[0];
        a_dac.should.include.keys('_id', 'number_of_profiles', 'dac');
        a_dac._id.should.be.a('string');
        a_dac.number_of_profiles.should.be.a('number');
        moment.utc(a_dac.most_recent_date).format('YYYY-MM-DD').should.be.a('string');
        a_dac.dac.should.be.a('string');
        done();
    });
  });
});

describe('/GET a list of profiles from a list', function() {
  this.timeout(5000);
  const list = "ids=['4902323_45D','3900740_34']"
  const presRange = "&presRange=[0,20]"
  it('it should GET a list of profiles', (done) => {
    const urlQuery = '/catalog/mprofiles/?' + list
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
      res.should.have.status(200);
      a_profile = res.body[0];
      assert(a_profile._id === "4902323_45D", 'wrong profile returned');
      assert(a_profile.count === 564, 'check the length of measurements');
      done()
    })
  })
  it('it should GET a list of selected profiles within a pressure range', (done) => {
    const urlQuery = '/catalog/mprofiles/?' + list + presRange
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
      res.should.have.status(200);
      a_profile = res.body[0];
      a_measurement = a_profile.measurements
      assert(a_profile._id === "4902323_45D", 'wrong profile returned');
      assert(a_profile.count === 15, 'there should be fewer measurements');
      done();
    })
  })

})

describe('/GET profile render', function() {
  this.timeout(500);
  it('it should GET the selected profile.', (done) => {
    const urlQuery = '/catalog/profiles/2902972_69'
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


describe('/GET profile render with nan in psal', function() {
  this.timeout(500);
  it('it should GET the profile with nan in psal.', (done) => {
    const urlQuery = '/catalog/profiles/4900421_16'
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        a_profile = res.body;
        const meas = a_profile.measurements

        const last_psal = meas[meas.length-1].psal
        //last_psal.should.not.exist()
        should.equal(last_psal, null)

        done();
    });
  });
});

