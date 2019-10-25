module.exports = {


collateProfileMeasurements: function(measurements) {
    let collatedProfiles = {}
    let num_measurements = measurements.length
    collatedProfiles.pres = new Array(num_measurements)
    collatedProfiles.temp = new Array(num_measurements)
    collatedProfiles.psal = new Array(num_measurements)

    for (let idx = 0; idx < num_measurements; ++idx) {
        collatedProfiles.pres[idx] = measurements[idx].pres
        collatedProfiles.temp[idx] = measurements[idx].temp
        collatedProfiles.psal[idx] = measurements[idx].psal
    }
    return collatedProfiles
},

getMaskForPair: function(arrayOne, arrayTwo) {
    let mask = []
    const fillValue = null 
    for(let idx=0; idx < arrayOne.length; idx++){
        if (arrayOne[idx] === fillValue || arrayTwo[idx] === fillValue){
            mask.push(false)
        }
        else {
            mask.push(true)
        }
    }
    return(mask)
},

//Used to for pres vs psal. if temp reporting nan, psal should be zero too.
getMaskForTrio: function(arrayOne, arrayTwo, arrayThree) {
    let mask = []
    const fillValue = null 
    for(let idx=0; idx < arrayOne.length; idx++){
        if (arrayOne[idx] === fillValue || arrayTwo[idx] === fillValue || arrayThree[idx] === fillValue){
            mask.push(false)
        }
        else {
            mask.push(true)
        }
    }
    return(mask)
},

reduceGPSMeasurements: function(profile, maxLength) {
    if (profile.POSITIONING_SYSTEM === 'GPS' || profile.POSITIONING_SYSTEM === 'IRIDIUM') {
        let mLen = profile.measurements.length
        if (mLen > maxLength) {
            //reduce array length to so that only every delta element is plotted
            var delta = Math.floor( mLen / maxLength )
            var reducedMeasurements = []
            for (let jdx = 0; jdx < mLen; jdx=jdx+delta) {
                reducedMeasurements.push(profile.measurements[jdx])
            }
            return reducedMeasurements
        }
        else {
            return profile.measurements
        }
    }
    else {
        return profile.measurements
    }
},

makeSelectionProfileArrays: function(profiles) {
    var traces = []
    var temp = []
    var pres = []
    var psal = []
    var _ids = []
    var cvalues = []

    for(var idx=0; idx<profiles.length; idx++) {
        let profile = profiles[idx]
        console.log('on profile with length')
        console.log(idx)
        console.log(profile.measurements.length)
        var profileMeas = this.reduceGPSMeasurements(profile, 200)
        profileMeas = this.collateProfileMeasurements(profileMeas) // collect points into arrays
        var _id = profiles[idx]._id
        var color_array = Array.apply(null, Array(profileMeas.pres.length)).map(Number.prototype.valueOf, idx)
        var id_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,_id)
        temp = temp.concat(profileMeas.temp)
        pres = pres.concat(profileMeas.pres)
        psal = psal.concat(profileMeas.psal)
        cvalues = cvalues.concat(color_array)
        _ids = _ids.concat(id_array)
    return ({'temp': temp, 'pres': pres, 'psal': psal, 'cvalues': cvalues, '_ids': _ids})
    }
},

makePlatformProfileArrays: function(profiles) {
    let psal = []
    let pres = []
    let temp = []
    let cycle = []
    for(var idx=0; idx < profiles.length; idx++) {
        var profileMeas = reduceGPSMeasurements(profiles[idx], 200)
        profileMeas = this.collateProfileMeasurements(profileMeas)
        psal = psal.concat(profileMeas.psal)
        pres = pres.concat(profileMeas.pres)
        temp = temp.concat(profileMeas.temp)

        let meas_idx = []
        for (var jdx=0; jdx<profileMeas.pres.length; jdx++) {
            meas_idx.push(profiles[idx].cycle_number) //just an array of cycle number
        }
        cycle = cycle.concat(meas_idx)
        return ({'temp': temp, 'pres': pres, 'psal': psal, 'cycle': cycle})
    }
},

filterProfiles: function(temp, pres, psal, cycle) {
    out = {}
    presVsTempMask = this.getMaskForPair(temp, pres)
    presVsPsalMask = this.getMaskForTrio(psal, pres, temp)

    out.presForTemp = pres.filter((item, idx) => presVsTempMask[idx])
    out.tempForPres = temp.filter((item, idx) => presVsTempMask[idx])
    out.cycleForTemp = cycle.filter((item, idx) => presVsTempMask[idx])

    out.presForPsal = pres.filter((item, idx) => presVsPsalMask[idx])
    out.psalForPres = psal.filter((item, idx) => presVsPsalMask[idx])
    out.cycleForPsal = cycle.filter((item, idx) => presVsPsalMask[idx])
    return(out)
},

filterSelection: function(temp, pres, psal, cvalues, _ids) {
       //filter using Tyler's algorithm
    presVsTempMask = this.getMaskForPair(temp, pres)
    presVsPsalMask = this.getMaskForTrio(psal, pres, temp)
    tempVsPsalMask = this.getMaskForPair(psal, temp)

    out = {}
    out.presForTemp = pres.filter((item, idx) => presVsTempMask[idx])
    out.tempForPres = temp.filter((item, idx) => presVsTempMask[idx])
    out.cvaluesForTempVsPres = cvalues.filter((item, idx) => presVsTempMask[idx])
    out._idsForTempVsPres =  _ids.filter((item, idx) => presVsTempMask[idx])

    out.presForPsal = pres.filter((item, idx) => presVsPsalMask[idx])
    out.psalForPres = psal.filter((item, idx) => presVsPsalMask[idx])
    out.cvaluesForPsalVsPres = cvalues.filter((item, idx) => presVsPsalMask[idx])
    out._idsForPsalVsPres =  _ids.filter((item, idx) => presVsPsalMask[idx])

    out.psalForTemp = psal.filter((item, idx) => tempVsPsalMask[idx])
    out.tempForPsal = temp.filter((item, idx) => tempVsPsalMask[idx])
    out.cvaluesForTempVsPsal = cvalues.filter((item, idx) => tempVsPsalMask[idx])
    out._idsForTempVsPsal =  _ids.filter((item, idx) => tempVsPsalMask[idx])
    return (out)
}
}