var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RGSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    data: [{ LONGITUDE: {type: Number, required: true},
             LATITUDE: {type: Number, required: true},
             ARGO_TEMPERATURE_ANOMALY: {type: Number, required: true},
          }],
    pres: {type: Number, required: true},
    time: {type: Number, required: true},
  },
);

module.exports = mongoose.model('rgGrid', RGSchema, 'rgGrids');
