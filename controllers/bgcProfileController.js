const Profile = require('../models/profile')
const moment = require('moment')
const GJV = require('geojson-validation')
const helper = require('../public/javascripts/controllers/profileHelperFunctions')
const HELPER_CONST = require('../public/javascripts/controllers/profileHelperConstants')

exports.bgc_selection_detail = function(req, res, next) {
    //geospatial and date range query for BGC measurements
}

exports.bgc_profile_detail = function(req, res, next) {
    //find profile and filter out two measurements for plotting
}

exports.bgc_platform_list = function(req, res, next) {
    //retrieve list of platforms that have a field containsBGC = true
    const query = Profile.aggregate([
        {$match: {containsBGC: true}}, 
        {$group: { _id: '$platform_number', platform_number: {$first: '$platform_number'}}}
    ])
    query.exec(function (err, profiles) {
        if (err) return next(err)
        if (profiles.length === 0) { res.send('platform not found') }
        else {
            res.json(profiles)
        }
    })
}

// Display bgc platform data from 2 parameters on GET
exports.bgc_platform_data = function (req, res, next) {
    req.sanitize('platform_number').escape()
    req.sanitize('platform_number').trim()
    req.checkQuery('platform_number', 'platform_number should be numeric.').isNumeric()

    const platform_number = JSON.parse(req.params.platform_number)
    let xaxis = null
    let yaxis = null
    if (req.query.xaxis) { xaxis=req.query.xaxis }
    if (req.query.yaxis) { yaxis=req.query.yaxis }
    let agg = [ {$match: {platform_number: platform_number}} ]

    if (xaxis && yaxis) {
        agg.push(helper.drop_missing_bgc_keys([xaxis, yaxis]))
        agg.push(helper.reduce_bgc_meas([xaxis, yaxis]))
    }
    const query = Profile.aggregate(agg)

    query.exec(function (err, profiles) {
        if (err) return next(err)
        if (profiles.length === 0) { res.send('platform not found') }
        else {
            res.json(profiles)
        }
    })
}

exports.bgc_data_selection = function(req, res , next) {
    //check input
    req.checkQuery('startDate', 'startDate should be specified.').notEmpty()
    req.checkQuery('endDate', 'endDate should be specified.').notEmpty()
    req.checkQuery('shape', 'shape should be specified.').notEmpty()
    req.checkQuery('xaxis', 'xaxis should be specified').notEmpty()
    req.checkQuery('yaxis', 'yaxis should be specified').notEmpty()
    req.sanitize('presRange').escape()
    req.sanitize('presRange').trim()
    req.sanitize('_id').escape()
    req.sanitize('startDate').toDate()
    req.sanitize('endDate').toDate()
    
    const shape = JSON.parse(req.query.shape)
    const shapeJson = {'type': 'Polygon', 'coordinates': shape}

    let presRange = null
    let maxPres = null
    let minPres = null
    let deepOnly = null
    let xaxis = null
    let yaxis = null

    if (req.query.xaxis) { xaxis=req.query.xaxis }
    if (req.query.yaxis) { yaxis=req.query.yaxis }
    if (req.query.presRange) {
        presRange = JSON.parse(req.query.presRange)
        maxPres = Number(presRange[1])
        minPres = Number(presRange[0])
    }
    if (req.query.deepOnly) { deepOnly = true }

    const startDate = moment.utc(req.query.startDate, 'YYYY-MM-DD')
    const endDate = moment.utc(req.query.endDate, 'YYYY-MM-DD')
    const dateDiff = endDate.diff(startDate)
    const monthDiff = Math.floor(moment.duration(dateDiff).asMonths())
    if (monthDiff > 3) {
        throw new Error('time range exceeds 3 months. consider making query smaller')
    }
    GJV.valid(shapeJson)
    GJV.isPolygon(shapeJson)
    //setup aggregate pipeline
    req.getValidationResult().then(function (result) {
    if (!result.isEmpty()) {
        const errors = result.array().map(function (elem) {
            return elem.msg
        })
        console.log(errors)
        throw new Error(errors)
    }
    else {
        let agg = []
        if (presRange) {
            agg = helper.make_bgc_pres_agg(minPres, maxPres, shapeJson, startDate, endDate)
            console.log(agg)
        }
        else {
            agg = [ {$match: {geoLocation: {$geoWithin: {$geometry: shapeJson}}}},
                    {$match: {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}}}
            ]
        }
        if (deepOnly) {
            agg.push({$match: {isDeep: true}})
        }
        agg.push({$match: {containsBGC: true}})
        agg.push(helper.drop_missing_bgc_keys([xaxis, yaxis]))
        agg.push(helper.reduce_bgc_meas([xaxis, yaxis]))
        const query = Profile.aggregate(agg)
        //load page/json.
        const promise = query.exec()
        promise
        .then(function (profiles) {
            //create virtural fields.
            profiles = helper.make_virtural_fields(profiles)
            //render json 
            res.json(profiles)
        })
        .catch(function(err) { return next(err)})
    }}).catch(function(err) {
        return next(err)
    })
}