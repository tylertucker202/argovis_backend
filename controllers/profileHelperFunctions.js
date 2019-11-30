const metaDateSliceParams = {date: -1, lat: -1, lon: -1, BASIN: -1};

const presSliceProject = function(minPres, maxPres) {
    const psp = {$project: { //need to include all fields that you wish to keep.
        nc_url: 1,
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
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
    }}
    return(psp)
}

const countProject = {$project: { // return profiles with measurements
    _id: 1,
    nc_url: 1,
    position_qc: 1,
    date_qc: 1,
    BASIN: 1,
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
}}

const countMatch = {$match: {count: {$gt: 0}}}


const reduceIntpMeas = function(intPres) {
    console.log('inside reduceIntpMeas')
    const rim = [{$project: { // create lower and upper measurements
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        DATA_MODE: 1,
        measurements: 1,
        count: 1,
        upperMeas: {
            $filter: {
                input: '$measurements',
                as: 'item',
                cond: { $lt: ['$$item.pres', intPres]}      
            },
        },
        lowerMeas: {
            $filter: {
                input: '$measurements',
                as: 'item',
                cond: { $gte: ['$$item.pres', intPres]}      
            },
        },
    }},
    {$project: { // slice lower and upper measurements
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        DATA_MODE: 1,
        lowerMeas: { $slice: [ '$lowerMeas', 2 ] },
        upperMeas: { $slice: [ '$upperMeas', 2 ] },
    }},
    {$project: { //combine upper and lower measurements into one array
        position_qc: 1,
        date_qc: 1,
        BASIN: 1,
        cycle_number: 1,
        dac: 1,
        date:1,
        lat: 1,
        lon: 1,
        platform_number: 1,
        DATA_MODE: 1,
        measurements: { $concatArrays: [ "$upperMeas", "$lowerMeas" ] }  
    }},
    ]
    return rim
}

const makeMatch = function(startDate, endDate, basin) {
    if (basin) {
        var match = {$match:  {$and: [ {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}},
                        {BASIN: basin}]}
                }
    }
    else{
        var match = { $match: {date: {$lte: endDate.toDate(), $gte: startDate.toDate()}} }
    }
    return match

}

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

module.exports = {}
module.exports.reduceIntpMeas = reduceIntpMeas
module.exports.countMatch = countMatch
module.exports.countProject = countProject
module.exports.presSliceProject = presSliceProject
module.exports.makeMatch = makeMatch
module.exports.mapMetaAggregate = mapMetaAggregate
module.exports.monthYearAggregate = monthYearAggregate