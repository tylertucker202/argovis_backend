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

const vertex = L.icon({
    iconUrl: '../images/dot_grey.png',
    iconSize:     [12, 12], 
    iconAnchor:   [0, 0],
    popupAnchor:  [6, 6]    
})

var markersLayer = new L.layerGroup();
var platformProfileMarkersLayer = new L.layerGroup();

//close popups from all drawn items
const closeDrawnItemPopups = function() {
    //close popups from all drawn items
    if (drawnItems){
        console.log('closeDrawnItemPopups: closing drawn items');
        drawnItems.eachLayer(function (layer) {
            layer.closePopup();
        });
    }    
}

//close popups from all drawn items
const openDrawnItemPopups = function() {
    //close popups from all drawn items
    if (drawnItems){
        console.log('openDrawnItemPopups: closing drawn items');
        drawnItems.eachLayer(function (layer) {
            layer.openPopup();
        });
    }    
}

alertify.set('notifier','position', 'top-center');

const displayProfiles = function(url, markerType, latestBool) {
    platformProfileMarkersLayer.clearLayers();
    console.log(url);
    $.getJSON(url, function(result){
        if (result.length > 1000 && latestBool === false) {
            closeDrawnItemPopups()
            alertify.alert("This query is too large."
            + " Only 1001 profiles will be included in the selection page."
            + " Try reducing the polygon size or date range."
            + " Another option is to use an API. See www.itsonlyamodel.us/argovis-python-api.html for more details.");
        }
        else if (result.length == 0) {
            alertify.notify('No profiles inside this region', 'warning', 5)
            //alertify.alert('No profiles inside this region');
        }
        else {
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
            openDrawnItemPopups();
            platformProfileMarkersLayer.addTo(map);
            markersLayer.addTo(map);
        }
    }).fail(function(){
        closeDrawnItemPopups();
        alertify.alert('Points did not load, try reducing the polygon size or date range...or try restarting Argovis')});
};

//populate map with most recent profiles
displayProfiles('/selection/lastProfiles?map', '', true);
//displayProfiles('/selection/latestProfiles/map', '', true);

const platformProfilesSelection = function(selectedPlatform, markerType){
    if (selectedPlatform) {
        var url = '/catalog/platforms/'+selectedPlatform+'/map';
        displayProfiles(url, markerType, false);
    }
};

function addToMarkersLayer(profile, markerIcon, markers) {
    const selectedPlatform = profile.platform_number;
    const geoLocation = profile.geoLocation;
    var lat = geoLocation.coordinates[1].toFixed(2);
    var lon = geoLocation.coordinates[0].toFixed(2);
    if (lat > 0) {
        var strLat = Math.abs(lat).toFixed(3).toString() + ' N';
    }
    else {
        var strLat = Math.abs(lat).toFixed(3).toString() + ' S';
    }
    if (lon > 0) {
        var strLon = Math.abs(lon).toFixed(3).toString() + ' E';
    }
    else {
        var strLon = Math.abs(lon).toFixed(3).toString() + ' W';
    }
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
                    + '<br>lon: ' + strLon + '</b>'
                    + '<br>lat: ' + strLat + '</b>'
                    + '<br>cycle: ' + cycle.toString() + '</b>'
                    + '<br>date: ' + moment.utc(profile.date).format('YYYY-MM-DD') + '</b>'
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
    displayProfiles('/selection/latestProfiles/map', '', true);
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
        let lon = shape[0][j][0] % 360;
        //crossing antimeridian transformation
        if (lon < -180) {
            lon = 180 + lon % 180;
        }
        else if (lon > 180) {
            lon = 180 - lon % 180;
        }
        let point = [lon, shape[0][j][1]];
        transformedShape.push(point);
    }
    return(transformedShape)
};