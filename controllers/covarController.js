var CovarExports = require('../models/covar');
var GJV = require('geojson-validation');

exports.radius_selection = function(req, res , next) {

    req.checkQuery('lat', 'lat should be specified.').notEmpty();
    req.checkQuery('lon', 'lon should be specified.').notEmpty();
    req.checkQuery('lat', 'lat should be a number.').isNumeric();
    req.checkQuery('lon', 'lon should be a number.').isNumeric();
    req.sanitize('forcast').escape();
    req.sanitize('forcast').trim();
    req.sanitize('lat').escape();
    req.sanitize('lat').trim();
    req.sanitize('lon').escape();
    req.sanitize('lon').trim();

     if(req.params.forcast === undefined) {
         forcast = req.params.forcast
         if (forcast == '60days') {
            Covar = CovarExports.shortCovar
         }
         else if (forcast == '140days') {
            Covar = CovarExports.longCovar
         }
         else {
            Covar = CovarExports.shortCovar
         }
     }
     else {
         Covar = CovarExports.shortCovar
     }

    let lat = JSON.parse(req.params.lat)
    let lon = JSON.parse(req.params.lon)

    point = {'type': 'Point', 'coordinates': [lat, lon]}
    GJV.valid(point);
    GJV.isPoint(point);


    var query = Covar.findOne({geoLocation: {
                                $near: {
                                    $geometry: point,
                                    //$maxDistance: radius
                                }
                            }
                            })

    query.exec(function (err, covars) {
        if (err) return next(err);
        res.json(covars);
    })
}