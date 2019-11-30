const Covar = require('../models/covar');
const GJV = require('geojson-validation');

exports.radius_selection = function(req, res , next) {

    req.checkQuery('lat', 'lat should be specified.').notEmpty();
    req.checkQuery('lon', 'lon should be specified.').notEmpty();
    req.checkQuery('forcastDays', 'forcastDays should be specified.').notEmpty();
    req.checkQuery('lat', 'lat should be a number.').isNumeric();
    req.checkQuery('lon', 'lon should be a number.').isNumeric();
    req.checkQuery('forcastDays', 'forcastDays should be a number.').isNumeric();
    req.sanitize('forcastDays').escape();
    req.sanitize('forcastDays').trim();
    req.sanitize('lat').escape();
    req.sanitize('lat').trim();
    req.sanitize('lon').escape();
    req.sanitize('lon').trim();



    let lat = JSON.parse(req.params.lat)
    let lon = JSON.parse(req.params.lon)
    let forcastDays = JSON.parse(req.params.forcastDays)

    point = {'type': 'Point', 'coordinates': [lat, lon]}
    GJV.valid(point);
    GJV.isPoint(point);

    const query = Covar.findOne({forcastDays: forcastDays, geoLocation: {
                                $near: {
                                    $geometry: point,
                                    //$maxDistance: radius
                                }
                            }
                            });
    query.exec(function (err, covars) {
        if (err) return next(err);
        res.json(covars);
    })
}