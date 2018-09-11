var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var ProfileSchema = Schema(
  {
    _id: {type: String, required: true, max: 100},
    nc_url: {type: String, required: true},
    position_qc: {type: Number, required: true},
    cycle_number: {type: Number, required: true},
    dac: {type: String, required: true, max: 100},
    date: {type: Date, required: true},
    max_pres: {type: Number, required: true}, // currently not being used by app.
    measurements: [{ pres: {type: Number, required: true},
                     temp: {type: Number, required: true},
                     psal: {type: Number, required: true},
                     cndc: {type: Number, required: false},
                     doxy: {type: Number, required: false},
                     chla: {type: Number, required: false},
                     cdom: {type: Number, required: false},
                     nitrate: {type: Number, required: false},
                     }],
    lat: {type: Number, required: true},
    lon: {type: Number, required: true},
    platform_number: {type: String, required: true, max: 100},
    geoLocation: {type: Schema.Types.Mixed, required: true},
    station_parameters: {type: Schema.Types.Array, required: true},
    PI_NAME: {type: String, required: false, max: 100},
    POSITIONING_SYSTEM: {type: String, required: false, max: 100},
    DATA_MODE: {type: String, required: false, max: 100},
    PLATFORM_TYPE: {type: String, required: false, max: 100},
    pres_max_for_TEMP: {type: Number, required: false},
    pres_max_for_PSAL: {type: Number, required: false},
    pres_min_for_TEMP: {type: Number, required: false},
    pres_min_for_PSAL: {type: Number, required: false},
    basin: {type: Number, required: false},
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Virtual for profile's URL
ProfileSchema
.virtual('url')
.get(function () {
  return '/catalog/profiles/' + this._id;
});

ProfileSchema
.virtual('jcompsPlatform')
.get(function () {
  return 'http://www.jcommops.org/board/wa/Platform?ref=' + this.platform_number
})

ProfileSchema
.virtual('ifremerProfile')
.get(function () {
  return 'http://www.ifremer.fr/co-argoFloats/cycle?detail=false&ptfCode='+this.platform_number+'&cycleNum='+this.cycle_number
})

ProfileSchema
.virtual('formatted_station_parameters')
.get(function () {
  return this.station_parameters.map(param => ' '+param)
})

ProfileSchema
.virtual('roundLat')
.get(function () {
  return this.lat.toFixed(3);
});
ProfileSchema
.virtual('roundLon')
.get(function () {
  return this.lon.toFixed(3);
});

ProfileSchema
.virtual('strLat')
.get(function () {
  let lat = this.lat;
  if (lat > 0) {
    strLat = Math.abs(lat).toFixed(3).toString() + ' N';
  }
  else {
      strLat = Math.abs(lat).toFixed(3).toString() + ' S';
  }
  return strLat
});

ProfileSchema
.virtual('strLon')
.get(function () {
  let lon = this.lon;
  if (lon > 0) {
    strLon = Math.abs(lon).toFixed(3).toString() + ' E';
  }
  else {
      strLon = Math.abs(lon).toFixed(3).toString() + ' W';
  }
  return strLon
});

// Virtual for formatted date
ProfileSchema
.virtual('date_formatted')
.get(function () {
  return moment.utc(this.date).format('YYYY-MM-DD');
});

//Export model, mongoose automatically looks for the plural of the first input. 'profiles'
module.exports = mongoose.model('profile', ProfileSchema);