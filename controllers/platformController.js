var Profile = require('../models/profile');
var async = require('async');

// Display list of all platforms
exports.index = function(req, res) {   
    async.parallel({
        profile_count: function(callback) {
            Profile.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Argo Selection Home', error: err, data: results });
    });
};

// Display db detail form on GET
exports.db_list = function(req, res) {
    res.send('NOT IMPLEMENTED: db show');
};

// Display list of all platforms
exports.platform_list = function(req, res, next) {
    var query = Profile.aggregate([
                       {$sort: { 'date':-1}},
                       {$group: {_id: '$platform_number',
                                 'platform_number': {$first: '$platform_number'},
                                 'most_recent_date': {$first: '$date'},
                                 'number_of_profiles': {$sum: 1},
                                 'cycle_number': {$first: '$cycle_number'},
                                 'geoLocation': {$first: '$geoLocation'}, 
                                 'dac': {$first: '$dac'}}}
    ]);
    query.exec( function (err, profile) {
        if (err) return next(err);
        res.json(profile);
    });
};

// Display platform detail form on GET
exports.platform_detail = function (req, res, next) {
    req.checkParams('platform_number', 'platform_number should be specified.').notEmpty();
    req.sanitize('platform_number').escape();

    var errors = req.validationErrors();
    if (errors) {
        res.send(errors)
    }
    else {
        var query = Profile.find({platform_number: req.params.platform_number});
        query.exec(function (err, profiles) {
            if (err) return next(err);
            if (req.params.format==='page'){
                if (profiles.length === 0) { res.send('platform not found'); }
                else {
                    res.render('platform_page', {title:req.params.platform_number, profiles: JSON.stringify(profiles) })
                }
            }
            else{
                res.json(profiles)
            }
        });
    }
};