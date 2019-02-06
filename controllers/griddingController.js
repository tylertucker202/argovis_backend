var Profile = require('../models/profile');
var moment = require('moment');

const metaDateSliceParams = {date: -1, lat: -1, lon: -1};

exports.meta_date_selection = function(req, res, next) {

    req.sanitize('startDate').toDate();
    req.sanitize('endDate').toDate();

    const startDate = moment.utc(req.params.startDate)
    const endDate = moment.utc(req.params.endDate)

    console.log(req.params.startDate)
    console.log(req.params.endDate)

    console.log(startDate.toDate())
    console.log(endDate.toDate())

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            console.log('an error!')
            var errors = result.array().map(function (elem) {
                return elem.msg;
            });
            console.log(errors)
            res.render('error', { errors: errors });
        }
        else {
            var query = Profile.aggregate([
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}}, 
                {$project: metaDateSliceParams},
            ]);

            let promise = query.exec();
            promise
            .then(function (profiles) {
                    res.json(profiles);
                }
            )
            .catch(function(err) { return next(err)})
        }
    })
}

exports.pres_layer_selection = function(req, res , next) {

    req.checkQuery('startDate', 'startDate should be specified.').notEmpty();
    req.checkQuery('endDate', 'endDate should be specified.').notEmpty();
    req.checkQuery('presRange', 'presRange should be specified.').notEmpty();
    req.sanitize('presRange').escape();
    req.sanitize('presRange').trim();
    req.sanitize('startDate').toDate();
    req.sanitize('endDate').toDate();

    const presRange = JSON.parse(req.query.presRange);
    const maxPres = Number(presRange[1]);
    const minPres = Number(presRange[0]);

    const startDate = moment.utc(req.query.startDate, 'YYYY-MM-DD');
    const endDate = moment.utc(req.query.endDate, 'YYYY-MM-DD');

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var errors = result.array().map(function (elem) {
                return elem.msg;
            });
            res.render('error', { errors: errors });
        }
        else {
            var query = Profile.aggregate([
                {$match:  {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}},
                {$project: { //need to include all fields that you wish to keep.
                    nc_url: 1,
                    position_qc: 1,
                    cycle_number: 1,
                    dac: 1,
                    date:1,
                    lat: 1,
                    lon: 1,
                    platform_number: 1,
                    geoLocation: 1,
                    station_parameters: 1,
                    maximum_pressure: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    PLATFORM_TYPE: 1,
                    measurements: {
                        $filter: {
                            input: '$measurements',
                            as: 'item',
                            cond: { 
                                $and: [
                                    {$gt: ['$$item.pres', minPres]},
                                    {$lt: ['$$item.pres', maxPres]}
                                ]},
                        },
                    },
                }},
                {$project: { // return profiles with measurements
                    _id: 1,
                    nc_url: 1,
                    position_qc: 1,
                    cycle_number: 1,
                    dac: 1,
                    date:1,
                    lat: 1,
                    lon: 1,
                    platform_number: 1,
                    geoLocation: 1,
                    station_parameters: 1,
                    maximum_pressure: 1,
                    measurements: 1,
                    POSITIONING_SYSTEM: 1,
                    DATA_MODE: 1,
                    PLATFORM_TYPE: 1,
                    count: { $size:'$measurements' },
                }},
                {$match: {count: {$gt: 0}}}
                ]);
        }

        var promise = query.exec();
        promise
        .then(function (profiles) {
                res.json(profiles);
            }
        )
        .catch(function(err) { return next(err)})
    })
}