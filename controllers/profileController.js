var Profile = require('../models/profile');
var async = require('async');
var moment = require('moment');
//var plotly = require('plotly')("tylertucker202", "PEeUMsUu0KWp67rGT73m")

// Display list of all Profiles
exports.profile_list = function(req, res) {
    var query = Profile.find({},{});
    query.select('platform_num date date_formatted geoLocation cycle_number wrappedGeoLocations');
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

exports.platform_profiles = function(req, res) {
    var query = Profile.find({ platform_num: req.params.platform_number});
    query.select('platform_num date date_formatted geoLocation cycle_number wrappedGeoLocations');
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

// Display profile delete form on GET
exports.profile_detail = function (req, res) {
    var query = Profile.findOne({ _id: req.params._id })
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        //res.json(profile);
        res.render('profile_page', {title: req.params._id, profile: profile})
    });
};

exports.selected_profile_list = function(req, res) {
    var startDate = moment(req.query.startDate);
    var endDate = moment(req.query.endDate);
    var shape = JSON.parse(req.query.shape);

    //adjust coordinates outside 

    var shapeJson = {"type": "Polygon", "coordinates": shape}
    var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()},
                               geoLocation: {$geoWithin: {$geometry: shapeJson}}});
    query.select('_id platform_num date date_formatted geoLocation cycle_number wrappedGeoLocations');
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

exports.last_profile_list = function(req,res) {
    var query = Profile.aggregate([{$sort: { 'date':-1}},
                       {$group: {_id: '$platform_num',
                                 'platform_num': {$first: '$platform_num'},
                                 'date': {$first: '$date'},
                                 'profile_id': {$first: '$_id'},
                                 'cycle_number': {$first: '$cycle_number'},
                                 'geoLocation': {$first: '$geoLocation'}}}]);
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles)
        });
};

exports.latest_profile_list = function(req,res) {
    res.send('NOT IMPLEMENTED: Profile list');
};
