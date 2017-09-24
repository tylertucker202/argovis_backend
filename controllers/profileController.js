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
        if (req.params.format==='map') {
            query.select(mapParams);
        }
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
    //req.checkQuery('maxPres', 'maxPres should not be empty.').notEmpty(); 

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
        const startDate = moment(req.query.startDate, 'YYYY-MM-DD');
        const endDate = moment(req.query.endDate, 'YYYY-MM-DD');

        if (req.query.maxPres) {
            const maxPres = req.query.maxPres;
            console.log('maxPres');
            console.log(maxPres);
            var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()},
            geoLocation: {$geoWithin: {$geometry: shapeJson}},
            //maximum_pressure: {$gte: maxPres}
        });

        }
        else {
            var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()},
            geoLocation: {$geoWithin: {$geometry: shapeJson}}});
        }
        if (req.params.format === 'map') {
            query.select(mapParams);
        }
        query.exec( function (err, profiles) {
            if (err) { return next(err); }
            if (req.params.format==='page'){
                if (profiles === null) { res.send('profile not found'); }
                else {
                    res.render('platform_page', {title:'Custom selection', profiles: JSON.stringify(profiles) })
                }
            }
            else {
                res.json(profiles);
            }
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
    if (req.params.format === 'map') {
        query.select(mapParams);
    }
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles)
        });
};

exports.latest_profile_list = function(req,res) {
    //get startDate, endDate
    startDate = moment().subtract(15, 'days');
    endDate = moment();
    var query = Profile.find({ date: {$lte: endDate.toDate(), $gte: startDate.toDate()}});
    if (req.params.format === 'map') {
        query.select(mapParams);
    }
    query.exec( function (err, profile) {
        if (err) { return next(err); }
        res.json(profile);
    });        

};
