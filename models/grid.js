var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GridSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    gridName: {type: String, required: false},
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
module.exports.ksSpaceTempNoTrend = mongoose.model('ksSpaceTempNoTrend', GridSchema, 'ksSpaceTempNoTrend');
module.exports.ksSpaceTempTrend = mongoose.model('ksSpaceTempTrend', GridSchema, 'ksSpaceTempTrend');
module.exports.ksSpaceTempTrend2 = mongoose.model('ksSpaceTempTrend2', GridSchema, 'ksSpaceTempTrend2');
module.exports.ksSpaceTimeTempNoTrend = mongoose.model('ksSpaceTimeTempNoTrend', GridSchema, 'ksSpaceTempNoTrend');
module.exports.ksSpaceTimeTempTrend = mongoose.model('ksSpaceTimeTempTrend', GridSchema, 'ksSpaceTimeTempTrend');
module.exports.ksSpaceTimeTempTrend2 = mongoose.model('ksSpaceTimeTempTrend2', GridSchema, 'ksSpaceTimeTempTrend2');
module.exports.rgTempAnom = mongoose.model('rgTempAnom', GridSchema, 'rgTempAnom');