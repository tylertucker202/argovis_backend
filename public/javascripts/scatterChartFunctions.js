const makeScatterChartDataArrays = function(profiles) {

    let temp = []
    let pres = []
    let psal = []
    let _ids = []

    let lats = []
    let longs = []
    let ids = []
    let data_modes = []

    let cvalues = []

    for(let i=0; i<profiles.length; i++) {
        const profile = profiles[i]
        let profileMeas = reduceGPSMeasurements(profile, 200)
        profileMeas = collateProfileMeasurements(profileMeas) // collect points into arrays
        const _id = profile._id
        const data_mode = profile.core_data_mode
        lats.push(profile.lat)
        longs.push(profile.lon)
        ids.push(_id)

        const color_array = Array.apply(null, Array(profileMeas.pres.length)).map(Number.prototype.valueOf, i)
        const id_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,_id)
        const data_mode_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,data_mode)
        temp = temp.concat(profileMeas.temp)
        pres = pres.concat(profileMeas.pres)
        psal = psal.concat(profileMeas.psal)
        cvalues = cvalues.concat(color_array)
        _ids = _ids.concat(id_array)
        data_modes = data_modes.concat(data_mode_array)
    }

    let dataArrays  = {}
    dataArrays.temp = temp
    dataArrays.psal = psal
    dataArrays.pres = pres
    dataArrays.lats = lats
    dataArrays.longs = longs
    dataArrays.ids = ids
    dataArrays._ids = _ids
    dataArrays.cvalues = cvalues
    dataArrays.data_modes = data_modes
    return (dataArrays)
    }

const filterScatterChartDataArrays = function(dataArrays) {
    presVsTempMask = getMaskForPair(dataArrays.temp, dataArrays.pres)
    presVsPsalMask = getMaskForTrio(dataArrays.psal, dataArrays.pres, dataArrays.temp)
    tempVsPsalMask = getMaskForPair(dataArrays.psal, dataArrays.temp)

    presForTemp = dataArrays.pres.filter((item, i) => presVsTempMask[i])
    tempForPres = dataArrays.temp.filter((item, i) => presVsTempMask[i])
    cvaluesForTempVsPres = dataArrays.cvalues.filter((item, i) => presVsTempMask[i])
    _idsForTempVsPres =  dataArrays._ids.filter((item, i) => presVsTempMask[i])
    data_modesForTempVsPres =  dataArrays.data_modes.filter((item, i) => presVsTempMask[i])

    presForPsal = dataArrays.pres.filter((item, i) => presVsPsalMask[i])
    psalForPres = dataArrays.psal.filter((item, i) => presVsPsalMask[i])
    cvaluesForPsalVsPres = dataArrays.cvalues.filter((item, i) => presVsPsalMask[i])
    _idsForPsalVsPres =  dataArrays._ids.filter((item, i) => presVsPsalMask[i])
    data_modesForPsalVsPres =  dataArrays.data_modes.filter((item, i) => presVsPsalMask[i])

    psalForTemp = dataArrays.psal.filter((item, i) => tempVsPsalMask[i])
    tempForPsal = dataArrays.temp.filter((item, i) => tempVsPsalMask[i])
    cvaluesForTempVsPsal = dataArrays.cvalues.filter((item, i) => tempVsPsalMask[i])
    _idsForTempVsPsal =  dataArrays._ids.filter((item, i) => tempVsPsalMask[i])
    data_modesForTempVsPsal =  dataArrays.data_modes.filter((item, i) => tempVsPsalMask[i])

    let chartData = {}
    chartData.presForTemp = presForTemp
    chartData.tempForPres = tempForPres
    chartData.cvaluesForTempVsPres = cvaluesForTempVsPres
    chartData._idsForTempVsPres = _idsForTempVsPres
    chartData.data_modesForTempVsPres = data_modesForTempVsPres

    chartData.presForPsal = presForPsal
    chartData.psalForPres = psalForPres
    chartData.cvaluesForPsalVsPres = cvaluesForPsalVsPres
    chartData._idsForPsalVsPres = _idsForPsalVsPres
    chartData.data_modesForPsalVsPres = data_modesForPsalVsPres

    chartData.psalForTemp = psalForTemp
    chartData.tempForPsal = tempForPsal
    chartData.cvaluesForTempVsPsal = cvaluesForTempVsPsal
    chartData._idsForTempVsPsal = _idsForTempVsPsal
    chartData.data_modesForTempVsPsal = data_modesForTempVsPsal

    return (chartData)
}


const makeScatterChartText = function(profile_id, data_mode, ylabel, yunits, yvalue, xlabel, xunits, xvalue) {
    text = "<br>profile id: " + profile_id
         + "<br>data mode: " + data_mode
         + "<br>" + ylabel + yvalue.toString() + yunits
         + "<br>" + xlabel + xvalue.toString() + xunits
         + "<br>click to see profile page"
    return (text)
}

const makeScatterChartTrace = function(xvalues,
                                        yvalues,
                                        cvalues,
                                        profile_ids,
                                        data_modes,
                                        plot_name,
                                        colorscale,
                                        ylabel,
                                        xlabel,
                                        yunits,
                                        xunits) {
    let hovorText = []
    for(let idx=0; idx < yvalues.length; idx++){
        let pointText = makeScatterChartText(profile_ids[idx],
                                 data_modes[idx],
                                 ylabel,
                                 yunits,
                                 yvalues[idx],
                                 xlabel,
                                 xunits,
                                 xvalues[idx])
        hovorText.push(pointText)
    }
    scatterGlTrace = {
        y: yvalues,
        x: xvalues,
        //text: profile_ids.map(makeText),
        text: hovorText,
        hoverinfo: 'text',
        showlegend: false,
        type: 'scattergl',
        mode: 'markers',
        profile_ids: profile_ids,
        marker: { color: cvalues,
                    size: 5,
                    symbol: 'dot',
                    opacity: 1,
                    colorscale: colorscale
                },
        name: plot_name, 
        
    }
    return [scatterGlTrace]
}

// module.exports = {

//     makeScatterChartDataArrays: makeScatterChartDataArrays,
//     filterScatterChartDataArrays: filterScatterChartDataArrays,

// }