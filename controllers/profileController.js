var Profile = require('../models/profile');
var async = require('async');
var moment = require('moment');
var GJV = require('geojson-validation');

const mapParams = 'platform_number date geoLocation cycle_number';

// Display list of all Profiles
exports.profile_list = function(req, res, next) {
    var query = Profile.find({},{});
    query.select(mapParams);
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

exports.month_year_profile_list = function(req, res, next) {
    req.checkQuery('month', 'month should be specified.').notEmpty();
    req.checkQuery('year', 'year should be specified.').notEmpty();
    req.checkQuery('year', 'year should be four digit number.').isNumeric();
    req.checkQuery('month', 'month should be two digit number.').isNumeric();
    req.sanitize('month').escape();
    req.sanitize('month').trim();
    req.sanitize('year').escape();
    req.sanitize('year').trim();

    const year = JSON.parse(req.params.year);
    const month = JSON.parse(req.params.month);
    const startDate = moment.utc(year + '-' + month + '-' + 01,'YYYY-MM-DD');
    const endDate = startDate.clone().endOf('month');
    const query = Profile.aggregate([
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$unwind: "$measurements"},
        {$group: {   _id: "$_id",
                     platform_number: { "$first": "$platform_number"},
                     date:  { "$first": "$date"},
                     geo2DLocation: { "$first": "$geo2DLocation"},
                     cycle_number:  { "$first": "$cycle_number"},
                     PLATFORM_TYPE:  { "$first": "$PLATFORM_TYPE"},
                     POSITIONING_SYSTEM:  { "$first": "$POSITIONING_SYSTEM"},
                     DATA_MODE:  { "$first": "$DATA_MODE"},
                     station_parameters:  { "$first": "$station_parameters"},
                     cycle_number:  { "$first": "$cycle_number"},
                     dac:  { "$first": "$dac"},
                     maxPres: {"$max": "$measurements.pres"},
                     minPres: {"$min": "$measurements.pres"},
                     maxTemp: {"$max": "$measurements.temp"},
                     minTemp: {"$min": "$measurements.temp"},
                     maxPsal: {"$max": "$measurements.psal"},
                     minPsal: {"$min": "$measurements.psal"}
                    },
        },   
    ]);
    const promise = query.exec();
    promise.then(function (profiles) {
        res.json(profiles);
    })
    .catch(function(err) { return next(err)});
}

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
                    res.render('profile_page', {title: req.params._id, profile: profile, platform_number: profile.platform_number, moment: moment});
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
    var shapeJson = {"type": "Polygon", "coordinates": shape}
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
        if (req.params.format === 'map' && req.query.presRange) {
            var query = Profile.aggregate([
                {$project: { //need to include all fields that you wish to keep.
                    platform_number: -1, date: -1, geoLocation: 1, cycle_number: -1,
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
                { $match: { $and: [ {geoLocation: {$geoWithin: {$geometry: shapeJson}}},
                                    {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} ] } },
                {$project: { // return profiles that have measurements falling within pressure Ranges
                    platform_number: -1, date: -1, geoLocation: 1, cycle_number: -1, measurements: 1,
                    count: { $size:'$measurements' },
                }},
                {$match: {count: {$gt: 0}}},
                {$project: { // only need these fields to plot on map.
                    platform_number: -1, date: -1, geoLocation: 1, cycle_number: -1
                }},
                {$limit: 1001},
                ]);
        }
        else if (req.params.format === 'map' && !req.query.presRange) {
            var query = Profile.aggregate([
                {$project: { platform_number: -1, date: -1, geoLocation: 1, cycle_number: -1}},
                { $match: { $and: [ {geoLocation: {$geoWithin: {$geometry: shapeJson}}},
                    {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} ] } },
                {$limit: 1001},
            ]);
        }
        else if (req.params.format !== 'map' && req.query.presRange) {
            var query = Profile.aggregate([
                {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
                {$project: { //need to include all fields that you wish to keep.
                    nc_url: 1,
                    position_qc: 1,
                    cycle_number: 1,
                    dac: 1,
                    date:1,
                    lat: 1,
                    lon: 1,
                    platform_number: 1,
                    geoLocation: 1,
                    station_parameters: 1,
                    maximum_pressure: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    PLATFORM_TYPE: 1,
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
                    _id: 1,
                    nc_url: 1,
                    position_qc: 1,
                    cycle_number: 1,
                    dac: 1,
                    date:1,
                    lat: 1,
                    lon: 1,
                    platform_number: 1,
                    geoLocation: 1,
                    station_parameters: 1,
                    maximum_pressure: 1,
                    measurements: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    PLATFORM_TYPE: 1,
                    count: { $size:'$measurements' },
                }},
                {$match: {count: {$gt: 0}}}
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
                }
            

            //render page
            if (req.params.format==='page'){
                if (profiles === null) { res.send('profile not found'); }
                else {
                    res.render('selected_profile_page_collated', {title:'Custom selection', profiles: JSON.stringify(profiles), moment: moment, url: req.originalUrl })
                }
            }
            else {
                res.json(profiles);
            }
        })
        .catch(function(err) { return next(err)})
    }})
};

// exports.last_profile_list = function(req, res, next) {
//     var query = Profile.aggregate([
//                        {$group: {_id: '$platform_number',
//                                  'platform_number': {$first: '$platform_number'},
//                                  'date': {$first: '$date'},
//                                  'cycle_number': {$first: '$cycle_number'},
//                                  'geoLocation': {$first: '$geoLocation'}}},
//                                  {$sort: { 'date': -1}}]);
//     if (req.params.format === 'map') {
//         //query.select(mapParams);
//         //query.limit(1000);
//     }
//     query.exec( function (err, profiles) {
//         if (err) { return next(err); }
//         res.json(profiles)
//         });
// };

exports.latest_profile_list = function(req,res, next) {
    //get startDate, endDate
    startDate = moment.utc().subtract(7, 'days');
    endDate = moment.utc();
    var query = Profile.aggregate([ {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
                                    {$sort: {'platform_number': -1, 'date': -1}},
                                    {$group: {_id: '$platform_number',
                                            'platform_number': {$first: '$platform_number'},
                                            'date': {$first: '$date'},
                                            'cycle_number': {$first: '$cycle_number'},
                                            'geoLocation': {$first: '$geoLocation'}}},
                                    ]);
    if (req.params.format === 'map') {
        //query.limit(1000);
        //query.select(mapParams);
    }
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });        

};
