var Profile = require('../models/profile');
var moment = require('moment');
var GJV = require('geojson-validation');

//station_parameters, lat, lon are needed for virtural fields
const mapParams = 'platform_number date geoLocation cycle_number station_parameters lat lon DATA_MODE containsBGC isDeep DIRECTION';

const mapProj = {platform_number: -1,
    date: -1,
    geoLocation: 1,
    cycle_number: -1,
    DATA_MODE: -1,
    containsBGC: 1,
    isDeep: 1,
    DIRECTION: 1,
    }

const mapProjWithCount = {platform_number: -1,
                date: -1,
                geoLocation: 1,
                cycle_number: -1,
                DATA_MODE: -1,
                containsBGC: 1,
                isDeep: 1,
                count: { $size:'$measurements' },
                DIRECTION: 1,
                }


// Display list of all Profiles
exports.profile_list = function(req, res, next) {
    var query = Profile.find({},{});
    query.select(mapParams);
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

exports.profile_detail = function (req, res, next) {
    req.checkParams('_id', 'Profile id should be specified.').notEmpty();
    var errors = req.validationErrors();
    req.sanitize('_id').escape();

    if (errors) {
        res.send(errors)
    }
    else {
        var query = Profile.findOne({ _id: req.params._id })
        if (req.params.format==='map') {
            query.select(mapParams);
        }
        var promise = query.exec();
        promise
        .then(function (profile) {
            if (req.params.format==='page'){
                if (profile === null) { res.send('profile not found'); }
                else {
                    profileDate = moment.utc(profile.date).format('YYYY-MM-DD HH:mm')
                    res.render('profile_page', {title: req.params._id, profile: profile, platform_number: profile.platform_number, profileDate: profileDate});
                }
            }
            else if (req.params.format==='bgcPage'){
                if (profile === null) { res.send('profile not found'); }
                if (profile.bgcMeas === null) { res.send('profile does not have bgc'); }
                else {
                    keys = Object.keys(profile.bgcMeas[0].toObject());
                    paramKeys = keys.filter(s=>!s.includes('_qc'))
                    //paramKeys = Object.keys(profile.bgcMeas[0].toObject());
                    //paramKeys = paramKeys.map(x => ' '+x)
                    profileDate = moment.utc(profile.date).format('YYYY-MM-DD HH:mm')
                    res.render('bgc_profile_page', {title: req.params._id, profile: profile, platform_number: profile.platform_number, paramKeys: paramKeys, profileDate: profileDate});
                }
            }
            else {
                res.json(profile);
            }
        })
        .catch(function(err) { return next(err)})
    }
};

exports.selected_profile_list = function(req, res , next) {
    req.checkQuery('startDate', 'startDate should be specified.').notEmpty();
    req.checkQuery('endDate', 'endDate should be specified.').notEmpty();
    req.checkQuery('shape', 'shape should be specified.').notEmpty();
    req.sanitize('presRange').escape();
    req.sanitize('presRange').trim();
    req.sanitize('_id').escape();
    req.sanitize('startDate').toDate();
    req.sanitize('endDate').toDate();

    const shape = JSON.parse(req.query.shape);
    var shapeJson = {'type': 'Polygon', 'coordinates': shape}
    if (req.query.presRange) {
        var presRange = JSON.parse(req.query.presRange);
        var maxPres = Number(presRange[1]);
        var minPres = Number(presRange[0]);
    }

    const startDate = moment.utc(req.query.startDate, 'YYYY-MM-DD');
    const endDate = moment.utc(req.query.endDate, 'YYYY-MM-DD');
    GJV.valid(shapeJson);
    GJV.isPolygon(shapeJson);

    req.getValidationResult().then(function (result) {
    if (!result.isEmpty()) {
        var errors = result.array().map(function (elem) {
            return elem.msg;
        });
        res.render('error', { errors: errors });
    }
    else {
        if (req.params.format === 'map' && presRange) {
            var query = Profile.aggregate([
                {$project: { //need to include all fields that you wish to keep.
                    platform_number: -1,
                    date: -1,
                    geoLocation: 1,
                    cycle_number: -1,
                    containsBGC: 1,
                    isDeep: 1,
                    DIRECTION: 1,
                    measurements: {
                        $filter: {
                            input: '$measurements',
                            as: 'item',
                            cond: {
                                $and: [
                                    {$gt: ['$$item.pres', minPres]},
                                    {$lt: ['$$item.pres', maxPres]}
                                ]},
                        },
                    },
                    DATA_MODE: -1,
                }},
                { $match: { $and: [ {geoLocation: {$geoWithin: {$geometry: shapeJson}}},
                                    {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} ] } },
                {$project: mapProjWithCount},
                {$match: {count: {$gt: 0}}},
                {$project: mapProj},
                {$limit: 1001},
                ]);
        }
        else if (req.params.format === 'map' && !presRange) {
            var query = Profile.aggregate([
                {$project: mapProj},
                { $match: { $and: [ {geoLocation: {$geoWithin: {$geometry: shapeJson}}},
                    {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} ] } },
                {$limit: 1001},
            ]);
        }
        else if (req.params.format !== 'map' && presRange) {
            var query = Profile.aggregate([
                {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
                {$project: { //need to include all fields that you wish to keep.
                    platform_number: 1,
                    date:  1,
                    date_qc: 1,
                    containsBGC: 1,
                    isDeep: 1,
                    PI_NAME: 1,
                    cycle_number: 1,
                    lat: 1,
                    lon: 1,
                    position_qc: 1,
                    PLATFORM_TYPE: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    station_parameters: 1,
                    VERTICAL_SAMPLING_SCHEME: 1,
                    STATION_PARAMETERS_inMongoDB: 1,
                    WMO_INST_TYPE: 1,
                    cycle_number: 1,
                    dac: 1,
                    basin: 1,
                    nc_url: 1,
                    geoLocation: 1,
                    station_parameters: 1,
                    maximum_pressure: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    PLATFORM_TYPE: 1,
                    DIRECTION: 1,
                    measurements: {
                        $filter: {
                            input: '$measurements',
                            as: 'item',
                            cond: { 
                                $and: [
                                    {$gt: ['$$item.pres', minPres]},
                                    {$lt: ['$$item.pres', maxPres]}
                                ]},
                        },
                    },
                }},
                {$project: { // return profiles with measurements
                    platform_number: 1,
                    date:  1,
                    date_qc: 1,
                    containsBGC: 1,
                    isDeep: 1,
                    PI_NAME: 1,
                    cycle_number: 1,
                    lat: 1,
                    lon: 1,
                    position_qc: 1,
                    PLATFORM_TYPE: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    station_parameters: 1,
                    VERTICAL_SAMPLING_SCHEME: 1,
                    STATION_PARAMETERS_inMongoDB: 1,
                    WMO_INST_TYPE: 1,
                    cycle_number: 1,
                    dac: 1,
                    basin: 1,
                    nc_url: 1,
                    geoLocation: 1,
                    station_parameters: 1,
                    maximum_pressure: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    measurements: 1,
                    count: { $size:'$measurements' },
                }},
                {$match: {count: {$gt: 0}}},
                {$sort: { date: -1}},
                ]);
        }
        else {
            var query = Profile.aggregate([
                {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}}]);
        }
        var promise = query.exec();
        promise
        .then(function (profiles) {
            //create virtural fields.
            for(var idx=0; idx < profiles.length; idx++){
                let lat = profiles[idx].lat;
                let lon = profiles[idx].lon;
                profiles[idx].roundLat = Number(lat).toFixed(3);
                profiles[idx].roundLon = Number(lon).toFixed(3);

                if (lat > 0) {
                    profiles[idx].strLat = Math.abs(lat).toFixed(3).toString() + ' N';
                }
                else {
                    profiles[idx].strLat = Math.abs(lat).toFixed(3).toString() + ' S';
                }
                if (lon > 0) {
                    profiles[idx].strLon = Math.abs(lon).toFixed(3).toString() + ' E';
                }
                else {
                    profiles[idx].strLon = Math.abs(lon).toFixed(3).toString() + ' W';
                }
                if (profiles[idx].station_parameters) {
                    let station_parameters = profiles[idx].station_parameters
                    profiles[idx].formatted_station_parameters = station_parameters.map(param => ' '+param)
                }
                }

            //render page
            if (req.params.format==='page'){
                if (profiles === null) { res.send('profile not found'); }
                else {
                    res.render('selected_profile_page', {title:'Custom selection', profiles: JSON.stringify(profiles), moment: moment, url: req.originalUrl })
                }
            }
            else {
                res.json(profiles);
            }
        })
        .catch(function(err) { return next(err)})
    }})
};