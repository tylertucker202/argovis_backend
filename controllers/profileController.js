var Profile = require('../models/profile');
var async = require('async');
var moment = require('moment');

// Display list of all Profiles
exports.profile_list = function(req, res) {
    var query = Profile.find({},{});
    query.select('platform_num date geoLocation');
    query.exec( function (err, profile) {
        if (err) return handleError(err);
        res.json(profile);
    });
};

// Display profile delete form on GET
exports.profile_detail = function (req, res) {
    var query = Profile.findOne({ _id: req.params._id })
    query.exec( function (err, profile) {
        if (err) return handleError(err);
        res.json(profile);
    });
};

exports.selected_profile_list = function(req, res) {
    var startDate = moment(req.query.startDate);
    var endDate = moment(req.query.endDate);
    var shape = JSON.parse(req.query.shape);

    var shapeJson = {"type": "Polygon", "coordinates": shape}
    //shape = shape.replace(new RegExp('\\\\', 'g'), '')
    //var shape = JSON.stringify(req.query.shape);
    //var shape = JSON.parse(req.query.shape);
    //res.json(shapeJson);
    
    
    var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()},
                               geoLocation: {$geoWithin: {$geometry: shapeJson}}});
    query.select('platform_num date geoLocation');
    query.exec( function (err, profile) {
        if (err) return handleError(err);
        res.json(profile);
    });
    
    
    
};

exports.last_profile_list = function(req,res) {
    var query = Profile.aggregate([{$sort: { 'cycle_number':-1}},
                       {$group: {_id: '$platform_num',
                                 'platform_number': {$first: '$platform_num'},
                                 'date': {$first: '$date'},
                                 'profile_id': {$first: '$_id'},
                                 'cycle_number': {$first: '$cycle_number'},
                                 'geoLocation': {$first: '$geoLocation'}}}]);
    query.exec( function (err, profiles) {
        if (err) return handleError(err);
        res.json(profiles)
        });
};

exports.profile_selection = function(req,res) {
    //get geometric shape from url
    var shape 
    //get start date
    var startDate
    //get end date
    var endDate

    var query = Profile.aggregate({geoLocation: {$geoWithin: {shape}},
                                   date: {$gte: startDate, $lte: startDate}})
    query.exec( function (err, profiles) {
        if (err) return handleError(err);
        res.json(profiles)
    });
}
exports.latest_profile_list = function(req,res) {
    res.send('NOT IMPLEMENTED: Profile list');
};
