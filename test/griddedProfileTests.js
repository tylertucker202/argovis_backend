process.env.NODE_ENV = 'test';

var chai = require('chai');
var assert = chai.assert;
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();
chai.use(chaiHttp);

/* Test covar */
describe('/GET get an interpolation object', function() {
    this.timeout(2000);
    const startDate = 'startDate=2004-12-01'
    const endDate = 'endDate=2004-12-31'
    const presRange = 'presRange=[0,35]'
    const intPres = 'intPres=10'

    let url = '/gridding/presSliceForInterpolation/?'
    url += startDate + '&' + endDate + '&' + presRange + '&' + intPres
    it('it should a get an interpolated pressure object', (done) => {
      chai.request(app)
      .get(url)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          //test an element of the response
          const profs = res.body
          profs.should.be.a('array')
          for (let idx=0; idx < profs.length; idx++){
              const prof = profs[idx]
              prof._id.should.be.a('string')
              prof.DATA_MODE.should.be.a('string')
              prof.date_qc.should.be.a('number')
              prof.date.should.be.a('string')
              prof.lat.should.be.a('number')
              prof.lon.should.be.a('number')
              prof.position_qc.should.be.a('number')
              prof.cycle_number.should.be.a('number')
              prof.dac.should.be.a('string')
              prof.platform_number.should.be.a('number')
              prof.BASIN.should.be.a('number')
              prof.measurements.should.be.a('array')

              const measurements = prof.measurements

              measurements.length.should.be.gt(2)
              measurements.length.should.be.lte(7)
              let prevMeas = {pres:-200}
              for (let jdx=0; jdx < measurements.length; jdx++){
                  const meas = measurements[jdx]
                  meas.pres.should.be.gt(prevMeas.pres)
                  prevMeas = meas
              }
          }
          done();
      });
    });
  });
