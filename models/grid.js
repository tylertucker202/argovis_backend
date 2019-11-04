var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GridSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    gridName: {type: String, required: false},
    measurement: {type: String, required: true},
    units: {type: String, required: true},
    param: {type: String, required: true},
    data: [{ lat: {type: Number, required: true},
             lon: {type: Number, required: true},
             value: {type: Number, required: true},
          }],
    variable: {type: String, required: true},
    pres: {type: Number, required: true},
    date: {type: Date, required: true},
    cellSize: {type: Number, required: true},
    NODATA_value: {type: Number, required: true},
    trend: {type: String, required: true}
  },
);

module.exports = {}
module.exports.ksTempAnom = mongoose.model('ksTempAnom', GridSchema, 'ksTempAnom');
module.exports.rgTempAnom = mongoose.model('rgTempAnom', GridSchema, 'rgTempAnom');
module.exports.ksTempMean = mongoose.model('ksTempMean', GridSchema, 'ksTempMean')