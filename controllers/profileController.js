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

    const startDate = moment(req.query.startDate, 'YYYY-MM-DD');
    const endDate = moment(req.query.endDate, 'YYYY-MM-DD');
    GJV.valid(shapeJson);
    GJV.isPolygon(shapeJson);

    var errors = req.validationErrors();
    if (errors) {
        res.send(errors)
    }
    else {
        if (req.params.format === 'map' && req.query.presRange) {
            var query = Profile.aggregate([
                {$project: { //need to include all fields that you wish to keep.
                    platform_number: 1, date: 1, geoLocation: 1, cycle_number: 1,
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
                {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
                {$project: { // return profiles with measurements
                    platform_number: 1, date: 1, geoLocation: 1, cycle_number: 1, measurements: 1,
                    count: { $size:'$measurements' },
                }},
                {$match: {count: {$gt: 0}}}
                ]);
        }
        else if (req.params.format === 'map' && !req.query.presRange) {
            var query = Profile.aggregate([
                {$project: { platform_number: 1, date: 1, geoLocation: 1, cycle_number: 1}},
                {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
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
    }
};

exports.last_profile_list = function(req, res, next) {
    var query = Profile.aggregate([{$sort: { 'date':-1}},
                       {$group: {_id: '$platform_number',
                                 'platform_number': {$first: '$platform_number'},
                                 'date': {$first: '$date'},
                                 'cycle_number': {$first: '$cycle_number'},
                                 'geoLocation': {$first: '$geoLocation'}}}]);
    if (req.params.format === 'map') {
        query.select(mapParams);
        query.limit(3000);
    }
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles)
        });
};

exports.latest_profile_list = function(req,res, next) {
    //get startDate, endDate
    startDate = moment().subtract(60, 'days');
    endDate = moment();
    var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()}});
    if (req.params.format === 'map') {
        query.limit(1000);
        query.select(mapParams);
    }
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });        

};
