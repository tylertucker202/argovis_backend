process.env.NODE_ENV = 'test';

var chai = require('chai');
var moment = require('moment');
var assert = chai.assert;
var arController = require('../controllers/arShapesController')
let mongoose = require("mongoose");
let arShapes = require('../models/arShapes');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET AR Shapes on a certain date', function() {
  this.timeout(1500);
  it('it should GET the ArShapes.', (done) => {
    const date = "2004-01-01T00:00:000Z"
    let urlQuery = '/arShapes/findByDate?date=' + date
    chai.request(app)
    .get(urlQuery)
    .end((err, res) => {
        //test overall response
        res.should.have.status(200);
        const shapes = res.body;
        for (let idx=0; idx<shapes.length; idx++){
            const a_shape = shapes[idx]
            a_shape.should.include.keys('_id', 'date', 'date_formatted', 'shapeId', 'geoLocation')
            assert(a_shape.date.format() === date, 'wrong date returned');
        }
        done();
    });
  });
});

describe('/GET an AR shape by ID', function() {
    this.timeout(1500);
    it('it should GET the ArShapes by ID.', (done) => {
      const shape_id = "1_210384.0"
      let urlQuery = '/arShapes/findByID?_id=' + shape_id
      chai.request(app)
      .get(urlQuery)
      .end((err, res) => {
          //test overall response
          res.should.have.status(200);
          const a_shape = res.body[0];
          a_shape.should.include.keys('_id', 'date', 'date_formatted', 'shapeId', 'geoLocation')
          done();
      });
    });
  });