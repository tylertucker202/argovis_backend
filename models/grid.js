var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GridSchema = Schema(
  {
    _id: {type: String, required: true},
    gridName: {type: String, required: false},
    measurement: {type: String, required: true},
    units: {type: String, required: true},
    data: [{ lat: {type: Number, required: true},
             lon: {type: Number, required: true},
             value: {type: Number, required: true},
          }],
    variable: {type: String, required: false},
    date: {type: Date, required: false},
    pres: {type: Number, required: true},

    model: {type: String, required: false},
    trend: {type: String, required: false},
    param: {type: String, required: true},

    cellSize: {type: Number, required: true},
    NODATA_value: {type: Number, required: true},
  },
);

module.exports = {}
module.exports.ksTempAnom = mongoose.model('ksTempAnom', GridSchema, 'ksTempAnom');
module.exports.rgTempAnom = mongoose.model('rgTempAnom', GridSchema, 'rgTempAnom');
module.exports.rgTempTotal = mongoose.model('rgTempTotal', GridSchema, 'rgTempTotal');
module.exports.ksTempMean = mongoose.model('ksTempMean', GridSchema, 'ksTempMean')
module.exports.ksTempTotal = mongoose.model('ksTempTotal', GridSchema, 'ksTempTotal');
module.exports.ksTempParams = mongoose.model('ksTempParams', GridSchema, 'ksTempParams');
module.exports.soseDoxy = mongoose.model('soseDoxy', GridSchema, 'soseDoxy');
module.exports.soseSIarea = mongoose.model('soseSIarea', GridSchema, 'soseSIarea');