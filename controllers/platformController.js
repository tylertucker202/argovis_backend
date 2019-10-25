var Profile = require('../models/profile');
var async = require('async');
var moment = require('moment');

//station_parameters, lat, lon are needed for virtural fields
const mapParams = 'platform_number date geoLocation cycle_number station_parameters lat lon DATA_MODE containsBGC isDeep DIRECTION';

const platformAggregate = {_id: '$platform_number',
                        'platform_number': {$first: '$platform_number'},
                        'most_recent_date': {$first: '$date'},
                        'number_of_profiles': {$sum: 1},
                        'cycle_number': {$first: '$cycle_number'},
                        'geoLocation': {$first: '$geoLocation'}, 
                        'dac': {$first: '$dac'}}

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
                       {$group: platformAggregate}
    ]);
    query.exec( function (err, profile) {
        if (err) return next(err);
        res.json(profile);
    });
};

// Display platform detail form on GET
exports.platform_detail = function (req, res, next) {
    req.sanitize('platform_number').escape();
    req.sanitize('platform_number').trim();
    //req.sanitize('platform_number').toNumber();

    req.checkQuery('platform_number', 'platform_number should be numeric.').isNumeric();

    const platform_number = JSON.parse(req.params.platform_number)

    const query = Profile.find({platform_number: platform_number});

    if (req.params.format==='page'){ // bgc not needed for page view
        query.select('-bgcMeas')
    }

    query.sort({date: -1});
    if (req.params.format==='map') {
        query.select(mapParams);
    }
    
    query.exec(function (err, profiles) {
        if (err) return next(err);

        if (req.params.format==='page'){
            if (profiles.length === 0) { res.send('platform not found'); }
            else {
                res.render('platform_page', {title:req.params.platform_number, profiles: JSON.stringify(profiles), moment: moment })
            }
        }
        else if (req.params.format==='page2'){
            if (profiles.length === 0) { res.send('platform not found'); }
            else {
                res.render('platform_page_2', {title:req.params.platform_number, profiles: JSON.stringify(profiles), moment: moment })
            }
        }
        else if (req.params.format==='devpage'){
            if (profiles.length === 0) { res.send('platform not found'); }
            else {
                res.render('platform_page_dev', {title:req.params.platform_number, profiles: JSON.stringify(profiles), moment: moment })
            }
        }
        else if (req.params.format==='devpage2'){
            if (profiles.length === 0) { res.send('platform not found'); }
            else {
                res.render('platform_page_2_dev', {title:req.params.platform_number, profiles: JSON.stringify(profiles), moment: moment })
            }
        }
        else if (req.params.format==='bgcPage'){
            if (profiles.length === 0) { res.send('platform not found'); }
            else {
                res.render('bgc_platform_page', {title:req.params.platform_number, profiles: JSON.stringify(profiles), moment: moment })
            }
        }
        else{
            if (profiles.length === 0) { res.send('platform not found'); }
            else {
                res.json(profiles)
            }
        }
    });
};
