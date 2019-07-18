var Grid = require('../models/grid');
var KuuselaGrid = Grid.KuuselaGrid
var GJV = require('geojson-validation');
var moment = require('moment');


exports.find_one = function(req, res , next) {
    console.log('inside find_one()')
    var query = KuuselaGrid.find({}, {});
    query.limit(1)
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.get_window = function(req, res , next) {
    console.log('inside get_window()')
    req.checkQuery('pres', 'pres should be numeric.').isNumeric();

    req.sanitize('latRange').escape();
    req.sanitize('latRange').trim();
    req.sanitize('lonRange').escape();
    req.sanitize('lonRange').trim();
    req.sanitize('monthYear').escape();
    req.sanitize('monthYear').trim();

    if (req.query.latRange) {
        var latRange = JSON.parse(req.query.latRange);
    }
    else {
        var latRange = [-5, 5]
    }

    if (req.query.lonRange) {
        var lonRange = JSON.parse(req.query.lonRange);
    }
    else {
        var lonRange = [40, 45]
    }

    if (req.query.monthYear) {
        var monthYear = moment(req.query.monthYear, 'MM-YYYY').utc().startOf('day')
    }
    else {
        var monthYear = moment('01-2010', 'MM-YYYY').utc()
    }

    if (req.query.pres) {
        var pres = req.query.pres
    }
    else {
        var pres = 10;
    }

    console.log(latRange)
    console.log(lonRange)
    console.log(monthYear)
    console.log(pres)

    var query = KuuselaGrid.aggregate([
        {$match: {pres: pres}},
        {$match: {date: monthYear.toDate()}},
        {$project: { // query for lat lng ranges
            pres: -1,
            date: -1,
            cellsize: -1,
            NODATA_value: -1,
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