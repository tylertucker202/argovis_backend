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

