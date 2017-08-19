var express = require('express');
var router = express.Router();

// Require controller modules
var platform_controller = require('../controllers/platformController')
var profile_controller = require('../controllers/profileController');
var dac_controller = require('../controllers/dacController');


/* GET catalog home page. */
router.get('/', platform_controller.index);

/* GET database summary page. */
router.get('/db', platform_controller.db_list);

/// platform ROUTES ///


/* GET individual platform (floats) data. */
router.get('/platforms/:platform_number', platform_controller.platform_detail)

/* GET request for list of all platform. */
router.get('/platforms', platform_controller.platform_list);

/// PROFILE ROUTES ///

/* GET request for one profile. */
router.get('/profiles/:_id', profile_controller.profile_detail);

/* GET request for list of all profile items. */
router.get('/profiles', profile_controller.profile_list);


/// DAC ROUTES ///

/* GET request for one dac. */
router.get('/dac/:id', dac_controller.dac_detail);

/* GET request for list of all dac items. */
router.get('/dacs', dac_controller.dac_list);

module.exports = router;