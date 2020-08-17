process.env.NODE_ENV = 'test';

var chai = require('chai');
var assert = chai.assert;
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();
var moment = require('moment');
chai.use(chaiHttp);

/* Test rgGrid */
describe('/GET get a RG temp anom object', function() {
    this.timeout(5000);
    const url = '/griddedProducts/grid/find?gridName=rgTempAnom'
    it('it should a get a rgTempAnom object', (done) => {
      chai.request(app)
      .get(url)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          //test an element of the response
          a_grid = res.body[0]

          a_grid.should.include.keys('_id', 'date', 'data', 'gridName', 'measurement', 'units', 'variable', 'pres', 'cellsize', 'NODATA_value')
          moment.utc(a_grid.date).format('YYYY-MM-DD').should.be.a('string');
          a_grid._id.should.be.a('string');
          a_grid.data.should.be.a('array');
          a_grid.variable.should.be.a('string');
          a_grid.units.should.be.a('string');
          a_grid.pres.should.be.a('number');
          a_grid.cellsize.should.be.a('number');
          assert(a_grid.NODATA_value === null, 'no data value should be null')

          done();
      });
    });
  });

  //http://localhost:3000/griddedProducts/nonUniformGrid/window?latRange=[-75,-73]&lonRange=[-5,0]&gridName=sose_si_area_3_day&date=2013-01-04&presLevel=0
  //test sose_si_area_3_day assums it is in the db
  describe('/GET get a sose_si_area_3_day object', function() {

    this.timeout(5000);
    const url = '/griddedProducts/nonUniformGrid/window?latRange=[-75,-70]&lonRange=[-5,0]&gridName=sose_si_area_1_day_sparse&date=2013-01-04&presLevel=0'
    it('it should a get a sose_si_area_1_day_sparse object', (done) => {
      chai.request(app)
      .get(url)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          //test an element of the response
          a_grid = res.body[0]
          a_grid.should.include.keys('_id', 'date', 'param', 'data', 'gridName', 'measurement', 'units', 'variable', 'pres', 'chunks', 'NODATA_value')
          moment.utc(a_grid.date).format('YYYY-MM-DD').should.be.a('string');
          a_grid._id.should.be.a('string');
          a_grid.data.should.be.a('array');
          a_grid.variable.should.be.a('string');
          a_grid.units.should.be.a('string');
          a_grid.pres.should.be.a('number');
          assert(a_grid.NODATA_value === null, 'no data value should be null')
          done();
      });
    });
  });

  describe('/GET get a grid coordinate object', function() {
    this.timeout(1000);
    const url = '/griddedProducts/gridCoords?latRange=[-75,-73]&lonRange=[-5,5]&gridName=sose_si_area_1_day_sparse'
    it('it should a get a grid_coord object', (done) => {
      chai.request(app)
      .get(url)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          //test an element of the response
          a_grid = res.body[0]
          a_grid.should.include.keys('_id', 'gridName', 'lats', 'lons')
          a_grid.gridName.should.be.a('string');
          a_grid.lats.should.be.a('array');
          a_grid.lons.should.be.a('array');
          done();
      });
    });
  });



  // describe('/GET get a ksSpaceTempTrend2 object', function() {
  //   this.timeout(5000);
  //   const url = '/griddedProducts/grid/find?gridName=ksSpaceTimeTempTrend2'
  //   it('it should a get a kuuselaGrid object', (done) => {
  //     chai.request(app)
  //     .get(url)
  //     .end((err, res) => {
  //         //test overall response
  //         res.should.have.status(200);
  //         //test an element of the response
  //         a_grid = res.body[0]
  //         a_grid.should.include.keys('_id', 'date', 'data', 'gridName', 'measurement', 'units', 'variable', 'pres', 'cellsize', 'NODATA_value')
  //         moment.utc(a_grid.date).format('YYYY-MM-DD').should.be.a('string');
  //         a_grid._id.should.be.a('string');
  //         a_grid.data.should.be.a('array');
  //         a_grid.variable.should.be.a('string');
  //         a_grid.units.should.be.a('string');
  //         a_grid.pres.should.be.a('number');
  //         a_grid.cellsize.should.be.a('number');
  //         assert(a_grid.NODATA_value === null, 'no data value should be null')

  //         done();
  //     });
  //   });
  // });

  // describe('/GET get a ksTempAnom object', function() {
  //   this.timeout(5000);
  //   const url = '/griddedProducts/grid/find?gridName=ksTempAnom'
  //   it('it should a get a kuuselaGrid object', (done) => {
  //     chai.request(app)
  //     .get(url)
  //     .end((err, res) => {
  //         //test overall response
  //         res.should.have.status(200);
  //         //test an element of the response
  //         a_grid = res.body[0]
  //         console.log('a grid:', a_grid._id)
  //         a_grid.should.include.keys('_id', 'date', 'data', 'gridName', 'measurement', 'units', 'variable', 'pres', 'cellsize', 'NODATA_value')
  //         moment.utc(a_grid.date).format('YYYY-MM-DD').should.be.a('string');
  //         a_grid._id.should.be.a('string');
  //         a_grid.data.should.be.a('array');
  //         a_grid.variable.should.be.a('string');
  //         a_grid.units.should.be.a('string');
  //         a_grid.pres.should.be.a('number');
  //         a_grid.cellsize.should.be.a('number');
  //         assert(a_grid.NODATA_value === null, 'no data value should be null')

  //         done();
  //     });
  //   });
  // });