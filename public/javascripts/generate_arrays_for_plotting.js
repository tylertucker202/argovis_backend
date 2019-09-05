module.exports = {


collateProfileMeasurements: function(profile) {
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
},

getMaskForPair: function(arrayOne, arrayTwo) {
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
},

//Used to for pres vs psal. if temp reporting nan, psal should be zero too.
getMaskForTrio: function(arrayOne, arrayTwo, arrayThree) {
    let mask = [];
    const element = -999; 
    for(let idx=0; idx < arrayOne.length; idx++){
        if (arrayOne[idx] === element || arrayTwo[idx] === element || arrayThree[idx] === element){
            mask.push(false);
        }
        else {
            mask.push(true)
        }
    }
    return(mask);
},

reduceGPSMeasurements: function(profile, maxLength) {
    if (profile.POSITIONING_SYSTEM === 'GPS' || profile.POSITIONING_SYSTEM === 'IRIDIUM') {
        //console.log(profile.measurements.length);
        let mLen = profile.measurements.length;
        if (mLen > maxLength) {
            //reduce array length to so that only every delta element is plotted
            var delta = Math.floor( mLen / maxLength );
            var reducedMeasurements = [];
            for (var j = 0; j < mLen; j=j+delta) {
                reducedMeasurements.push(profile.measurements[j])
            }
            return reducedMeasurements
        }
        else {
            return profile.measurements;
        }
    }
    else {
        return profile.measurements;
    }
},

makeSelectionProfileArrays: function(profiles) {
    var traces = [];
    var temp = [];
    var pres = [];
    var psal = [];
    var _ids = [];
    var cvalues = [];

    for(var i=0; i<profiles.length; i++) {
        let profile = profiles[i];
        console.log('on profile with length')
        console.log(i)
        console.log(profile.measurements.length);
        var profileMeas = this.reduceGPSMeasurements(profile, 200);
        profileMeas = this.collateProfileMeasurements(profileMeas); // collect points into arrays
        var _id = profiles[i]._id
        var color_array = Array.apply(null, Array(profileMeas.pres.length)).map(Number.prototype.valueOf, i);
        var id_array = Array.apply(null, Array(profileMeas.pres.length)).map(String.prototype.valueOf,_id)
        temp = temp.concat(profileMeas.temp);
        pres = pres.concat(profileMeas.pres);
        psal = psal.concat(profileMeas.psal);
        cvalues = cvalues.concat(color_array);
        _ids = _ids.concat(id_array);
    return ({'temp': temp, 'pres': pres, 'psal': psal, 'cvalues': cvalues, '_ids': _ids})
    };
},

makePlatformProfileArrays: function(profiles) {
    let psal = [];
    let pres = [];
    let temp = [];
    let cycle = [];
    for(var i=0; i < profiles.length; i++) {
        var profileMeas = reduceGPSMeasurements(profiles[i], 200);
        profileMeas = this.collateProfileMeasurements(profileMeas);
        psal = psal.concat(profileMeas.psal);
        pres = pres.concat(profileMeas.pres);
        temp = temp.concat(profileMeas.temp);

        let meas_idx = [];
        for (var j=0; j<profileMeas.pres.length; j++) {
            meas_idx.push(profiles[i].cycle_number); //just an array of cycle number
        }
        cycle = cycle.concat(meas_idx);
        return ({'temp': temp, 'pres': pres, 'psal': psal, 'cycle': cycle})
    };
},

filterProfiles: function(temp, pres, psal, cycle) {
    out = {}
    presVsTempMask = this.getMaskForPair(temp, pres);
    presVsPsalMask = this.getMaskForTrio(psal, pres, temp);

    out.presForTemp = pres.filter((item, i) => presVsTempMask[i]);
    out.tempForPres = temp.filter((item, i) => presVsTempMask[i]);
    out.cycleForTemp = cycle.filter((item, i) => presVsTempMask[i]);

    out.presForPsal = pres.filter((item, i) => presVsPsalMask[i]);
    out.psalForPres = psal.filter((item, i) => presVsPsalMask[i]);
    out.cycleForPsal = cycle.filter((item, i) => presVsPsalMask[i]);
    return(out)
},

filterSelection: function(temp, pres, psal, cvalues, _ids) {
       //filter using Tyler's algorithm
    presVsTempMask = this.getMaskForPair(temp, pres);
    presVsPsalMask = this.getMaskForTrio(psal, pres, temp);
    tempVsPsalMask = this.getMaskForPair(psal, temp);

    out = {}
    out.presForTemp = pres.filter((item, i) => presVsTempMask[i]);
    out.tempForPres = temp.filter((item, i) => presVsTempMask[i]);
    out.cvaluesForTempVsPres = cvalues.filter((item, i) => presVsTempMask[i]);
    out._idsForTempVsPres =  _ids.filter((item, i) => presVsTempMask[i]);

    out.presForPsal = pres.filter((item, i) => presVsPsalMask[i]);
    out.psalForPres = psal.filter((item, i) => presVsPsalMask[i]);
    out.cvaluesForPsalVsPres = cvalues.filter((item, i) => presVsPsalMask[i]);
    out._idsForPsalVsPres =  _ids.filter((item, i) => presVsPsalMask[i]);

    out.psalForTemp = psal.filter((item, i) => tempVsPsalMask[i]);
    out.tempForPsal = temp.filter((item, i) => tempVsPsalMask[i]);
    out.cvaluesForTempVsPsal = cvalues.filter((item, i) => tempVsPsalMask[i]);
    out._idsForTempVsPsal =  _ids.filter((item, i) => tempVsPsalMask[i]);
    return (out)
}
}