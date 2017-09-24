const argoIcon = L.icon({
    iconUrl: '../images/Argo_Logo_VS.gif',
    iconSize:     [35, 35], 
    iconAnchor:   [0, 0],
    popupAnchor:  [20, 20]
});

const argoIconBW = L.icon({
    iconUrl: '../images/Argo_Logo_VS_BW.gif',
    iconSize:     [15, 15],
    iconAnchor:   [0, 0],
    popupAnchor:  [20, 20] 
});

//populate map with most recent profiles
var markersLayer = new L.layerGroup();
var platformProfileMarkersLayer = new L.layerGroup();


const displayProfiles = function(url) {
    $.getJSON(url, function(result){
        $.each(result, function(i, profile){
            addToMarkersLayer(profile, argoIcon, markersLayer);
        });
        markersLayer.addTo(map);
    });
};

const displayPlatformProfiles = function(url) {
    platformProfileMarkersLayer.clearLayers();
    $.getJSON(url, function(result){
        $.each(result, function(i, profile){
            addToMarkersLayer(profile, argoIconBW, platformProfileMarkersLayer);
        });
        platformProfileMarkersLayer.addTo(map);            
    });
};

//displayProfiles('/selection/lastProfiles');
displayProfiles('/selection/latestProfiles/map');

const platformProfilesSelection = function(selectedPlatform){
    if (selectedPlatform) {
        var url = '/catalog/platforms/'+selectedPlatform;
        displayPlatformProfiles(url);
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
        const coords = [[lon, lat], [lon - 360, lat], [lon + 360, lat]];
        return coords;
    };

    const wrappedCoordinates = makeWrappedCoordinates(geoLocation.coordinates);

    if (markerIcon === undefined) {
        markerIcon = argoIcon;
    }
    var profileLink = "<a href='/catalog/profiles/"+profile_id+"/page' > To profile page</a>";
    const platformButton = "<input type='button' value='show all platform profiles' onclick='platformProfilesSelection("+selectedPlatform.toString()+")'>"
    const platformLink = "<a href='/catalog/platforms/" + selectedPlatform + "/page' >To platform page</a>";
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

$('#lastProfileSelection').on('click', function(){
    platformProfileMarkersLayer.clearLayers(); //delete platform profiles
    markersLayer.clearLayers();
    displayProfiles('/selection/lastProfiles'+'/map');
})

$('#latestProfileSelection').on('click', function(){
    platformProfileMarkersLayer.clearLayers(); //delete platform profiles
    markersLayer.clearLayers();
    displayProfiles('/selection/latestProfiles/map');
})

const getDateRange = function() {
    // Extract dates from daterange picker
    let dates = {}
    let startDate = $('#daterange').data('daterangepicker').startDate._d;
    let endDate = $('#daterange').data('daterangepicker').endDate._d;
    startDate = moment(startDate).format('YYYY-MM-DD');
    endDate = moment(endDate).format('YYYY-MM-DD');
    dates.startDate = startDate;
    dates.endDate = endDate;
    return(dates)
};

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

$('#shapeSelection').on('click', function(){
    const dates = getDateRange();
    let maxPres = document.getElementById('maxPres').value;
    console.log(maxPres);
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
            //console.log('after tranformation for shape: '+i);
            //console.log(JSON.stringify([transformedShape]));
            let urlQuery = base+'?startDate='+dates.startDate+'&endDate='+dates.endDate+'&maxPres='+maxPres+'&shape='+JSON.stringify([transformedShape]);
            //let urlQuery = base+'?startDate='+dates.startDate+'&endDate='+dates.endDate+'&shape='+JSON.stringify([transformedShape]);
            displayProfiles(urlQuery);
            console.log(JSON.stringify(urlQuery));
        }
    }
});