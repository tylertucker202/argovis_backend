const Grid = require('../models/grid');
const GridParameter = Grid.ksTempParams;
const moment = require('moment');
const helper = require('../public/javascripts/controllers/griddedHelperFunctions')

const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

exports.get_grid_metadata = function(req, res, next) {
    req.sanitize('gridName').escape();
    req.sanitize('gridName').trim();
    const gridName = req.query.gridName
    const GridModel = helper.get_grid_model(Grid, gridName)
    // console.log(gridName, GridModel)
    let query = GridModel.aggregate( [
        {$match: {gridName: gridName}},
        {$group: datePresGrouping},
        {$unwind: "$presLevels"},
        {$sort: {presLevels: 1}},
        {$group: {_id: null, "presLevels": {$push: "$presLevels"}, dates: {$first: '$dates'}}},
        {$unwind: "$dates"},
        {$sort: {dates: 1}},
        {$group: {_id: null, "dates": {$push: "$dates"}, presLevels: {$first: '$presLevels'}}},
    ])

    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.find_grid_param = function(req, res , next) {
    req.sanitize('gridName').escape();
    req.sanitize('gridName').trim();
    req.sanitize('presLevel').escape();
    req.sanitize('presLevel').trim();
    req.sanitize('param').escape();
    req.sanitize('param').trim();

    req.checkParams('presLevel', 'pres should be numeric.').isNumeric();
    req.checkParams('param', 'param should be string.').isAlpha();
    req.checkParams('grid', 'grid should be string.').isAlphanumeric();
    const pres = JSON.parse(req.query.presLevel)
    const gridName = req.query.gridName
    const param = req.query.param
    
    const query = GridParameter.find({pres: pres, gridName: gridName, param: param}, {model: 1, param:1, measurement: 1, trend: 1, pres: 1});
    query.limit(1)
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.find_grid = function(req, res , next) {
    req.sanitize('gridName').escape();
    req.sanitize('gridName').trim();
    req.sanitize('trend').escape();
    req.sanitize('trend').trim();
    const gridName = req.query.gridName
    const GridModel = helper.get_grid_model(Grid, gridName)
    const query = GridModel.aggregate([
        {$match: {gridName: gridName}},
        {$limit: 1}
    ])
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.get_grid_window = function(req, res , next) {
    req.sanitize('gridName').escape();
    req.sanitize('gridName').trim();
    req.sanitize('presLevel').escape();
    req.sanitize('presLevel').trim();
    req.sanitize('latRange').escape();
    req.sanitize('latRange').trim();
    req.sanitize('lonRange').escape();
    req.sanitize('lonRange').trim();
    req.sanitize('param').escape();
    req.sanitize('param').trim();
    req.sanitize('monthYear').escape();
    req.sanitize('monthYear').trim();

    req.checkParams('presLevel', 'presLevel should be numeric.').isNumeric();
    req.checkParams('param', 'param should be string.').isAlpha();
    req.checkParams('grid', 'grid should be string.').isAlphanumeric();
    const pres = JSON.parse(req.query.presLevel)
    const gridName = req.query.gridName
    const latRange = JSON.parse(req.query.latRange)
    const lonRange = JSON.parse(req.query.lonRange)
    const monthYear = moment.utc(req.query.monthYear, 'MM-YYYY').startOf('D')

    const GridModel = helper.get_grid_model(Grid, gridName)

    let agg = []
    agg.push({$match: {pres: pres, date: monthYear.toDate(), gridName: gridName }})
    agg = helper.add_grid_projection(agg, latRange, lonRange)
    const query = GridModel.aggregate(agg)
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.get_non_uniform_grid_window = function(req, res , next) {
    req.sanitize('gridName').escape();
    req.sanitize('gridName').trim();
    req.sanitize('presLevel').escape();
    req.sanitize('presLevel').trim();
    req.sanitize('latRange').escape();
    req.sanitize('latRange').trim();
    req.sanitize('lonRange').escape();
    req.sanitize('lonRange').trim();
    req.sanitize('param').escape();
    req.sanitize('param').trim();
    req.sanitize('date').escape();
    req.sanitize('date').trim();

    req.checkParams('presLevel', 'presLevel should be numeric.').isNumeric();
    req.checkParams('param', 'param should be string.').isAlpha();
    req.checkParams('grid', 'grid should be string.').isAlphanumeric();
    const pres = JSON.parse(req.query.presLevel)
    const gridName = req.query.gridName
    const latRange = JSON.parse(req.query.latRange)
    const lonRange = JSON.parse(req.query.lonRange)
    const date = moment.utc(req.query.date, 'YYYY-MM-DD')

    const GridModel = helper.get_grid_model(Grid, gridName)
    let agg = []
    agg.push({$match: {pres: pres, date: date.format('YYYY-MM-DD'), gridName: gridName }})

    const proj =  {$project: { // query for lat lng ranges
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            NODATA_value: -1,
            chunk: -1,
            data: {
                $filter: {
                    input: '$data',
                    as: 'item',
                    cond: {
                        $and: [
                            {$gt: ['$$item.lat', latRange[0]]},
                            {$lt: ['$$item.lat', latRange[1]]},
                            {$gt: ['$$item.lon', lonRange[0]]},
                            {$lt: ['$$item.lon', lonRange[1]]}
                        ]},
                },
            },
        }}
    agg.push(proj)

    const count_proj = {$project: { // count data lengths
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            NODATA_value: -1,
            chunk: -1,
            data: -1,
            count: { $size:'$data' },
        }}

    agg.push(count_proj) //filter out empty data. ensures data chunks are recorded 
    agg.push({$match: {count: {$gt: 0}}})
    
    
    const group = {$group: {_id: '$gridName', //collection for nrows and ncolumns
                'pres': {$first: '$pres'},
                'chunks': {$addToSet: "$chunk"},
                'measurement': {$first: '$measurement'},
                'param': {$first: '$param'},
                'date': {$first: '$date'},
                'units': {$first: '$units'},
                'NODATA_value': {$first: '$NODATA_value'},
                'variable': {$first: '$variable'},
                'gridName': {$first: '$gridName'},
                'data': {$push : "$data" // values should be in sorted order
                },
        }
    }
    
    agg.push(group)

    const reduce_proj = {$project: {
        pres: -1,
        date: -1,
        gridName: -1,
        measurement: -1,
        units: -1,
        param: -1,
        variable: -1,
        NODATA_value: -1,
        chunks: -1,
        data: {
            $reduce: {
                input: '$data',
                initialValue: [],
                in: { $concatArrays: [ "$$value", "$$this" ]}
            }
        }
    }
    }
    agg.push(reduce_proj)

    // agg.push({ $unwind : '$data' }) //allows sorting for small areas, but expensive. mongod 4.4 and higher use function
    // agg.push({$sort:  {'data.lat': -1, 'data.lon': 1}} )
    // agg.push(group)

    const query = GridModel.aggregate(agg)
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.get_param_window = function(req, res , next) {
    req.sanitize('gridName').escape();
    req.sanitize('gridName').trim();
    req.sanitize('presLevel').escape();
    req.sanitize('presLevel').trim();
    req.sanitize('latRange').escape();
    req.sanitize('latRange').trim();
    req.sanitize('lonRange').escape();
    req.sanitize('lonRange').trim();
    req.sanitize('param').escape();
    req.sanitize('param').trim();

    req.checkParams('presLevel', 'presLevel should be numeric.').isNumeric();
    req.checkParams('param', 'param should be string.').isAlpha();
    req.checkParams('gridName', 'gridName should be string.').isAlphanumeric();
    const pres = JSON.parse(req.query.presLevel)
    const gridName = req.query.gridName
    const param = req.query.param

    const latRange = JSON.parse(req.query.latRange)
    const lonRange = JSON.parse(req.query.lonRange)

    let agg = []
    agg.push({$match: {pres: pres, gridName: gridName, param: param}})
    console.log(agg)
    agg = helper.add_param_projection(agg, latRange, lonRange)
    console.log(agg)

    const query = GridParameter.aggregate(agg);
    
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}
