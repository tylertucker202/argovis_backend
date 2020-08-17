const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GridSchema = Schema(
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
    chunk: {type: Number, required: false},
    cellSize: {type: Number, required: true},
    NODATA_value: {type: Number, required: true},
  },
);

const GridCoordSchema = Schema( {
  _id: { type: String, required: true },
  gridName: { type: String, required: true },
  lats: { type: [Number], required: true },
  lons: { type: [Number], required: true }
})

module.exports = {}
module.exports.ksTempAnom = mongoose.model('ksTempAnom', GridSchema, 'ksTempAnom');
module.exports.rgTempAnom = mongoose.model('rgTempAnom', GridSchema, 'rgTempAnom');
module.exports.rgTempTotal = mongoose.model('rgTempTotal', GridSchema, 'rgTempTotal');
module.exports.rgPsalAnom = mongoose.model('rgPsalAnom', GridSchema, 'rgPsalAnom');
module.exports.rgPsalTotal = mongoose.model('rgPsalTotal', GridSchema, 'rgPsalTotal');
module.exports.ksTempMean = mongoose.model('ksTempMean', GridSchema, 'ksTempMean')
module.exports.ksTempTotal = mongoose.model('ksTempTotal', GridSchema, 'ksTempTotal');
module.exports.ksTempParams = mongoose.model('ksTempParams', GridSchema, 'ksTempParams');
module.exports.soseDoxy = mongoose.model('soseDoxy', GridSchema, 'soseDoxy');
module.exports.sose_si_area_monthly = mongoose.model('sose_si_area_monthly', GridSchema, 'sose_si_area_monthly');
module.exports.sose_si_area_3_day = mongoose.model('sose_si_area_3_day', GridSchema, 'sose_si_area_3_day')
module.exports.sose_si_area_1_day = mongoose.model('sose_si_area_1_day', GridSchema, 'sose_si_area_1_day')

module.exports.grid_coords = mongoose.model('grid_coords', GridCoordSchema, 'grid_coords')
module.exports.sose_si_area_1_day_sparse = mongoose.model('sose_si_area_1_day_sparse', GridSchema, 'sose_si_area_1_day_sparse')