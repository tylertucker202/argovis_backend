var Profile = require('../models/profile');
var moment = require('moment');
var config = require('config');

const mapMetaAggregate = {_id: '$platform_number',
    'platform_number': 1,
    'date': 1,
    'cycle_number': 1,
    'geoLocation': 1,
    'DATA_MODE': 1,
    'containsBGC': 1,
    'isDeep': 1,
    'DIRECTION': 1
    }

const monthYearAggregate = {_id: 1,
    platform_number: 1,
    date:  1,
    date_added:  1,
    date_qc: 1,
    containsBGC: { $ifNull: [ "$containsBGC", false ] },
    isDeep: { $ifNull: [ "$containsBGC", false ] },
    PI_NAME: 1,
    cycle_number:  1,
    lat:  1,
    lon:  1,
    position_qc: 1,
    PLATFORM_TYPE:  1,
    POSITIONING_SYSTEM:  1,
    DATA_MODE:  1,
    station_parameters: 1,
    VERTICAL_SAMPLING_SCHEME: 1,
    STATION_PARAMETERS_inMongoDB: 1,
    cycle_number:  1,
    dac:  1,
    pres_max_for_TEMP: { $ifNull: [ "$pres_max_for_TEMP", -999 ] },
    pres_min_for_TEMP: { $ifNull: [ "$pres_min_for_TEMP", -999 ] },
    pres_max_for_PSAL: { $ifNull: [ "$pres_max_for_PSAL", -999 ] },
    pres_min_for_PSAL: { $ifNull: [ "$pres_min_for_PSAL", -999 ] },
    BASIN: 1
    }

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
        {$sort: { date: -1}},
        {$project: monthYearAggregate},
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
        startDate = moment.utc().subtract(31, 'days');
        endDate = moment.utc().subtract(1, 'days');      
    }
    else {
        startDate = moment.utc(appStartDate).subtract(30, 'days');
        endDate = moment.utc(appStartDate);
    }
    var query = Profile.aggregate([
        {$project: mapMetaAggregate},
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$sort: { 'date': -1}},
        {$limit : 500 }
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
    else if (appStartDate === 'yesterday') {
        startDate = moment.utc().subtract(8, 'days');
        endDate = moment.utc().subtract(1, 'days'); 
    }
    var query = Profile.aggregate([ 
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$sort: {'platform_number': -1, 'date': -1}},
        {$project: mapMetaAggregate},
        {$limit : 500 }
    ]);
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });
};

exports.last_three_days = function(req,res, next) {

    if(req.params.startDate) {
        var endDate = moment.utc(req.params.startDate, 'YYYY-MM-DD');
        var startDate= moment.utc(req.params.startDate, 'YYYY-MM-DD').subtract(3, 'days')
    }
    else {
        const ENV = config.util.getEnv('NODE_ENV');
        const appStartDate = config.startDate[ENV];
        if (appStartDate === 'today'){
            var startDate = moment.utc().subtract(3, 'days');
            var endDate = moment.utc();      
        }
        else if (appStartDate === 'yesterday') {
            var startDate = moment.utc().subtract(4, 'days');
            var endDate = moment.utc().subtract(1, 'days');
        }
        else {
            var startDate = moment.utc().subtract(4, 'days');
            var endDate = moment.utc().subtract(1, 'days');
        }
    }
    var query = Profile.aggregate([
        {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
        {$sort: {'platform_number': -1, 'date': -1}},
        {$project: mapMetaAggregate},
    ]);
    query.exec( function (err, profiles) {
        if (err) { return next(err); }
        res.json(profiles);
    });
};

exports.db_overview = function(req, res, next) {
    queries = [//Profile.find({}).countDocuments(),
               Profile.estimatedDocumentCount({}),
               Profile.distinct('dac'),
               Profile.find({'isDeep':true}).countDocuments(),
               Profile.find({'containsBGC':true}).countDocuments(),
               Profile.aggregate([{ $sort: { date: -1 } }, {$project: {'date_added': 1}}, { $limit : 1 }])
            ]
    
    Promise.all(queries).then( ([ numberOfProfiles, dacs, numberDeep, numberBgc, lastAdded ]) => {
        const date = lastAdded[0].date_added
        overviewData = {'numberOfProfiles': numberOfProfiles, 'dacs': dacs, 'numberDeep':numberDeep, 'numberBgc':numberBgc, 'lastAdded': date}
        res.json(overviewData);
    });
}