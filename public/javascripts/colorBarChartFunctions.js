
const makeColorChartDataArrays = function(profiles) {
    let psal = [];
    let pres = [];
    let temp = [];
    let time = [];
    let cycle = [];
    let id = [];
    let lats = [];
    let longs = [];
    let ids = [];
    for(let idx=0; idx < profiles.length; idx++) {
        const profile = profiles[idx]
        let profileMeas = reduceGPSMeasurements(profile, 200);
        profileMeas = collateProfileMeasurements(profileMeas);
        psal = psal.concat(profileMeas.psal);
        pres = pres.concat(profileMeas.pres);
        temp = temp.concat(profileMeas.temp);

        lats.push(profile.lat);
        longs.push(profile.lon);
        ids.push(profile._id);

        let profTime = [];
        let cycleIdx = [];
        let profileId = [];
        for (let jdx=0; jdx<profileMeas.pres.length; jdx++) {
            profTime.push(moment.utc(profile.date).format('YYYY-MM-DD HH:mm'))
            cycleIdx.push(profile.cycle_number); //just an array of cycle number
            profileId.push(profile._id);
        }
        time = time.concat(profTime);
        cycle = cycle.concat(cycleIdx);
        id = id.concat(profileId);
    };

    let dataArrays  = {}
    dataArrays.temp = temp
    dataArrays.psal = psal
    dataArrays.pres = pres
    dataArrays.id = id
    dataArrays.lats = lats
    dataArrays.longs = longs
    dataArrays.ids = ids
    dataArrays.cycle = cycle
    dataArrays.time = time
    return (dataArrays)
}

const filterColorChartDataArrays = function(dataArrays) {

    presVsTempMask = getMaskForPair(dataArrays.temp, dataArrays.pres);
    presVsPsalMask = getMaskForTrio(dataArrays.psal, dataArrays.pres, dataArrays.temp);

    presForTemp = dataArrays.pres.filter((item, i) => presVsTempMask[i]);
    tempForPres = dataArrays.temp.filter((item, i) => presVsTempMask[i]);
    cycleForTemp = dataArrays.cycle.filter((item, i) => presVsTempMask[i]);
    timeForTemp = dataArrays.time.filter((item, i) => presVsTempMask[i]);
    idForTemp = dataArrays.id.filter((item, i) => presVsTempMask[i]);

    presForPsal = dataArrays.pres.filter((item, i) => presVsPsalMask[i]);
    psalForPres = dataArrays.psal.filter((item, i) => presVsPsalMask[i]);
    cycleForPsal = dataArrays.cycle.filter((item, i) => presVsPsalMask[i]);
    timeForPsal = dataArrays.time.filter((item, i) => presVsPsalMask[i]);
    idForPsal = dataArrays.id.filter((item, i) => presVsPsalMask[i]);

    let chartData = {}
    chartData.presForTemp = presForTemp
    chartData.tempForPres = tempForPres
    chartData.cycleForTemp = cycleForTemp
    chartData.timeForTemp = timeForTemp
    chartData.idForTemp = idForTemp

    chartData.presForPsal = presForPsal
    chartData.psalForPres = psalForPres
    chartData.cycleForPsal = cycleForPsal
    chartData.timeForPsal = timeForPsal
    chartData.idForPsal = idForPsal

    return (chartData)
}

const makeColorChartText = function(pres, date, text, value, units, cycle) {
    return("<br>" + text + value.toString() + " " + units
         + "<br>date: " + date.toString()
         + "<br>pressure: " + pres.toString() + " dbar"
         + "<br>cycle: " + cycle.toString()
         + "<br>click to see profile page"
    )
};

const makeColorChartTrace = function(meas, key) {
    let hovorText = [];
    for(let idx=0; idx < meas.cvalues.length; idx++){
        let pointText = makeColorChartText(meas.yvalues[idx], meas.xvalues[idx], meas.text, meas.cvalues[idx], meas.units, meas.cycle[idx])
        hovorText.push(pointText);
    }
    scatterTrace = {
        y: meas.yvalues,
        x: meas.xvalues,
        text: hovorText,
        hoverinfo: 'text',
        showlegend: false,
        type: 'scattergl',
        mode: 'markers',
        cycle: meas.cycle,
        profile_ids: meas.id,
        marker: { color: meas.cvalues,
                    size: 5,
                    symbol: 'dot',
                    opacity: 1,
                    reversescale: false,
                    colorscale: meas.colorscale,
                    colorbar: meas.colorbar,
                },
        name: key, 
    }
    return [scatterTrace];
};

const makeColorChartMeasurements = function(chartData) {
    const tempScl = [[0.0, 'rgb(3, 35, 51)'],
                    [0.125, 'rgb(24, 51, 124)'],
                    [0.25, 'rgb(86, 59, 156)'],
                    [0.375, 'rgb(130, 79, 142)'],
                    [0.5, 'rgb(176, 95, 129)'],
                    [0.625, 'rgb(222, 112, 100)'],
                    [0.75, 'rgb(249, 147, 65)'],
                    [0.875, 'rgb(249, 198, 65)'],
                    [1.0, 'rgb(231, 250, 90)']];

    const psalScl = [[0.0, 'rgb(41, 24, 107)'],
                    [0.125, 'rgb(31, 51, 161)'],
                    [0.25, 'rgb(15, 91, 144)'],
                    [0.375, 'rgb(40, 119, 137)'],
                    [0.5, 'rgb(59, 147, 135)'],
                    [0.625, 'rgb(79, 176, 125)'],
                    [0.75, 'rgb(122, 203, 102)'],
                    [0.875, 'rgb(195, 221, 100)'],
                    [1.0, 'rgb(253, 238, 153)']];

    const measurements = {'pres_v_temp': {
        'xvalues': chartData.timeForTemp,
        'yvalues': chartData.presForTemp.map(roundArray),
        'cvalues': chartData.tempForPres.map(roundArray),
        'text': 'temperature: ',
        'yaxis': 'y2',
        'xaxis': 'x1',
        'units': 'C',
        'cycle': chartData.cycleForTemp,
        'colorscale': tempScl,
        'id': idForTemp,
        'colorbar': {
                title: "Temp. [Celsius]", 
                len: 1, 
                yanchor: "middle",
                titleside: "right",
                xpad: 10,
                }
        },
        'pres_v_psal': {
            'xvalues': chartData.timeForPsal,
            'yvalues': chartData.presForPsal.map(roundArray),
            'cvalues': chartData.psalForPres.map(roundArray),
            'text': 'salinity: ',
            'yaxis': 'y1',
            'xaxis': 'x1',
            'units': 'psu',
            'cycle': chartData.cycleForPsal,
            'colorscale': psalScl,
            'id': chartData.idForPsal,
            'colorbar': {
                title: "Salinity [psu]", 
                len: 1, 
                yanchor: "middle",
                titleside: "right",
                xpad: 5,
                }
            }
        };

return measurements
}

// module.exports = {

//     makeColorChartDataArrays: makeColorChartDataArrays,
//     filterColorChartDataArrays: filterColorChartDataArrays,

// }