const get_grid_model = function(Grid, gridName) {
    let GridModel
    if (!gridName.includes('Total') && !gridName.includes('Space') && gridName.includes('ks')) {
        GridModel = Grid.ksTempMean
    }
    else if  (!gridName.includes('Total') && gridName.includes('Space') && gridName.includes('ks')) {
        GridModel = Grid.ksTempAnom
    }
    else if  (gridName.includes('Anom') && gridName.includes('rg')) {
        GridModel = Grid.rgTempAnom
    }
    else if  (gridName.includes('Total') && gridName.includes('rg')) {
        GridModel = Grid.rgTempTotal
    }
    else if (gridName.includes('Total') && gridName.includes('ks')) {
        GridModel = Grid.ksTempTotal
    }
    else if (gridName.includes('soseSIarea')) {
        GridModel = Grid.soseSIarea
    }
    else if (gridName.includes('soseDoxy')) {
        GridModel = Grid.soseDoxy
    }
    else {
        console.log('grid collection not selected ', grid)
    }
    return GridModel
}

const add_param_projection = function(agg, latRange, lonRange) {
    const proj = [{$project: { // query for lat lng ranges
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
    ]

    agg = agg.concat(proj)
    return agg
}

const add_grid_projection = function(agg, latRange, lonRange) {

    const proj =  [{$project: { // query for lat lng ranges
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
        {$sort:  {'data.lat': -1, 'data.lon': 1}}, //TODO check indexes. it may already be sorted....
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
        }]

    agg = agg.concat(proj)
    return agg
}

module.exports = {}
module.exports.get_grid_model = get_grid_model
module.exports.add_grid_projection = add_grid_projection
module.exports.add_param_projection = add_param_projection