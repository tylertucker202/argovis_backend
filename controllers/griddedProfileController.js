var Profile = require('../models/profile');
var moment = require('moment');
var helpfun = require('./helperFunctions');


exports.meta_date_selection = function(req, res, next) {

    req.sanitize('startDate').toDate();
    req.sanitize('endDate').toDate();


    if (req.query.basin) {
        const basin = JSON.parse(req.query.basin)
        var match = {$match:  {$and: [ {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}},
                        {BASIN: basin}]}
                }
    }
    else{
       var match = { $match: {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} }
    }

    const startDate = moment.utc(req.params.startDate)
    const endDate = moment.utc(req.params.endDate)

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
            var query = Profile.aggregate([ match, {$project: metaDateSliceParams} ]);
        }
        let promise = query.exec();
        promise
        .then(function (profiles) {
                res.json(profiles);
            }
        )
        .catch(function(err) { return next(err)})    
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

    const startDate = moment.utc(req.query.startDate);
    const endDate = moment.utc(req.query.endDate);

    console.log(startDate, endDate)

    let basin = null
    if (req.query.basin) {
        basin = JSON.parse(req.query.basin)
    }

    const match = helpfun.makeMatch(startDate, endDate, basin);


    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var errors = result.array().map(function (elem) {
                return elem.msg;
            });
            res.render('error', { errors: errors });
        }
        else {
            var query = Profile.aggregate([
                match,
                helpfun.presSliceProject(minPres, maxPres),
                helpfun.countProject,
                helpfun.countMatch
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

exports.layer_for_interpolation = function(req, res , next) {

    req.checkQuery('startDate', 'startDate should be specified.').notEmpty();
    req.checkQuery('endDate', 'endDate should be specified.').notEmpty();
    req.checkQuery('presRange', 'presRange should be specified.').notEmpty();
    req.checkQuery('intPres', 'intPres should not be empty').notEmpty()
    req.sanitize('intPres').escape();
    req.sanitize('intPres').trim()
    req.sanitize('presRange').escape();
    req.sanitize('presRange').trim();
    req.sanitize('startDate').toDate();
    req.sanitize('endDate').toDate();

    const intPres = JSON.parse(req.query.intPres)
    let reduceMeas = null
    if (req.query.reduceMeas) {   
        reduceMeas = JSON.parse(req.query.reduceMeas)
        console.log(reduceMeas)
    }

    const presRange = JSON.parse(req.query.presRange)
    const maxPres = Number(presRange[1])
    const minPres = Number(presRange[0])

    const startDate = moment.utc(req.query.startDate)
    const endDate = moment.utc(req.query.endDate)

    let basin = null
    if (req.query.basin) {
        basin = JSON.parse(req.query.basin)
    }

    const match = helpfun.makeMatch(startDate, endDate, basin);

    console.log(intPres, maxPres, minPres, startDate, endDate, basin, reduceMeas)



    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var errors = result.array().map(function (elem) {
                return elem.msg;
            });
            res.render('error', { errors: errors });
        }
        else {
            let agg = [match,
                        helpfun.presSliceProject(minPres, maxPres),
                        helpfun.countProject,
                        helpfun.countMatch]

            if (reduceMeas) {
                console.log('reduce exists as', reduceMeas)
                agg.concat(helpfun.reduceIntpMeas(intPres));
            }
            
            var query = Profile.aggregate(agg);
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