var Profile = require('../models/profile');
var async = require('async');

// Display float detail form on GET
exports.dac_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: dac detail GET');
};

// Display list of all dacs
exports.dac_list = function(req, res) {
    var query = Profile.aggregate([
                        {$sort: { 'date':-1}},
                        {$group: {_id: '$dac',
                                 'number_of_profiles': {$sum:1},
                                 'most_recent_date': {$first: '$date'},
                                 'dac': {$first: '$dac'}
                                }
                        }
    ]);
    query.exec( function (err, dacs) {
        if (err) return handleError(err);
        res.json(dacs);
    });
};