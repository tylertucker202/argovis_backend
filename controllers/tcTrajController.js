const tcTraj = require('../models/tcTraj');
const moment = require('moment');
const { query } = require('@angular/animations');

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

exports.findByDateRange = function(req, res, next){
    req.checkQuery('startDate', 'start date should be specified.').notEmpty();
    req.checkQuery('endDate', 'end date should be specified.').notEmpty();
    req.sanitize('startDate').toDate()
    req.sanitize('endDate').toDate()
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    // console.log(startDate, endDate)
    let agg = []
    
    const dateMatch = { $match:  {$and: [ {startDate: {$gte: startDate}}, {endDate: {$lte: endDate} }] }} 
    agg.push(dateMatch)
    const query = tcTraj.aggregate(agg)
    const promise = query.exec()
    promise
    .then(function (tracks) {
        res.json(tracks)
    })
    .catch(function(err) { return next(err)})
}

exports.findByName = function(req, res, next) {
    req.checkQuery('name', 'name should be specified.').notEmpty();
    const tc_name = req.query.name.toUpperCase()
    const query = tcTraj.find({name: tc_name})
    query.exec(function (err, tcTraj) {
        if (err) return next(err);
        res.json(tcTraj);
    })
}