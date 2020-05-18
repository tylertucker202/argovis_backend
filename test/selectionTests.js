process.env.NODE_ENV = 'test';

var chai = require('chai');
var moment = require('moment');
var assert = chai.assert;
let mongoose = require("mongoose");
let Profile = require('../models/profile');

let chaiHttp = require('chai-http');
let app = require('../app');

let qcScript = require('child_process');

let should = chai.should();

let generate = require('./../public/javascripts/generate_arrays_for_plotting.js')

chai.use(chaiHttp);


describe('/GET atlantic selection', function() {
    this.timeout(800);
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
          chai.request(app)
          .get(urlQuery)
          .end((err, res) => {
              //test overall response
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.above(0);
              //test an element of the response
              a_profile = res.body[0];
              a_profile.should.include.keys('_id', 'date', 'cycle_number','platform_number', 'geoLocation');
              a_profile._id.should.be.a('string');
              moment.utc(a_profile.date).format('YYYY-MM-DD').should.be.a('string');
              (a_profile.platform_number * 1).should.be.a('number');
              (a_profile.cycle_number * 1).should.be.a('number');
              a_profile.geoLocation.coordinates.should.be.a('array');
              a_profile.geoLocation.coordinates.length.should.be.eql(2);
              a_profile.geoLocation.type.should.be.eql('Point');

              //test if profile arrays are correctly formatted for ploting
              let profiles = res.body.splice(0);
              //out = generate.makeSelectionProfileArrays(profiles);
              let traces = [];
              let temp = [];
              let pres = [];
              let psal = [];
              let _ids = [];
              let cvalues = [];
              for(let i=0; i<profiles.length; i++) {
                  let profile = profiles[i];
                  let profileMeas = generate.reduceGPSMeasurements(profile, 200);
                  profileMeas = generate.collateProfileMeasurements(profileMeas); // collect points into arrays
                  let _id = profiles[i]._id
                  let color_array = Array.apply(null, Array(profileMeas.pres.length)).map(Number.prototype.valueOf, i);
                  let id_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,_id)
                  temp = temp.concat(profileMeas.temp);
                  pres = pres.concat(profileMeas.pres);
                  psal = psal.concat(profileMeas.psal);
                  cvalues = cvalues.concat(color_array);
                  _ids = _ids.concat(id_array);
              }

              out = generate.filterSelection(temp, pres, psal, cvalues, _ids)
              // presVsTemp array lengths should be equal
              presVsTempLength = out.tempForPres.length;
              out.tempForPres.length.should.be.equal(presVsTempLength);
              out.presForTemp.length.should.be.equal(presVsTempLength);
              out.cvaluesForTempVsPres.length.should.be.equal(presVsTempLength);
              out._idsForTempVsPres.length.should.be.equal(presVsTempLength);
              // presVsPsal array lengths should be equal
              presVsPsalLength = out.psalForPres.length;
              out.presForPsal.length.should.be.equal(presVsPsalLength);
              out.psalForPres.length.should.be.equal(presVsPsalLength);
              out.cvaluesForPsalVsPres.length.should.be.equal(presVsPsalLength);
              out._idsForPsalVsPres.length.should.be.equal(presVsPsalLength);
              // psalVsTemp array lengths should be equal
              psalVsTempLength = out.psalForTemp.length;
              out.psalForTemp.length.should.be.equal(psalVsTempLength);
              out.tempForPsal.length.should.be.equal(psalVsTempLength);
              out.cvaluesForTempVsPsal.length.should.be.equal(psalVsTempLength);
              out._idsForTempVsPsal.length.should.be.equal(psalVsTempLength);  
              done();
          });
    });
  });
  