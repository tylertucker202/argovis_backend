var Grid = require('../models/grid');
var GridParameter = require('../models/gridParam');
var moment = require('moment');


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
        case 'rgTempAnom':
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
    const gridStr = req.query.grid
    const GridModel = get_grid_model(gridStr)
    //console.log('my grid model is', GridModel)

    const monthYear = moment.utc('01-2007', 'MM-YYYY').startOf('D')
    const pres = 10
    console.log(pres, monthYear.toDate())
    const query = GridModel.aggregate([
        //{$match: {pres: pres, date: monthYear.toDate()}},
        {$limit: 1}
    ])
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
    const gridName = req.query.grid
    const param = req.query.param

    console.log(pres, gridName)
    
    const query = GridParameter.find({pres: pres, gridName: gridName, param: param}, {model: 1, param:1, measurement: 1, trend: 1, pres: 1});
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
    const monthYear = moment.utc(req.query.monthYear, 'MM-YYYY').startOf('D')

    const GridModel = get_grid_model(gridStr)
    console.log(pres, monthYear, gridStr)

    const query = GridModel.aggregate([
        {$match: {pres: pres, date: monthYear.toDate()}},
        {$project: { // query for lat lng ranges
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            cellsize: -1,
            NODATA_value: -1,
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
        }},
        { $unwind : '$data' }, //allows sorting
        {$sort:  {'data.lat': -1, 'data.lon': 1}},
        {$group: {_id: '$_id', //collection for nrows and ncolumns
                        'pres': {$first: '$pres'},
                        'date': {$first: '$date'},
                        'measurement': {$first: '$measurement'},
                        'units': {$first: '$units'},
                        'param': {$first: '$param'},
                        'variable': {$first: '$variable'},
                        'cellXSize': {$first: '$cellsize'},
                        'cellYSize': {$first: '$cellsize'},
                        'noDataValue': {$first: '$NODATA_value'},
                        'gridName': {$first: '$gridName'},
                        'lons': { $addToSet: "$data.lon" },
                        'lats': { $addToSet: "$data.lat"},
                        'zs': {$push : "$data.value" // values should be in sorted order
                                },
            }
        },
        {$project: {
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            cellXSize: -1,
            cellYSize: -1,
            noDataValue: -1,
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
    const gridName = req.query.grid
    const param = req.query.param

    const latRange = JSON.parse(req.query.latRange)
    const lonRange = JSON.parse(req.query.lonRange)

    console.log(gridName, param, pres)


    const query = GridParameter.aggregate([
        {$match: {pres: pres, gridName: gridName, param: param}},
        {$project: { // query for lat lng ranges
            pres: -1,
            cellsize: -1,
            NODATA_value: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
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
        }},
        { $unwind : '$data' }, //allows sorting
        {$sort:  {'data.lat': -1, 'data.lon': 1}},
        {$group: {_id: '$_id', //collection for nrows and ncolumns
                    'pres': {$first: '$pres'},
                    'measurement': {$first: '$measurement'},
                    'param': {$first: '$param'},
                    'units': {$first: '$units'},
                    'cellXSize': {$first: '$cellsize'},
                    'cellYSize': {$first: '$cellsize'},
                    'noDataValue': {$first: '$NODATA_value'},
                    'gridName': {$first: '$gridName'},
                    'lons': { $addToSet: "$data.lon" },
                    'lats': { $addToSet: "$data.lat"},
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
            units: -1,
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
