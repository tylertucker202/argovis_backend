process.env.NODE_ENV = 'test';

var chai = require('chai');
var assert = chai.assert;
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();
chai.use(chaiHttp);

/* Test covar */
describe('/GET get a covar object', function() {
    this.timeout(2000);
    const long = '17.05'
    const lat = '-49.61'
    const forcastDays = '140'
    let url = '/covarGrid/'
    url += long + '/' + lat + '/' + forcastDays
    it('it should a get a covar object', (done) => {
      chai.request(app)
      .get(url)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          //test an element of the response
          a_covar = res.body
          assert(a_covar, 'covar should be returned')
          a_covar.forcastDays.should.be.a('number')
          a_covar.dLat.should.be.a('number')
          a_covar.dLong.should.be.a('number')
          a_covar._id.should.be.a('string');
          a_covar.geoLocation.coordinates.should.be.a('array');
          a_covar.geoLocation.coordinates.length.should.be.eql(2);
          a_covar.geoLocation.type.should.be.eql('Point');
          const a_feature = a_covar.features[0]
          a_feature.geometry.coordinates.should.be.a('array');
          a_feature.geometry.coordinates.length.should.be.eql(2);
          a_feature.geometry.type.should.be.eql('Point')
          a_feature.type.should.be.eql('Feature');
          a_feature.properties.Probability.should.be.a('number')
          done();
      });
    });
  });
