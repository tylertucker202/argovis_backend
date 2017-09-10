var Profile = require('../models/profile');
var async = require('async');
var moment = require('moment');
var GJV = require('geojson-validation');

// Display list of all Profiles
exports.profile_list = function(req, res, next) {
    var query = Profile.find({},{});
    query.select('platform_number date date_formatted geoLocation cycle_number wrappedGeoLocations');
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });
};

// Display profile delete form on GET
exports.profile_detail = function (req, res, next) {

    req.checkParams('_id', 'Profile id should be specified.').notEmpty();
    var errors = req.validationErrors();
    req.sanitize('_id').escape();

    if (errors) {
        res.send(errors)
    }
    else {
        var query = Profile.findOne({ _id: req.params._id })
        query.exec( function (err, profile) {
            if (err) { return next(err); }
            if (req.params.format==='page'){
                if (profile === null) { res.send('profile not found'); }
                else {
                    res.render('profile_page', {title: req.params._id, profile: profile});
                }
            }
            else {
                res.json(profile);
            }
        });        
    }
};

exports.selected_profile_list = function(req, res , next) {

    req.checkQuery('startDate', 'startDate should be specified.').notEmpty();
    req.checkQuery('endDate', 'endDate should be specified.').notEmpty();
    req.checkQuery('shape', 'shape should not be empty.').notEmpty(); 

    req.sanitize('_id').escape();
    req.sanitize('startDate').toDate();
    req.sanitize('endDate').toDate();

    var shape = JSON.parse(req.query.shape);
    const shapeJson = {"type": "Polygon", "coordinates": shape}
    GJV.valid(shapeJson);
    GJV.isPolygon(shapeJson);

    var errors = req.validationErrors();
    if (errors) {
        res.send(errors)
    }
    else {
        var startDate = moment(req.query.startDate, 'YYYY-MM-DD');
        var endDate = moment(req.query.endDate, 'YYYY-MM-DD');

        var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()},
                                   geoLocation: {$geoWithin: {$geometry: shapeJson}}});
        //query.select('_id platform_number date date_formatted geoLocation cycle_number wrappedGeoLocations');
        query.exec( function (err, profile) {
            if (err) { return next(err); }
            res.json(profile);
        });        
    }
};

exports.last_profile_list = function(req, res, next) {
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
