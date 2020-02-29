const MAP_META_AGGREGATE = {_id: '$platform_number',
    'platform_number': 1,
    'date': 1,
    'cycle_number': 1,
    'geoLocation': 1,
    'DATA_MODE': 1,
    'containsBGC': 1,
    'isDeep': 1,
    'DIRECTION': 1
    }

const MONTH_YEAR_AGGREGATE = {_id: 1,
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

const COUNT_MATCH = {$match: {count: {$gt: 0}}}

const COUNT_PROJECT = {$project: { // return profiles with measurements
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

const META_DATE_SLICE_PARAMS = {date: -1, lat: -1, lon: -1, BASIN: -1};

const MAP_PARAMS = 'platform_number date geoLocation cycle_number station_parameters lat lon DATA_MODE containsBGC isDeep DIRECTION'

const MAP_PROJ = {
    platform_number: -1,
    date: -1,
    geoLocation: 1,
    cycle_number: -1,
    DATA_MODE: -1,
    containsBGC: 1,
    isDeep: 1,
    DIRECTION: 1,
}

const MAP_PROJ_WITH_COUNT = { platform_number: -1,
    date: -1,
    geoLocation: 1,
    cycle_number: -1,
    DATA_MODE: -1,
    containsBGC: 1,
    isDeep: 1,
    count: { $size:'$measurements' },
    DIRECTION: 1,
}

const PROF_PROJ_PARAMS_BASE = 
{   platform_number: 1,
    date:  1,
    date_qc: 1,
    geo2DLocation: 1,
    PI_NAME: 1,
    cycle_number: 1,
    lat: 1,
    lon: 1,
    position_qc: 1,
    station_parameters: 1,
    VERTICAL_SAMPLING_SCHEME: 1,
    STATION_PARAMETERS_inMongoDB: 1,
    WMO_INST_TYPE: 1,
    cycle_number: 1,
    dac: 1,
    basin: 1,
    nc_url: 1,
    geoLocation: 1,
    maximum_pressure: 1,
    POSITIONING_SYSTEM: 1,
    DATA_MODE: 1,
    core_data_mode: 1,
    PLATFORM_TYPE: 1,
}

let prof_proj_with_pres_range_count = PROF_PROJ_PARAMS_BASE
prof_proj_with_pres_range_count.measurements = 1
prof_proj_with_pres_range_count.count = { $size:'$measurements' }
const PROF_PROJECT_WITH_PRES_RANGE_COUNT = prof_proj_with_pres_range_count


module.exports.MAP_META_AGGREGATE = MAP_META_AGGREGATE
module.exports.MONTH_YEAR_AGGREGATE = MONTH_YEAR_AGGREGATE
module.exports.COUNT_MATCH = COUNT_MATCH
module.exports.COUNT_PROJECT = COUNT_PROJECT
module.exports.META_DATE_SLICE_PARAMS = META_DATE_SLICE_PARAMS
module.exports.MAP_PARAMS = MAP_PARAMS
module.exports.MAP_PROJ = MAP_PROJ
module.exports.MAP_PROJ_WITH_COUNT = MAP_PROJ_WITH_COUNT
module.exports.PROF_PROJ_PARAMS_BASE = PROF_PROJ_PARAMS_BASE
module.exports.PROF_PROJECT_WITH_PRES_RANGE_COUNT = PROF_PROJECT_WITH_PRES_RANGE_COUNT