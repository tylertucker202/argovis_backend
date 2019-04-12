var RGGrid = require('../models/rgGrid');
var GJV = require('geojson-validation');

exports.find_one = function(req, res , next) {
    var query = RGGrid.find({}, {});
    query.limit(1)
    //var query = RGGrid.findOne({time: .5})
    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}

exports.get_window = function(req, res , next) {

    req.sanitize('latRange').escape();
    req.sanitize('latRange').trim();
    req.sanitize('lonRange').escape();
    req.sanitize('lonRange').trim();

    if (req.query.latRange){
        var latRange = JSON.parse(req.query.latRange);
    }
    else {
        var latRange = [-5, 5]
    }

    if (req.query.lonRange){
        var lonRange = JSON.parse(req.query.lonRange);
    }
    else {
        var lonRange = [40, 45]
    }

    console.log(latRange)
    console.log(lonRange)

    const time = .5
    const pres = 2.5

    var query = RGGrid.aggregate([
        {$match: {pres: pres}},
        {$match: {time: time}},
        {$project: { // query for lat lng ranges
            pres: -1,
            time: -1,
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
                        'time': {$first: '$time'},
                        'cellXSize': {$first: '$cellsize'},
                        'cellYSize': {$first: '$cellsize'},
                        'noDataValue': {$first: '$NODATA_value'},
                        'lons': { $addToSet: "$data.LONGITUDE" },
                        'lats': { $addToSet: "$data.LATITUDE"},
                        'zs': {$push : "$data.ARGO_TEMPERATURE_ANOMALY" // values should be in sorted order
                                },
          
            }
        },
        {$project: {
            pres: -1,
            time: -1,
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

//         {$group: {_id: '$dac',
//         'number_of_profiles': {$sum:1},
//         'most_recent_date': {$first: '$date'},
//         'dac': {$first: '$dac'}
//        }, 
// },


    query.exec( function (err, grid) {
        if (err) { return next(err); }
        res.json(grid);
    });
}