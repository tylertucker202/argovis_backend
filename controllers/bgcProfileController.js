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