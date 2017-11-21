const argoIcon = L.icon({
    iconUrl: '../images/Argo_Logo_VS.gif',
    iconSize:     [25, 25], 
    iconAnchor:   [0, 0],
    popupAnchor:  [20, 20]
});

const argoIconSm = L.icon({
    iconUrl: '../images/Argo_Logo_VS.gif',
    iconSize:     [10, 10], 
    iconAnchor:   [0, 0],
    popupAnchor:  [20, 20]
});

const argoIconBW = L.icon({
    iconUrl: '../images/Argo_Logo_VS_BW.gif',
    iconSize:     [10, 10],
    iconAnchor:   [0, 0],
    popupAnchor:  [20, 20] 
});

//populate map with most recent profiles
var markersLayer = new L.layerGroup();
var platformProfileMarkersLayer = new L.layerGroup();

const displayProfiles = function(url, bwIcon, size) {
    platformProfileMarkersLayer.clearLayers();
    $.getJSON(url, function(result){
        $.each(result, function(i, profile){
            if (bwIcon) {
                addToMarkersLayer(profile, argoIconBW, platformProfileMarkersLayer);
            }
            else if (size==='small') {
                addToMarkersLayer(profile, argoIconSm, platformProfileMarkersLayer);
            }
            else {
                addToMarkersLayer(profile, argoIcon, markersLayer);
            }
        });
        platformProfileMarkersLayer.addTo(map);
        markersLayer.addTo(map);
    });
};

//displayProfiles('/selection/lastProfiles');
displayProfiles('/selection/latestProfiles/map');

const platformProfilesSelection = function(selectedPlatform, bwIcon, size){
    if (selectedPlatform) {
        var url = '/catalog/platforms/'+selectedPlatform+'/map';
        displayProfiles(url, bwIcon, size);
    }
};

function addToMarkersLayer(profile, markerIcon, markers) {
    const selectedPlatform = profile.platform_number;
    const geoLocation = profile.geoLocation;
    const lat = geoLocation.coordinates[1].toFixed(2);
    const lon = geoLocation.coordinates[0].toFixed(2);
    const cycle = profile.cycle_number
    const profile_id = selectedPlatform.toString()+'_'+cycle.toString();

    // plots the markers on the map three times. 
    const makeWrappedCoordinates = function (coordinates) {
        const lat = coordinates[1];
        const lon = coordinates[0];
        if (0 > lon && lon > -180) {
            var coords = [[lon, lat], [lon + 360, lat]]
        }
        else if (0 < lon && lon < 180) {
            var coords = [[lon, lat], [lon - 360, lat]];
        }
        else{ var coords = [[lon, lat]]}

        return coords;
    };

    const wrappedCoordinates = makeWrappedCoordinates(geoLocation.coordinates);

    if (markerIcon === undefined) {
        markerIcon = argoIcon;
    }
    var profileLink = "<a href='/catalog/profiles/"+profile_id+"/page' target='_blank'> To profile page</a>";
    const platformButton = "<input type='button' value='Position history' onclick='platformProfilesSelection("+selectedPlatform.toString()+", true)'>"
    const platformLink = "<a href='/catalog/platforms/" + selectedPlatform + "/page' target='_blank' >To platform page</a>";
    const popupText = '<b>Hello, im ' + profile_id + '!</b>'
                    + '<br>lon: ' + lon + '</b>'
                    + '<br>lat: ' + lat + '</b>'
                    + '<br>cycle: ' + cycle.toString() + '</b>'
                    + '<br>date: ' + moment(profile.date).format('YYYY-MM-DD') + '</b>'
                    + '<br>' + profileLink + '</b>'
                    + '<br>' + platformLink + '</b>'
                    + '<br>' + platformButton + '</b>'
    // Create an element to hold all your text and markup
    let container = $('<div />');
    // Delegate all event handling for the container itself and its contents to the container

    // Insert whatever you want into the container, using whichever approach you prefer
    container.html(popupText);
    
    for(let i = 0; i < wrappedCoordinates.length; i++) {
        let marker;
        const coordinates = wrappedCoordinates[i];
        marker = L.marker(coordinates.reverse(), {icon: markerIcon}).bindPopup(container[0]);
        markers.addLayer(marker);
    }
};

$('#latestProfileSelection').on('click', function(){
    platformProfileMarkersLayer.clearLayers(); //delete platform profiles
    markersLayer.clearLayers();
    if(drawnItems){
        drawnItems.clearLayers();
    }
    displayProfiles('/selection/latestProfiles/map');
})

const getTransformedShape = function(shape) {
    let transformedShape = [];
    //console.log('before tranformation');
    //console.log(JSON.stringify(shape));
    //console.log('number of points: '+shape[0].length);
    for (let j = 0; j < shape[0].length; j++) {
        //transformation if shape is outside latitude.
        let lat = shape[0][j][0] % 360;
        //crossing antimeridian transformation
        if (lat < -180) {
            lat = 180 + lat % 180;
        }
        let point = [lat, shape[0][j][1]];
        transformedShape.push(point);
    }
    return(transformedShape)
};