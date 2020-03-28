const getTraceParams = function (paramKey, idx) {
    traceParam = {}
    plotNum = parseInt(idx) + 1
    yaxis = 'yaxis' + plotNum.toString()
    xaxis = 'xaxis' + plotNum.toString()
    traceParam['yaxis'] = yaxis
    traceParam['xaxis'] = xaxis
    switch (paramKey.replace(/[0-9]/g, '')) {
        case 'temp':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'temperature: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' C'
            traceParam['title'] = "Temperature <br>[Celsius]"
            traceParam['color'] = 'rgb(220,50,50)'
            break;
        case 'psal':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'psal: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' psu'
            traceParam['title'] = "Salinity [psu]"
            traceParam['color'] = 'rgb(133,212,227)'
            break;
        case 'cndc':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'conductivity: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' mohms/m'
            traceParam['title'] = "Electrical Conductivity <br>[mohms/m]"
            traceParam['color'] = 'rgb(242,231,55)'
            break;
        case 'bbp':
            waveLength = paramKey.replace(/[a-z_]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'backscattering: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' 1/m'
            traceParam['title'] = 'Particle backscattering at <br>' + waveLength + 'nanometers [1/m]'
            traceParam['color'] = 'rgb(27,51,105)'
            break;
        case 'cp':
        waveLength = paramKey.replace(/[a-z_]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'beam attenuation: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' 1/m'
            traceParam['title'] = 'Particle beam attenuation at <br>' + waveLength + 'nanometers [1/m]'
            traceParam['color'] = 'rgb(189,200,202)'
            break;
        case 'doxy':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'doxy: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' micromole/kg'
            traceParam['title'] = "Dissolved Oxygen <br>[micromole/kg]"
            traceParam['color'] = 'rgb(242,231,55)'
            break;
        case 'chla':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'chla: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' mg/m3'
            traceParam['title'] = "Chlorophyll-A [mg/m3]"
            traceParam['color'] = 'rgb(237,113,62)'
            break;
        case 'cdom':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'cdom: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' ppb'
            traceParam['title'] = "Concentration of coloured dissolved <br>organic matter in sea water [ppb]"
            traceParam['color'] = 'rgb(133,212,227)'
            break;
        case 'nitrate':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'nitrate: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' micromole/kg'
            traceParam['title'] = "Nitrate [micromole/kg]"
            traceParam['color'] = 'rgb(40,177,161)'
            break;
        case 'turbidity':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'turbidity: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' ntu'
            traceParam['title'] = "Sea water turbidity [ntu]"
            traceParam['color'] = 'rgb(27,51,105)'
            break;
        case 'bisulfide':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'bisulfide: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' micromole/kg'
            traceParam['title'] = "Bisulfide [micromole/kg]"
            traceParam['color'] = 'rgb(242,231,55)'
            break;
        case 'ph_in_situ_total':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'pH: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' '
            traceParam['title'] = "pH in situ total [ ]"
            traceParam['color'] = 'rgb(242,231,55)'
            break;
        case 'down_irradiance':
            waveLength = paramKey.replace(/[a-z_]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'irradiance: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' W/m^2/nm'
            traceParam['title'] = 'Downwelling irradiance at <br>' + waveLength + ' nanometers [W/m^2/nm]'
            traceParam['color'] = 'rgb(66,50,49)'
            break;
            case 'up_irradiance':
            waveLength = paramKey.replace(/[a-z_]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'irradiance: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' W/m^2/nm'
            traceParam['title'] = 'Upwelling irradiance at <br>' + waveLength + ' nanometers [W/m^2/nm]'
            traceParam['color'] = 'rgb(222,189,153)'
            break;
        case 'downwelling_par':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'irradiance: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' uMol Quanta/m^2/sec'
            traceParam['title'] = "Downwelling photosynthetic <br> available radiation <br> [uMol Quanta/m^2/sec]"
            traceParam['color'] = 'rgb(73,112,109)'
            break;
        default:
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'not listed: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' '
            traceParam['color'] = 'rgb(66,50,49)'
        }
    return traceParam
}

function findKeys(measurements) {
    let pkeys = [];
    for (let idx=0; idx<measurements.length; idx++){
        const keys = Object.keys(measurements[idx])
        pkeys = pkeys.concat(keys)
    }
    let unique_keys = [...new Set(pkeys)]
    return unique_keys
}

function collateMeasurements(measurements) {
    let map = {}
    let keys = findKeys(measurements)

    for (idx in keys) {
        map[keys[idx]] = [];
    }

    for (let i = 0; i < measurements.length; ++i) {
        for (idx in keys) {
            map[keys[idx]].push(measurements[i][keys[idx]])
        }
    }
    return map;
}

$('#downloadProfiles').on('click', function(){
    var url = '/catalog/profiles/' + `#{title}`;
    window.open(url,'_blank');
});

const addLayoutAxis = function(layout, title, xaxis, yaxis) {
    layout[xaxis] = {
        autorange: true,
        title: title
    }
    layout[yaxis] = {
        autorange: 'reversed',
        type: 'linear',
        title: 'Pressure [dbar]'
    }
    return(layout)
}

const makeLayout = function(title, xlabel) {
    layout = {
        autosize: false,
        height: 400, 
        width: 400,
        hovermode: "closest", 
        showlegend: false,
        title: title,
        xaxis: {
            autorange: true,
            title: xlabel
        },
        yaxis: {
            autorange: 'reversed',
            type: 'linear',
            title: 'Pressure [dbar]'
        }
        }
    return(layout)
}


const makeText = function(ylabel, yunits, yvalue, yqc, xlabel, xunits, xvalue, xqc) {
    text = "<br>" + ylabel + yvalue.toString() + yunits
         + "<br>" + 'qc of ' + ylabel + yqc.toString()
         + "<br>" + xlabel + xvalue.toString() + xunits
         + "<br>" + 'qc of ' + xlabel + xqc.toString()
    return (text)
};

const makeTrace = function(tp, key) {
    let hovorText = [];
    for(let idx=0; idx < tp.yvalues.length; idx++){
        let pointText = makeText(tp.ylabel,
                                 tp.yunits,
                                 tp.yvalues[idx],
                                 tp.yqc[idx],
                                 tp.xlabel,
                                 tp.xunits,
                                 tp.xvalues[idx],
                                 tp.xqc[idx])
        hovorText.push(pointText);
    }
    return {
        y: tp.yvalues,
        x: tp.xvalues,
        text: hovorText,
        hoverinfo: 'text',
        mode: 'markers',
        type: 'scatter',
        color: tp.color,
        marker: {
            color: tp.color,
        },
        name: key
    };
};

const getMaskForPair = function(arrayOne, arrayTwo) {
    let mask = [];
    const element = null; // fill value
    for(let idx=0; idx < arrayOne.length; idx++){
        if (arrayOne[idx] === element || arrayTwo[idx] === element || isNaN(arrayOne[idx]) || isNaN(arrayTwo[idx])){
            mask.push(false);
        }
        else {
            mask.push(true)
        }
    }
    return(mask);
}

const roundArray = function (value){ return(Number(value).toFixed(3)) };
