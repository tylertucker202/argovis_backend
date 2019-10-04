const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParamSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    gridName: {type: String, required: true},
    model: {type: String, required: true},
    param: {type: String, required: true},
    trend: {type: String, required: true},
    measurement: {type: String, required: true},
    dataVal: {type: String, required: true},
    data: [{ LONGITUDE: {type: Number, required: true},
             LATITUDE: {type: Number, required: true},
             value: {type: Number, required: true},
          }],
    pres: {type: Number, required: true},
    cellSize: {type: Number, required: true},
    NODATA_value: {type: Number, required: true}
  },
);


module.exports = mongoose.model('ksParams', ParamSchema, 'ksParams');