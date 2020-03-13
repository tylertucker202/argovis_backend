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

// Display platform detail form on GET
exports.bgc_platform_detail = function (req, res, next) {
    req.sanitize('platform_number').escape()
    req.sanitize('platform_number').trim()
    req.checkQuery('platform_number', 'platform_number should be numeric.').isNumeric()

    const platform_number = JSON.parse(req.params.platform_number)
    let key1 = null
    let key2 = null
    if (req.query.key1) { key1=req.query.key1 }
    if (req.query.key2) { key2=req.query.key2 }
    console.log(platform_number, key1, key2)
    let agg = [ {$match: {platform_number: platform_number}} ]

    if (key1 && key2) {
        console.log('filtering step')
        agg.push(helper.drop_missing_bgc_keys([key1, key2]))
        agg.push(helper.reduce_bgc_meas([key1, key2]))
    }
    //agg.push( {$limit: 5})
    const query = Profile.aggregate(agg)

    query.exec(function (err, profiles) {
        if (err) return next(err)
        if (profiles.length === 0) { res.send('platform not found') }
        else {
            res.json(profiles)
        }
    })
}