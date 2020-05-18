process.env.NODE_ENV = 'test'

var chai = require('chai')
var moment = require('moment')
var assert = chai.assert
var profileController = require('../controllers/profileController')
let mongoose = require("mongoose")
let Profile = require('../models/profile')
let chaiHttp = require('chai-http')
let app = require('../app')
let should = chai.should()
let generate = require('./../public/javascripts/generate_arrays_for_plotting.js')

describe('/GET handles profiles containing nan for plotting', function() {
    this.timeout(5000)
    const psalList = "ids=['1900722_1','2900784_74','2900784_75','2900784_78','2900784_1900722_2']"
    const tempList = "ids=['1900722_1','1900722_2']"

    it('it should GET a list of profiles with nan in psal', (done) => {
      const urlQuery = '/catalog/mprofiles/?' + psalList
      chai.request(app)
      .get(urlQuery)
      .end((err, res) => {
        res.should.have.status(200)

        const profiles = res.body
        assert(profiles.length > 0, 'there should be profiles')

        for(let idx=0; idx<profiles.length; idx++){
            const profile = profiles[idx]
            const collatedProfiles = generate.collateProfileMeasurements(profile.measurements)

            const profMeasLen = profile.measurements.length
            
            assert(collatedProfiles.pres.length == profMeasLen, 'pres length should not change')
            assert(collatedProfiles.temp.length == profMeasLen, 'temp length should not change')
            assert(collatedProfiles.psal.length == profMeasLen, 'psal length should not change')
            
            presVsTempMask = generate.getMaskForPair(collatedProfiles.temp, collatedProfiles.pres)
            presVsPsalMask = generate.getMaskForTrio(collatedProfiles.psal, collatedProfiles.pres, collatedProfiles.temp)
            tempVsPsalMask = generate.getMaskForPair(collatedProfiles.psal, collatedProfiles.temp)
            let out = {}
            out.presForTemp = collatedProfiles.pres.filter((item, idx) => presVsTempMask[idx])
            out.tempForPres = collatedProfiles.temp.filter((item, idx) => presVsTempMask[idx])
            out.presForPsal = collatedProfiles.pres.filter((item, idx) => presVsPsalMask[idx])
            out.psalForPres = collatedProfiles.psal.filter((item, idx) => presVsPsalMask[idx])
            out.psalForTemp = collatedProfiles.psal.filter((item, idx) => tempVsPsalMask[idx])
            out.tempForPsal = collatedProfiles.temp.filter((item, idx) => tempVsPsalMask[idx])

            assert(out.presForTemp.length == out.tempForPres.length, 'lengths should be the same')
            assert(out.presForPsal.length == out.psalForPres.length, 'lengths should be the same')
            assert(out.psalForTemp.length == out.tempForPsal.length, 'lengths should be the same')

        }
        done()
      })
    })

    it('it should GET a list of profiles with nan in temp', (done) => {
        //const urlQuery = '/catalog/mprofiles/?' + tempList
        const urlQuery = '/catalog/mprofiles/?' + psalList
        chai.request(app)
        .get(urlQuery)
        .end((err, res) => {
          res.should.have.status(200)
          const profiles = res.body
          assert(profiles.length > 0 , 'there should be profiles ')
  
          for(let idx=0; idx<profiles.length; idx++){
              const profile = profiles[idx]
              const collatedProfiles = generate.collateProfileMeasurements(profile.measurements)
  
              const profMeasLen = profile.measurements.length
              
              assert(collatedProfiles.pres.length == profMeasLen, 'pres length should not change')
              assert(collatedProfiles.temp.length == profMeasLen, 'temp length should not change')
              assert(collatedProfiles.psal.length == profMeasLen, 'psal length should not change')
              
              presVsTempMask = generate.getMaskForPair(collatedProfiles.temp, collatedProfiles.pres)
              presVsPsalMask = generate.getMaskForTrio(collatedProfiles.psal, collatedProfiles.pres, collatedProfiles.temp)
              tempVsPsalMask = generate.getMaskForPair(collatedProfiles.psal, collatedProfiles.temp)
              let out = {}
              out.presForTemp = collatedProfiles.pres.filter((item, idx) => presVsTempMask[idx])
              out.tempForPres = collatedProfiles.temp.filter((item, idx) => presVsTempMask[idx])
              out.presForPsal = collatedProfiles.pres.filter((item, idx) => presVsPsalMask[idx])
              out.psalForPres = collatedProfiles.psal.filter((item, idx) => presVsPsalMask[idx])
              out.psalForTemp = collatedProfiles.psal.filter((item, idx) => tempVsPsalMask[idx])
              out.tempForPsal = collatedProfiles.temp.filter((item, idx) => tempVsPsalMask[idx])
  
              assert(out.presForTemp.length == out.tempForPres.length, 'lengths should be the same')
              assert(out.presForPsal.length == out.psalForPres.length, 'lengths should be the same')
              assert(out.psalForTemp.length == out.tempForPsal.length, 'lengths should be the same')
  
          }
          done()
        })
      })

  
  })