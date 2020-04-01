var express = require('express');
var router = express.Router();

// Require controller modules
const platform_controller = require('../controllers/platformController')
const profile_controller = require('../controllers/profileController');
const dac_controller = require('../controllers/dacController');
const bgc_profile_controller = require('../controllers/bgcProfileController')


/* GET catalog home page. */
router.get('/', platform_controller.index);

/// platform ROUTES ///
/* GET individual platform (floats) data. */
router.get('/platforms/:platform_number/:format?', platform_controller.platform_detail);

router.get('/platform_metadata/:platform_number/:format?', platform_controller.platform_metadata);

router.get('/bgc_platform_list/', bgc_profile_controller.bgc_platform_list)

router.get('/bgc_platform_data/:platform_number/:format?', bgc_profile_controller.bgc_platform_data)

router.get('/platform_profile_metadata/:platform_number/:format?', platform_controller.platform_profile_metadata)

/* GET request for list of all platform. */
router.get('/platforms', platform_controller.platform_list);

/// PROFILE ROUTES ///
/* GET request for one profile. */
router.get('/profiles/:_id/:format?', profile_controller.profile_detail);

/* GET request for list of profile items in a list. */
router.get('/mprofiles/:format?', profile_controller.profile_list);

/// DAC ROUTES ///
/* GET request for one dac. */
router.get('/dacs/:dac', dac_controller.dac_detail);

/* GET request for list of all dac items. */
router.get('/dacs', dac_controller.dac_list);

module.exports = router;