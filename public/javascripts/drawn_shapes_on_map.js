var drawnItems = new L.featureGroup().addTo(map);
const drawOptions = {
            edit: {
                featureGroup: drawnItems,
                poly: {
                    allowIntersection: false
                }
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    shapeOptions: {
                        color: '#983fb2',
                        weight: 4
                    },
                },
                rectangle: {
                    shapeOptions: {
                        color: '#983fb2',
                        weight: 4
                    },
                },
                polyline: false,
                lineString: false,
                marker: false,
                circlemarker: false, 
                circle: false
            }
}
var drawControl = new L.Control.Draw(drawOptions);
map.addControl(drawControl);

const shapeSelectionOnMap = function(){
    const dates = getDateRange();
    var presRange = getPresRange();
    // Extract GeoJson from featureGroup
    if (drawnItems) {
        let data = drawnItems.toGeoJSON();
        let features = data.features;
        platformProfileMarkersLayer.clearLayers(); //delete platform profiles
        markersLayer.clearLayers();
        let base = '/selection/profiles/map'
        for (let i = 0; i < features.length; i++) {
            const shape = features[i].geometry.coordinates;
            const transformedShape = getTransformedShape(shape)
            let urlQuery = base+'?startDate='+dates.startDate+'&endDate='+dates.endDate+'&presRange='+JSON.stringify(presRange)+'&shape='+JSON.stringify([transformedShape]);
            //let urlQuery = base+'?startDate='+dates.startDate+'&endDate='+dates.endDate+'&shape='+JSON.stringify([transformedShape]);
            displayProfiles(urlQuery);
            console.log(JSON.stringify(urlQuery));
        }
    }
}

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    popupWindowCreation(layer);
    shapeSelectionOnMap()
});

map.on('draw:edited', function (e) {
    var layers = e.layers;
    layers.eachLayer(function (layer) {
        popupWindowCreation(layer)
    });
    shapeSelectionOnMap()
});

const popupWindowCreation = function(layer){
    let layerCoords = layer.toGeoJSON();
    const shape = layerCoords.geometry.coordinates;
    const transformedShape = getTransformedShape(shape);

    const selectionButton = "<input type='button' value='To selection page' onclick='shapeSelection("+'false'+","+JSON.stringify(transformedShape)+")'>"
    const presSelectionButton = "<input type='button' value='To selection page with pressure query' onclick='shapeSelection("+'true'+","+JSON.stringify(transformedShape)+")'>"    
    const popupText = '<b> Hello, im a shape! </b>'
                        +'<br>' + selectionButton + '</b>'
                        +'<br>' + presSelectionButton + '</b>'
    let container = $('<div />');
    container.html(popupText);        
    layer.bindPopup(container[0]);
    layer.on('add', function() { layer.openPopup(); });
    //layer.on('mouseout', function() { layer.closePopup(); });
    drawnItems.addLayer(layer);
}

const shapeSelection = function(presQuery, shape) {
    let base = '/selection/profiles/page'
    let dates = getDateRange();
    console.log(JSON.stringify([shape]))
    if (JSON.parse(presQuery)==true) {
        let presRange = getPresRange();
        var urlQuery = base+'?presRange='+JSON.stringify(presRange)+'&startDate='+dates.startDate+'&endDate='+dates.endDate+'&shape='+JSON.stringify([shape]);
    }
    else {
        var urlQuery = base+'?startDate='+dates.startDate+'&endDate='+dates.endDate+'&shape='+JSON.stringify([shape]);
    }

    window.open(urlQuery,'_blank');
    console.log(urlQuery)
}

map.on('mousemove', function (e) {
    info._div.innerHTML = 'Longitude: ' + e.latlng.lng.toFixed(2) + '<br />' +
                            'Latitude: ' + e.latlng.lat.toFixed(2);
});

var info = L.control({position: 'topright'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    return this._div;
};


info.addTo(map);