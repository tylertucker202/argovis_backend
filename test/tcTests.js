process.env.NODE_ENV = 'test';

var chai = require('chai');
var moment = require('moment');
var assert = chai.assert;
let mongoose = require("mongoose");
let tcTrajSchema = require('../models/tcTraj');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

//http://localhost:3000/tc/findByDateRange?startDate=2018-08-15T00:00:00&endDate=2018-09-17T00:00:00
describe('/GET Traj Shapes on a certain date range', function() {
  this.timeout(5000);
  it('it should GET the tc in a date range.', (done) => {
    const startDate = "2018-08-15T00:00"
    const endDate = "2018-09-15T00:00"
    let urlQuery = `/tc/findByDateRange?startDate=${startDate}&endDate=${endDate}`
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        const trajectories = res.body;
        trajectories.length.should.be.equal(1)
        const traj = trajectories[0]
        traj._id.should.be.a('string')
        traj.name.should.be.a('string')
        traj.num.should.be.a('number')
        traj.source.should.be.a('string')
        traj.year.should.be.a('number')
        moment.utc(traj.startDate).toDate().should.be.a('date')
        moment.utc(traj.endDate).toDate().should.be.a('date')
        const traj_data = traj.traj_data
        done();
    });
  });
});

//http://localhost:3000/tc/findByNameYear?name=lane&year=2018
describe('/GET TC storm by name and year', function() {
    this.timeout(5000);
    it('it should GET a TC by name and year.', (done) => {
      const name = "lane"
      const year = "2018"
      let urlQuery = `/tc/findByNameYear?name=${name}&year=${year}`
      chai.request(app)
      .get(urlQuery)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          const trajectories = res.body;
          trajectories.length.should.be.equal(1)
          const traj = trajectories[0]

          traj._id.should.be.a('string')
          traj.name.should.be.a('string')
          traj.num.should.be.a('number')
          traj.source.should.be.a('string')
          traj.year.should.be.a('number')
          moment.utc(traj.startDate).toDate().should.be.a('date')
          moment.utc(traj.endDate).toDate().should.be.a('date')
          const traj_data = traj.traj_data

          done();
      });
    });
  });

  describe('/GET  TC name-year list', function() {
    this.timeout(5000);
    it('it should GET the TC name-years.', (done) => {
      let urlQuery = '/tc/stormNameList'
      chai.request(app)
      .get(urlQuery)
      .end((err, res) => {
          res.should.have.status(200);
          const nameYears = res.body;
          nameYears.should.be.a('array')
          nameYears[0].should.be.a('string')
          done();
      });
    });
  });