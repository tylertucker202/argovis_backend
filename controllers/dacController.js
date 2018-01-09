var Profile = require('../models/profile');
var async = require('async');


// Display float detail form on GET
exports.dac_detail = function(req, res, next) {
    res.send('NOT IMPLEMENTED: dac detail GET');
};

// Display list of all dacs
exports.dac_list = function(req, res, next) {
    var query = Profile.aggregate([
                        {$sort: { 'date':-1}},
                        {$group: {_id: '$dac',
                                 'number_of_profiles': {$sum:1},
                                 'most_recent_date': {$first: '$date'},
                                 'dac': {$first: '$dac'}
                                }, 
                        },
                        {$sort: {'number_of_profiles':-1}},

                        ]);
    query.allowDiskUse(true);
    query.exec( function (err, dacs) {
        if (err) return next(err);
        res.json(dacs);
    });
};