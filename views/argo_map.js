var map = L.map('map').setView([#{lat},#{lng}], 5);
var satelliteMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                            { maxZoom: 13,
                                minZoom: 3,
                                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                            
});

var googleMap = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
                            { maxZoom: 13,
                                minZoom: 3,
                                attribution: 'google'})

var drawnItems = new L.featureGroup().addTo(map);
L.control.layers({
    'Esri World Imagery ': satelliteMap.addTo(map),
    'Google': googleMap
    },
    { 'drawlayer': drawnItems },
    { position: 'topleft', collapsed: false }
).addTo(map);

var drawOptions = {
            edit: {
                featureGroup: drawnItems,
                poly: {
                    allowIntersection: false
                }
            },
            draw: {
                polygon: {
                    allowIntersection: false,
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

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
});