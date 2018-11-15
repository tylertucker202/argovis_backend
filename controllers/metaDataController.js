var Profile = require('../models/profile');
var moment = require('moment');
var config = require('config');
exports.month_year_profile_list = function(req, res, next) {
    req.checkQuery('month', 'month should be specified.').notEmpty();
    req.checkQuery('year', 'year should be specified.').notEmpty();
    req.checkQuery('year', 'year should be four digit number.').isNumeric();
    req.checkQuery('month', 'month should be two digit number.').isNumeric();
    req.sanitize('month').escape();
    req.sanitize('month').trim();
    req.sanitize('year').escape();
    req.sanitize('year').trim();

    const year = JSON.parse(req.params.year);
    const month = JSON.parse(req.params.month);
    const startDate = moment.utc(year + '-' + month + '-' + 01,'YYYY-MM-DD');
    const endDate = startDate.clone().endOf('month');
    const query = Profile.aggregate([
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$unwind: "$measurements"},
        {$group: {   _id: "$_id",
                     platform_number: { "$first": "$platform_number"},
                     date:  { "$first": "$date"},
                     date_qc: { "$first": "$date_qc"},
                     containsBGC: { "$first": "$containsBGC"},
                     PI_NAME: {"$first": "$PI_NAME"},
                     cycle_number:  { "$first": "$cycle_number"},
                     lat:  { "$first": "$lat"},
                     lon:  { "$first": "$lon"},
                     position_qc: {"$first": "$position_qc"},
                     PLATFORM_TYPE:  { "$first": "$PLATFORM_TYPE"},
                     POSITIONING_SYSTEM:  { "$first": "$POSITIONING_SYSTEM"},
                     DATA_MODE:  { "$first": "$DATA_MODE"},
                     station_parameters: { "$first": "$station_parameters"},
                     VERTICAL_SAMPLING_SCHEME: { "$first": "$VERTICAL_SAMPLING_SCHEME"},
                     STATION_PARAMETERS_inMongoDB: { "$first": "$station_parameters"},
                     cycle_number:  { "$first": "$cycle_number"},
                     dac:  { "$first": "$dac"},
                     pres_max_for_TEMP: { "$first": "$pres_max_for_TEMP"},
                     pres_min_for_TEMP: { "$first": "$pres_min_for_TEMP"},
                     pres_max_for_PSAL: { "$first": "$pres_max_for_PSAL"},
                     pres_min_for_PSAL: { "$first": "$pres_min_for_PSAL"},
                     basin: { "$first": "$basin"}
                    },
        },
        {$sort: { date: -1}},
    ]);
    const promise = query.exec();
    promise.then(function (profiles) {
        res.json(profiles);
    })
    .catch(function(err) { return next(err)});
}

exports.last_profile_list = function(req, res, next) {
    //get startDate, endDate
    const ENV = config.util.getEnv('NODE_ENV');
    const appStartDate = config.startDate[ENV];
    if (appStartDate === 'today'){
        startDate = moment.utc().subtract(30, 'days');
        endDate = moment.utc();      
    }
    else {
        startDate = moment.utc(appStartDate).subtract(30, 'days');
        endDate = moment.utc(appStartDate);
    }
    var query = Profile.aggregate([
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$group: {_id: '$platform_number',
                    'platform_number': {$first: '$platform_number'},
                    'date': {$first: '$date'},
                    'cycle_number': {$first: '$cycle_number'},
                    'geoLocation': {$first: '$geoLocation'},
                    'DATA_MODE': {$first: '$DATA_MODE'},
                    'containsBGC': { $first: "$containsBGC"}
                    }
        },
        {$limit : 500 },
        {$sort: { 'date': -1}}
    ]);
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles)
        });
};

exports.latest_profile_list = function(req,res, next) {
    //get startDate, endDate
    const ENV = config.util.getEnv('NODE_ENV');
    const appStartDate = config.startDate[ENV];
    if (appStartDate === 'today'){
        startDate = moment.utc().subtract(7, 'days');
        endDate = moment.utc();      
    }
    else {
        startDate = moment.utc(appStartDate).subtract(7, 'days');
        endDate = moment.utc(appStartDate);
    }
    var query = Profile.aggregate([ 
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$sort: {'platform_number': -1, 'date': -1}},
        {$group: {_id: '$platform_number',
                'platform_number': {$first: '$platform_number'},
                'date': {$first: '$date'},
                'cycle_number': {$first: '$cycle_number'},
                'geoLocation': {$first: '$geoLocation'},
                'DATA_MODE': {$first: '$DATA_MODE'},
                'containsBGC': { $first: "$containsBGC"}
                }
        },
        {$limit : 500 }
    ]);
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });
};

exports.last_three_days = function(req,res, next) {

    if(req.params.startDate) { 
        console.log('there is a date'); 
        var endDate = moment.utc(req.params.startDate, 'YYYY-MM-DD');
        var startDate= moment.utc(req.params.startDate, 'YYYY-MM-DD').subtract(3, 'days')
        console.log(startDate)
        console.log(endDate)
    }
    else {

        const ENV = config.util.getEnv('NODE_ENV');
        const appStartDate = config.startDate[ENV];
        if (appStartDate === 'today'){
            var startDate = moment.utc().subtract(3, 'days');
            var endDate = moment.utc();      
        }
        else {
            var startDate = moment.utc(appStartDate).subtract(3, 'days');
            var endDate = moment.utc(appStartDate);
        }
    }
    var query = Profile.aggregate([
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$sort: {'platform_number': -1, 'date': -1}},
        {$group: {_id: '$platform_number',
                'platform_number': {$first: '$platform_number'},
                'date': {$first: '$date'},
                'cycle_number': {$first: '$cycle_number'},
                'geoLocation': {$first: '$geoLocation'},
                'DATA_MODE': {$first: '$DATA_MODE'},
                'containsBGC': { $first: "$containsBGC"}
                }
            },
    ]);
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });
};