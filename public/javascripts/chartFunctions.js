function latSorter(a, b) {
    aNS = a.slice(-1);
    bNS = b.slice(-1);
    aNum = Number(a.slice(0, -2));
    bNum = Number(b.slice(0, -2));
    if (aNS == 'S') { aNum = -1*Number(aNum) }
    if (bNS == 'S') { bNum = -1*Number(bNum) }
    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;
    return 0;
}

function lonSorter(a, b) {
    aNS = a.slice(-1);
    bNS = b.slice(-1);
    aNum = Number(a.slice(0, -2));
    bNum = Number(b.slice(0, -2));
    if (aNS == 'E') { aNum = -1*Number(aNum) }
    if (bNS == 'E') { bNum = -1*Number(bNum) }
    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;
    return 0;
}

const linkToProfilePage = function(data) {
    let xidx = data.points[0].pointNumber
    let profile_id = data.points[0].data.profile_ids[xidx];
    let url = '/catalog/profiles/' + profile_id + '/page'
    window.open(url,'_blank');
};

const mapLinkToProfilePage = function(data) {
    const xidx = data.points[0].pointNumber
    const profile_id = data.points[0].data.text[xidx];
    const url = '/catalog/profiles/' + profile_id + '/page';
    window.open(url,'_blank');
}

const collateProfileMeasurements = function(profile) {
    var collatedProfiles = {};
    let num_measurements = profile.length;
    collatedProfiles.pres = new Array(num_measurements);
    collatedProfiles.temp = new Array(num_measurements);
    collatedProfiles.psal = new Array(num_measurements);

    for (var i = 0; i < num_measurements; ++i) {
        collatedProfiles.pres[i] = profile[i].pres;
        collatedProfiles.temp[i] = profile[i].temp;
        collatedProfiles.psal[i] = profile[i].psal;
    }
    return collatedProfiles;
}

const reduceGPSMeasurements = function(profile, maxLength) {
    if (profile.POSITIONING_SYSTEM === 'GPS') {
        mLen = profile.measurements.length;
        if (mLen > maxLength) {
            //reduce array length to so that only every delta element is plotted
            var delta = Math.floor( mLen / maxLength );
            var reducedMeasurements = [];
            for (var j = 0; j < mLen; j=j+delta) {
                reducedMeasurements.push(profile.measurements[j]);
            }
            return reducedMeasurements;
        }
        else {
            return profile.measurements;
        }
    }
    else {
        return profile.measurements;
    }
}

const dropNegNineNineNine = function(value){ if (value != -999) {return(value)}};
const roundArray = function (value){ return(Number(value).toFixed(3)) };

const getMaskForPair = function(arrayOne, arrayTwo) {
    let mask = [];
    const element = null; // fill value
    for(let idx=0; idx < arrayOne.length; idx++){
        if (arrayOne[idx] === element || arrayTwo[idx] === element){
            mask.push(false);
        }
        else {
            mask.push(true)
        }
    }
    return(mask);
}

//Used to for pres vs psal. if temp reporting nan, psal should be zero too.
const getMaskForTrio = function(arrayOne, arrayTwo, arrayThree) {
    let mask = [];
    const element = null; // fill value
    for(let idx=0; idx < arrayOne.length; idx++){
        if (arrayOne[idx] === element || arrayTwo[idx] === element || arrayThree[idx] === element){
            mask.push(false);
        }
        else {
            mask.push(true)
        }
    }
    return(mask);
}

const makeHistogram = function(x, xtitle) {
    const data = [{
        type: 'histogram',
        x: x,
    }]

    const layout = {
        title: 'Histogram of: ' + xtitle,
        width: 500,
        titlefont: {
            size: 16
        },
        xaxis: {
            autorange: true,
            title: xtitle
        },
        yaxis: {
            autorange: true,
            title: 'frequency'
        },
    }

    return ({data: data, layout: layout})
}

const makeMap = function(lats, longs, ids) {
    const longRange = [Math.min(...longs)-5, Math.max(...longs)+5]
    const latRange = [Math.min(...lats)-5, Math.max(...lats)+5]

    const midLong = (longRange[1] + longRange[0])/2 + longRange[0]
    const midLat = (latRange[1] + latRange[0])/2

    console.log('mid lat lng', midLat, midLong)
    console.log('latRange, longRange', latRange, longRange)
    const data = [{
        type: 'scattergeo',
        mode: 'markers',
        text: ids,
        lon: longs,
        lat: lats,
        marker: {
            size: 7,
                width: 1
            }
        
    }];

    const layout = {
        title: "Profile location",
        width:500,
        titlefont: {
            size: 16
        },
        geo: {
        projection: {
            type: 'orthographic',
            rotation: {
                lon: midLong,
                lat: midLat
            },
        },
            resolution: 50,
            lonaxis: {
                'range': longRange
            },
            lataxis: {
                'range': latRange
            },
            showland: true,
            landcolor: '#EAEAAE',
            countrycolor: '#d3d3d3',
            countrywidth: 1.5,
            subunitcolor: '#d3d3d3'
        }
    };

    return ({data: data, layout: layout})
}

//for testing
// module.exports = {
//     collateProfileMeasurements: collateProfileMeasurements,
//     getMaskForPair: getMaskForPair,
//     getMaskForTrio: getMaskForTrio,
//     reduceGPSMeasurements: reduceGPSMeasurements,
// }
