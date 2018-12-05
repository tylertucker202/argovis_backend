const getTraceParams = function (paramKey, idx) {
    traceParam = {}
    plotNum = parseInt(idx) + 1
    yaxis = 'yaxis' + plotNum.toString()
    xaxis = 'xaxis' + plotNum.toString()
    xanchor = 'x' + plotNum.toString()
    yanchor = 'x' + plotNum.toString()
    traceParam['yaxis'] = yaxis
    traceParam['xaxis'] = xaxis
    traceParam['yanchor'] = yanchor
    traceParam['xanchor'] = xanchor
    switch (paramKey.replace(/[0-9]/g, '')) {
        case 'temp':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'temperature: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' C'
            traceParam['title'] = "Temperature \n [Celsius]"
            break;
        case 'psal':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'psal: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' psu'
            traceParam['title'] = "Salinity [psu]"
            break;
        case 'cndc':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'conductivity: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' mohms/m'
            traceParam['title'] = "Electrical \n Conductivity \n [mohms/m]"
            break;
        case 'bbp':
            waveLength = paramKey.replace(/[a-z]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'backscattering: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' 1/m'
            traceParam['title'] = 'Particle \n backscattering at \n ' + waveLength + 'nanometers [1/m]'
            break;
        case 'cp':
        waveLength = paramKey.replace(/[a-z]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'beam attenuation: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' 1/m'
            traceParam['title'] = 'Particle beam \n attenuation at \n ' + waveLength + 'nanometers [1/m]'
            break;
        case 'doxy':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'doxy: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' micromole/kg'
            traceParam['title'] = "Dissolved \n Oxygen \n [micromole/kg]"
            break;
        case 'chla':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'chla: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' mg/m3'
            traceParam['title'] = "Chlorophyll-A [mg/m3]"
            break;
        case 'cdom':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'cdom: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' ppb'
            traceParam['title'] = "Concentration of \n coloured dissolved \n organic matter in \n sea water [ppb]"
            break;
        case 'nitrate':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'nitrate: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' micromole/kg'
            traceParam['title'] = "Nitrate [micromole/kg]"
            break;
        case 'turbidity':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'turbidity: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' ntu'
            traceParam['title'] = "Sea water \n turbidity [ntu]"
            break;
        case 'bisulfide':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'bisulfide: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' micromole/kg'
            traceParam['title'] = "Bisulfide [micromole/kg]"
            break;
        case 'ph_in_situ_total':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'pH: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' [ ]'
            traceParam['title'] = "pH in situ total [ ]"
            break;
        case 'down_irradiance':
            waveLength = paramKey.replace(/[a-z]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'irradiance: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' W/m^2/nm'
            traceParam['title'] = 'Downwelling \n irradiance at \n ' + waveLength + ' nanometers [W/m^2/nm]'
            break;
            case 'up_irradiance':
            waveLength = paramKey.replace(/[a-z]/g, '')
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'irradiance: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' W/m^2/nm'
            traceParam['title'] = 'Upwelling \n irradiance at \n ' + waveLength + ' nanometers [W/m^2/nm]'
            break;
        case 'downwelling_par':
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'irradiance: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' uMol Quanta/m^2/sec'
            traceParam['title'] = "Downwelling \n photosynthetic \n available \n radiation [uMol Quanta/m^2/sec]"
            break;
        default:
            traceParam['ylabel'] = 'pressure: '
            traceParam['xlabel'] = 'not listed: '
            traceParam['yunits'] = ' dbar'
            traceParam['xunits'] = ' []'
        }
    return traceParam
}

function collateMeasurements(list) {
    var map = {};
    var keys = Object.keys(list[0]);

    for (idx in keys) {
        map[keys[idx]] = [];
    }

    for (var i = 0; i < list.length; ++i) {
        for (idx in keys) {
            map[keys[idx]].push(list[i][keys[idx]])
        }
    }
    return map;
}

$('#downloadProfiles').on('click', function(){
    var url = '/catalog/profiles/' + `#{title}`;
    window.open(url,'_blank');
});

const addLayoutAxis = function(layout, title, domain, xaxis, yaxis, yanchor) {
    layout[xaxis] = {
        domain: domain,
        autorange: true,
        title: title
    }
    layout[yaxis] = {
        anchor: yanchor,
        autorange: 'reversed',
        type: 'linear',
        title: 'Pressure [dbar]'
    }
    return(layout)
}

const makeDomainList = function(nPlots) {
    domains = []
    const padding = .05
    domains.push([0, 1/nPlots - padding])
    for(let idx=1; idx < nPlots-1; idx++) {
        lD = idx / nPlots + padding
        uD = (idx + 1) / nPlots - padding
        domains.push([lD, uD])
    }
    if (nPlots == 2) { uD = 1/nPlots - padding }
    domains.push([ uD + padding ,1])

    return(domains)
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
        xaxis: tp.xanchor,
        yaxis: tp.yanchor,
        mode: 'markers',
        type: 'scatter',
        name: key
    };
};

const getMaskForPair = function(arrayOne, arrayTwo) {
    let mask = [];
    const element = -999; // -999 is the actual nan value. -900 just in case of decimal
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

const roundArray = function (value){ return(Number(value).toFixed(3)) };