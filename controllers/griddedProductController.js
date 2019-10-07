var Grid = require('../models/grid');
var GridParameter = require('../models/gridParam');
var moment = require('moment');

const get_grid_name= function(grid, param) {
    grid = grid.replace('ks', 'kslocalMLE')
    grid = grid.replace('Temp', '')
    let trend = 'Trend'
    if (grid.includes('NoTrend')) {
        trend = 'NoTrend'
    }
    const paramTrend = param + trend
    const gridName = grid.replace(trend, paramTrend)
    return gridName
}

const get_grid_model = function(grid) {
    let GridModel
    switch(grid) {
        case 'ksSpaceTempNoTrend':
            GridModel = Grid.ksSpaceTempNoTrend
            break;
        case 'ksSpaceTempTrend':
            GridModel = Grid.ksSpaceTempTrend
            break;
        case 'ksSpaceTempTrend2':
            GridModel = Grid.ksSpaceTempTrend2
            break;
        case 'ksSpaceTimeTempNoTrend':
            GridModel = Grid.ksSpaceTimeTempNoTrend
            break;
        case 'ksSpaceTimeTempTrend':
            GridModel = Grid.ksSpaceTimeTempTrend
            break;
        case 'ksSpaceTimeTempTrend2':
            GridModel = Grid.ksSpaceTimeTempTrend2
            break;
        case 'rgGrid':
            GridModel = Grid.rgTempAnom
            break;
        default:
            GridModel = Grid.ksSpaceTempNoTrend
      } 
    return GridModel
}

exports.find_grid = function(req, res , next) {
    req.sanitize('grid').escape();
    req.sanitize('grid').trim();
    const gridStr = req.params.grid
    const GridModel = get_grid_model(gridStr)
    console.log('my grid is', gridStr)
    const query = GridModel.find({}, {});
    query.limit(1)
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.find_grid_param = function(req, res , next) {
    req.sanitize('grid').escape();
    req.sanitize('grid').trim();
    req.sanitize('presLevel').escape();
    req.sanitize('presLevel').trim();
    req.sanitize('param').escape();
    req.sanitize('param').trim();

    req.checkParams('presLevel', 'pres should be numeric.').isNumeric();
    req.checkParams('param', 'param should be string.').isAlpha();
    req.checkParams('grid', 'grid should be string.').isAlphanumeric();
    const pres = JSON.parse(req.query.presLevel)
    const grid = req.query.grid
    const param = req.query.param

    const gridName = get_grid_name(grid, param)

    console.log(pres, gridName)
    
    const query = GridParameter.find({pres: pres, gridName}, {model: 1, param:1, measurement: 1, trend: 1, pres: 1});
    query.limit(1)
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}


exports.get_grid_window = function(req, res , next) {
    req.sanitize('grid').escape();
    req.sanitize('grid').trim();
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
    const gridStr = req.query.grid
    const latRange = JSON.parse(req.query.latRange)
    const lonRange = JSON.parse(req.query.lonRange)
    const monthYear = moment(req.query.monthYear, 'MM-YYYY').utc().startOf('D')

    const GridModel = get_grid_model(gridStr)

    const query = GridModel.aggregate([
        {$match: {pres: pres}},
        {$match: {date: monthYear.toDate()}},
        {$project: { // query for lat lng ranges
            pres: -1,
            date: -1,
            cellsize: -1,
            NODATA_value: -1,
            gridName: -1,
            data: {
                $filter: {
                    input: '$data',
                    as: 'item',
                    cond: {
                        $and: [
                            {$gt: ['$$item.LATITUDE', latRange[0]]},
                            {$lt: ['$$item.LATITUDE', latRange[1]]},
                            {$gt: ['$$item.LONGITUDE', lonRange[0]]},
                            {$lt: ['$$item.LONGITUDE', lonRange[1]]}
                        ]},
                },
            },
        }},
        { $unwind : '$data' }, //allows sorting
        {$sort:  {'data.LATITUDE': -1, 'data.LONGITUDE': 1}},
        {$group: {_id: '$_id', //collection for nrows and ncolumns
                        'pres': {$first: '$pres'},
                        'date': {$first: '$date'},
                        'cellXSize': {$first: '$cellsize'},
                        'cellYSize': {$first: '$cellsize'},
                        'noDataValue': {$first: '$NODATA_value'},
                        'gridName': {$first: '$gridName'},
                        'lons': { $addToSet: "$data.LONGITUDE" },
                        'lats': { $addToSet: "$data.LATITUDE"},
                        'zs': {$push : "$data.value" // values should be in sorted order
                                },
          
            }
        },
        {$project: {
            pres: -1,
            date: -1,
            cellXSize: -1,
            cellYSize: -1,
            noDataValue: -1,
            gridName: -1,
            nRows: { $size: '$lats'},
            nCols: { $size: '$lons'},
            xllCorner: { $min: '$lons'},
            yllCorner: { $min: '$lats'},
            zs: 1,
            },
        }
        ]);
    
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.get_param_window = function(req, res , next) {
    req.sanitize('grid').escape();
    req.sanitize('grid').trim();
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
    req.checkParams('grid', 'grid should be string.').isAlphanumeric();
    const pres = JSON.parse(req.query.presLevel)
    const grid = req.query.grid
    const param = req.query.param

    const latRange = JSON.parse(req.query.latRange)
    const lonRange = JSON.parse(req.query.lonRange)
    const gridName = get_grid_name(grid, param)

    console.log(gridName, pres)


    const query = GridParameter.aggregate([
        {$match: {pres: pres, gridName: gridName}},
        {$project: { // query for lat lng ranges
            pres: -1,
            cellsize: -1,
            NODATA_value: -1,
            gridName: -1,
            measurement: -1,
            param: -1,
            data: {
                $filter: {
                    input: '$data',
                    as: 'item',
                    cond: {
                        $and: [
                            {$gt: ['$$item.LATITUDE', latRange[0]]},
                            {$lt: ['$$item.LATITUDE', latRange[1]]},
                            {$gt: ['$$item.LONGITUDE', lonRange[0]]},
                            {$lt: ['$$item.LONGITUDE', lonRange[1]]}
                        ]},
                },
            },
        }},
        { $unwind : '$data' }, //allows sorting
        {$sort:  {'data.LATITUDE': -1, 'data.LONGITUDE': 1}},
        {$group: {_id: '$_id', //collection for nrows and ncolumns
                        'pres': {$first: '$pres'},
                        'measurement': {$first: '$measurement'},
                        'param': {$first: '$param'},
                        'cellXSize': {$first: '$cellsize'},
                        'cellYSize': {$first: '$cellsize'},
                        'noDataValue': {$first: '$NODATA_value'},
                        'gridName': {$first: '$gridName'},
                        'lons': { $addToSet: "$data.LONGITUDE" },
                        'lats': { $addToSet: "$data.LATITUDE"},
                        'zs': {$push : "$data.value" // values should be in sorted order
                                },
          
            }
        },
        {$project: {
            pres: -1,
            cellXSize: -1,
            cellYSize: -1,
            noDataValue: -1,
            gridName: -1,
            measurement: -1,
            param: -1,
            nRows: { $size: '$lats'},
            nCols: { $size: '$lons'},
            xllCorner: { $min: '$lons'},
            yllCorner: { $min: '$lats'},
            zs: 1,
            },
        }
        ]);
    
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}
