const argoIcon = L.icon({
    iconUrl: '../images/dot_yellow.png',
    iconSize:     [12, 12], 
    iconAnchor:   [0, 0],
    popupAnchor:  [6, 6]
});

const platformIcon = L.icon({
    iconUrl: '../images/dot_orange.png',
    iconSize:     [12, 12], 
    iconAnchor:   [0, 0],
    popupAnchor:  [6, 6]
});

const argoIconBW = L.icon({
    iconUrl: '../images/dot_grey.png',
    iconSize:     [12, 12], 
    iconAnchor:   [0, 0],
    popupAnchor:  [6, 6]
});

var markersLayer = new L.layerGroup();
var platformProfileMarkersLayer = new L.layerGroup();

//close popups from all drawn items
const closeDrawnItemPopups = function() {
    //close popups from all drawn items
    if (drawnItems){
        console.log('closing drawn items');
        drawnItems.eachLayer(function (layer) {
            layer.closePopup();
        });
    }    
}

const displayProfiles = function(url, markerType) {
    platformProfileMarkersLayer.clearLayers();
    $.getJSON(url, function(result){
        if (result.length > 1000) {
            closeDrawnItemPopups()
            alert("This query is too large."
                  + "Only 1000 profiles will appear in the selection region."
                  + " Try reducing the polygon size or date range");
        }
        $.each(result, function(i, profile){
            if (markerType==='history') {
                addToMarkersLayer(profile, argoIconBW, platformProfileMarkersLayer);
            }
            else if (markerType==='platform') {
                addToMarkersLayer(profile, platformIcon, platformProfileMarkersLayer);
            }
            else {
                addToMarkersLayer(profile, argoIcon, markersLayer);
            }
        });
        platformProfileMarkersLayer.addTo(map);
        markersLayer.addTo(map);
    }).fail(function(){
        closeDrawnItemPopups(); 
        alert('Points did not load, try reducing the polygon size or date range.')});
};

//populate map with most recent profiles
//displayProfiles('/selection/lastProfiles');
displayProfiles('/selection/latestProfiles/map');

const platformProfilesSelection = function(selectedPlatform, markerType){
    if (selectedPlatform) {
        var url = '/catalog/platforms/'+selectedPlatform+'/map';
        displayProfiles(url, markerType);
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
    const markerType='history';
    const platformButton = "<input type='button' value='Position history' onclick=platformProfilesSelection("+selectedPlatform.toString()+",'history')>"
    const platformLink = "<a href='/catalog/platforms/" + selectedPlatform + "/page' target='_blank' >To platform page</a>";
    const popupText = '<b>Hello, I\'m ' + profile_id + '!</b>'
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

$('#clearProfiles').on('click', function(){
    platformProfileMarkersLayer.clearLayers(); //delete platform profiles
    markersLayer.clearLayers();
    if(drawnItems){
        drawnItems.clearLayers();
    }
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