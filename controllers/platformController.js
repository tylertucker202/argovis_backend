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
exports.platform_list = function(req, res) {
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
        if (err) return handleError(err);
        res.json(profile);
    });
};


// Display platform detail form on GET
exports.platform_detail = function (req, res) {
    var query = Profile.find({platform_num: req.params.platform_number});
        query.select([''])
        query.exec(function (err, platform) {
            if (err) return handleError(err);
            res.json(platform);
    });
};

