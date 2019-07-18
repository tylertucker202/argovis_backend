var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GridSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    dataVal: {type: String, required: true},
    data: [{ LONGITUDE: {type: Number, required: true},
             LATITUDE: {type: Number, required: true},
             value: {type: Number, required: true},
          }],
    pres: {type: Number, required: true},
    date: {type: Date, required: true},
    cellSize: {type: Number, required: true},
    NODATA_value: {type: Number, required: true}
  },
);

module.exports = {}
module.exports.KuuselaGrid = mongoose.model('kuusela', GridSchema, 'kuusela');
module.exports.RGGrid = mongoose.model('rgTempAnom', GridSchema, 'rgTempAnom');