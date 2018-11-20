var Covar = require('../models/covar');
var GJV = require('geojson-validation');

exports.radius_selection = function(req, res , next) {

    req.checkQuery('lat', 'lat should be specified.').notEmpty();
    req.checkQuery('lon', 'lon should be specified.').notEmpty();
    req.checkQuery('lat', 'lat should be a number.').isNumeric();
    req.checkQuery('lon', 'lon should be a number.').isNumeric();
    req.sanitize('lat').escape();
    req.sanitize('lat').trim();
    req.sanitize('lon').escape();
    req.sanitize('lon').trim();

    if(req.params.radius) {
        var radius = JSON.parse(req.params.radius)
    }
    else {
        var radius = 100000;
    }

    let lat = JSON.parse(req.params.lat)
    let lon = JSON.parse(req.params.lon)

    point = {'type': 'Point', 'coordinates': [lat, lon]}
    GJV.valid(point);
    GJV.isPoint(point);

    var query = Covar.find({geoLocation: {
                                $near: {
                                    $geometry: point,
                                    $maxDistance: radius
                                }
                            }
                            })

    query.exec(function (err, covars) {
        if (err) return next(err);
        res.json(covars);
    })
}