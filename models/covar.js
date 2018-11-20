var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CovarSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    prob: {type: Number, required: true},
    geoLocation: {type: Schema.Types.Mixed, required: true}
  },{}
  );

  module.exports = mongoose.model('covar', CovarSchema);