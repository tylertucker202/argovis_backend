var Profile = require('../models/profile');
var async = require('async');
var moment = require('moment');
//var plotly = require('plotly')("tylertucker202", "PEeUMsUu0KWp67rGT73m")

// Display list of all Profiles
exports.profile_list = function(req, res) {
    var query = Profile.find({},{});
    query.select('platform_number date date_formatted geoLocation cycle_number wrappedGeoLocations');
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

exports.platform_profiles = function(req, res) {
    //req.checkParams('platform_number', 'Platform number should be an alpha').isAlpha();
    //req.checkParams('platform_number', 'should not be empty').notEmpty();
    //req.sanitize('platform_number').escape();
    //req.sanitize('platform_number').trim();

    //var errors = req.validationErrors();

    //if (errors) {
    //   res.send('errors');
    //}
    //else {}
    var query = Profile.find({ platform_number: req.params.platform_number});
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });
    
};

// Display profile delete form on GET
exports.profile_detail = function (req, res) {
    var query = Profile.findOne({ _id: req.params._id })
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        if (req.params.format==='page'){
            res.render('profile_page', {title: req.params._id, profile: profile});
        }
        else {
            res.json(profile);
        }
    });
};

exports.selected_profile_list = function(req, res) {
    var startDate = moment(req.query.startDate, 'MM-DD-YYYY');
    var endDate = moment(req.query.endDate, 'MM-DD-YYYY');
    var shape = JSON.parse(req.query.shape);

    //adjust coordinates outside 

    var shapeJson = {"type": "Polygon", "coordinates": shape}
    var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()},
                               geoLocation: {$geoWithin: {$geometry: shapeJson}}});
    query.select('_id platform_number date date_formatted geoLocation cycle_number wrappedGeoLocations');
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

exports.last_profile_list = function(req,res) {
    var query = Profile.aggregate([{$sort: { 'date':-1}},
                       {$group: {_id: '$platform_number',
                                 'platform_number': {$first: '$platform_number'},
                                 'date': {$first: '$date'},
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
