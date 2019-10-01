
const makeColorChartDataArrays = function(profiles) {
    let psal = []
    let pres = []
    let temp = []
    let time = []
    let cycles = []
    let ids = []
    let lats = []
    let longs = []
    let _ids = []
    let data_modes = []

    for(let idx=0; idx < profiles.length; idx++) {
        const profile = profiles[idx]
        let profileMeas = reduceGPSMeasurements(profile, 200)
        profileMeas = collateProfileMeasurements(profileMeas)
        psal = psal.concat(profileMeas.psal)
        pres = pres.concat(profileMeas.pres)
        temp = temp.concat(profileMeas.temp)
        const _id = profile._id
        const data_mode = profile.core_data_mode
        const timeStr = moment.utc(profile.date).format('YYYY-MM-DD HH:mm')
        const cycle = profile.cycle_number
        ids.push(_id)
        lats.push(profile.lat)
        longs.push(profile.lon)

        const id_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,_id)
        const data_mode_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,data_mode)
        const time_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,timeStr)
        const cycle_array = Array.apply(null, Array(profileMeas.pres.length)).map(Number.prototype.valueOf,cycle)
        data_modes = data_modes.concat(data_mode_array)
        _ids = _ids.concat(id_array)
        time = time.concat(time_array)
        cycles = cycles.concat(cycle_array)

    }

    let dataArrays  = {}
    dataArrays.temp = temp
    dataArrays.psal = psal
    dataArrays.pres = pres
    dataArrays.ids = ids
    dataArrays.lats = lats
    dataArrays.longs = longs
    dataArrays._ids = _ids
    dataArrays.data_modes = data_modes
    dataArrays.cycle = cycles
    dataArrays.time = time
    return (dataArrays)
}

const filterColorChartDataArrays = function(dataArrays) {

    presVsTempMask = getMaskForPair(dataArrays.temp, dataArrays.pres)
    presVsPsalMask = getMaskForTrio(dataArrays.psal, dataArrays.pres, dataArrays.temp)

    presForTemp = dataArrays.pres.filter((item, i) => presVsTempMask[i])
    tempForPres = dataArrays.temp.filter((item, i) => presVsTempMask[i])
    cycleForTemp = dataArrays.cycle.filter((item, i) => presVsTempMask[i])
    timeForTemp = dataArrays.time.filter((item, i) => presVsTempMask[i])
    idForTemp = dataArrays._ids.filter((item, i) => presVsTempMask[i])
    data_modesForTemp =  dataArrays.data_modes.filter((item, i) => presVsTempMask[i])

    presForPsal = dataArrays.pres.filter((item, i) => presVsPsalMask[i])
    psalForPres = dataArrays.psal.filter((item, i) => presVsPsalMask[i])
    cycleForPsal = dataArrays.cycle.filter((item, i) => presVsPsalMask[i])
    timeForPsal = dataArrays.time.filter((item, i) => presVsPsalMask[i])
    idForPsal = dataArrays._ids.filter((item, i) => presVsPsalMask[i])
    data_modesForPsal =  dataArrays.data_modes.filter((item, i) => presVsPsalMask[i])

    let chartData = {}
    chartData.presForTemp = presForTemp
    chartData.tempForPres = tempForPres
    chartData.cycleForTemp = cycleForTemp
    chartData.timeForTemp = timeForTemp
    chartData.idForTemp = idForTemp
    chartData.data_modesForTemp = data_modesForTemp

    chartData.presForPsal = presForPsal
    chartData.psalForPres = psalForPres
    chartData.cycleForPsal = cycleForPsal
    chartData.timeForPsal = timeForPsal
    chartData.idForPsal = idForPsal
    chartData.data_modesForPsal = data_modesForPsal

    return (chartData)
}

const makeColorChartText = function(pres, data_mode, date, text, value, units, cycle) {
    return("<br>" + text + value.toString() + " " + units
         + "<br>data mode: " + data_mode
         + "<br>date: " + date.toString()
         + "<br>pressure: " + pres.toString() + " dbar"
         + "<br>cycle: " + cycle.toString()
         + "<br>click to see profile page"
    )
}

const makeColorChartTrace = function(meas, key) {
    let hovorText = []
    for(let idx=0; idx < meas.cvalues.length; idx++){
        let pointText = makeColorChartText(meas.yvalues[idx], meas.data_modes[idx], meas.xvalues[idx], meas.text, meas.cvalues[idx], meas.units, meas.cycle[idx])
        hovorText.push(pointText)
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
    return [scatterTrace]
}

const makeColorChartMeasurements = function(chartData) {
    const tempScl = [[0.0, 'rgb(3, 35, 51)'],
                    [0.125, 'rgb(24, 51, 124)'],
                    [0.25, 'rgb(86, 59, 156)'],
                    [0.375, 'rgb(130, 79, 142)'],
                    [0.5, 'rgb(176, 95, 129)'],
                    [0.625, 'rgb(222, 112, 100)'],
                    [0.75, 'rgb(249, 147, 65)'],
                    [0.875, 'rgb(249, 198, 65)'],
                    [1.0, 'rgb(231, 250, 90)']]

    const psalScl = [[0.0, 'rgb(41, 24, 107)'],
                    [0.125, 'rgb(31, 51, 161)'],
                    [0.25, 'rgb(15, 91, 144)'],
                    [0.375, 'rgb(40, 119, 137)'],
                    [0.5, 'rgb(59, 147, 135)'],
                    [0.625, 'rgb(79, 176, 125)'],
                    [0.75, 'rgb(122, 203, 102)'],
                    [0.875, 'rgb(195, 221, 100)'],
                    [1.0, 'rgb(253, 238, 153)']]

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
        'data_modes': chartData.data_modesForTemp,
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
            'data_modes': chartData.data_modesForPsal,
            'colorbar': {
                title: "Salinity [psu]", 
                len: 1, 
                yanchor: "middle",
                titleside: "right",
                xpad: 5,
                }
            }
        }

return measurements
}

// module.exports = {

//     makeColorChartDataArrays: makeColorChartDataArrays,
//     filterColorChartDataArrays: filterColorChartDataArrays,

// }