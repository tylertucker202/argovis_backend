const tcTraj = require('../models/tcTraj');
const moment = require('moment');
const { query } = require('@angular/animations');

const TRAJ_GROUP = { _id: '$stormName',
                }

const TRAJ_PROJ = { 
                    _id: 1,
                    name: 1,
                    year: 1,
                    stormName: 1,
                  }

exports.findOne = function(req, res , next) {
    const query = tcTraj.findOne();
    query.exec(function (err, tcTraj) {
    if (err) return next(err);
    res.json(tcTraj);
    })
}

exports.findByDate = function(req, res , next) {
    req.checkQuery('date', 'date should be specified.').notEmpty();
    req.sanitize('date').toDate();
    const date = req.query.date;
    const query = tcTraj.find({date: date});
    query.exec(function (err, tcTraj) {
        if (err) return next(err);
        res.json(tcTraj);
    })
}

exports.getStormNames = function(req, res, next) {
    let agg = [ {$addFields: {
                    stormName: {
                            $concat: [
                                '$name', '-',
                                {$toString: '$year'}
                            ]
                    }
                }},
                {$match: {stormName: {$exists: true, $ne: null}}},
                {$group: TRAJ_GROUP},
                {$project: TRAJ_PROJ}

              ]
    const query = tcTraj.aggregate(agg)
    const promise = query.exec()
    promise
    .then(function (stormNames) {
        res.json(stormNames.map(function(el) { return el._id })) //return list of strings
    })
    .catch(function(err) { return next(err)})
}

exports.findByDateRange = function(req, res, next){
    req.checkQuery('startDate', 'start date should be specified.').notEmpty();
    req.checkQuery('endDate', 'end date should be specified.').notEmpty();
    req.sanitize('startDate').toDate()
    req.sanitize('endDate').toDate()
    const sDate = moment(req.query.startDate, 'YYYY-MM-DDTHH:mm:ss')
    const eDate = moment(req.query.endDate, 'YYYY-MM-DDTHH:mm:ss')

    const dateDiff = eDate.diff(sDate)
    const monthDiff = Math.floor(moment.duration(dateDiff).asMonths())
    if (monthDiff > 3) {
        throw new Error('time range exceeds 3 months. consider making query smaller')
    }

    let agg = []
    
    const dateMatch = { $match:  {$or: [
        {$and: [ {startDate: {$gte: sDate.toDate()}}, {endDate: {$lte: eDate.toDate()} }] },
        {$and: [ {endDate: {$gte: sDate.toDate()}}, {startDate: {$lte: eDate.toDate()} }] }, 
    ]}}

    agg.push(dateMatch)
    const query = tcTraj.aggregate(agg)
    const promise = query.exec()
    promise
    .then(function (tracks) {
        res.json(tracks)
    })
    .catch(function(err) { return next(err)})
}

exports.findByNameYear = function(req, res, next) {
    req.checkQuery('name', 'name should be specified.').notEmpty();
    req.checkQuery('year', 'year should be specified.').notEmpty();
    req.checkQuery('year', 'year should be a number.').isNumeric();
    const tc_name = req.query.name.toUpperCase()
    const year = JSON.parse(req.query.year)
    if (tc_name.includes('UNNAMED')) {
        throw new Error('cannot query unnamed storm')
    }

    const query = tcTraj.find({name: tc_name, year: year})
    query.exec(function (err, tcTraj) {
        if (err) return next(err);
        res.json(tcTraj);
    })
}