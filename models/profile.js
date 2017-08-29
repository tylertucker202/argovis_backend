var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var ProfileSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    nc_url: {type: String, required: true},
    position_qc: {type: String, required: true},
    cycle_number: {type: String, required: true},
    dac: {type: String, required: true, max: 100},
    date: {type: Date, required: true},
    measurements: {type: Schema.Types.Mixed, required: true},
    lat: {type: Number, required: true},
    lon: {type: Number, required: true},
    platform_number: {type: String, required: true, max: 100},
    geoLocation: {type: Schema.Types.Mixed, required: true}
  },
);

// Virtual for profile's URL
ProfileSchema
.virtual('url')
.get(function () {
  return '/catalog/profiles/' + this._id;
});

// Virtual for formatted date
ProfileSchema
.virtual('date_formatted')
.get(function () {
  return moment(this.date).format('YYYY-MM-DD');
});

//Export model, mongoose automatically looks for the plural of the first input. 'profiles'
module.exports = mongoose.model('profile', ProfileSchema);