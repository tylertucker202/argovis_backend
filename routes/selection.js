var express = require('express');
var router = express.Router();

// Require controller modules
var platform_controller = require('../controllers/platformController')
var profile_controller = require('../controllers/profileController');
var dac_controller = require('../controllers/dacController');

/* GET selection home page. */
router.get('/', platform_controller.index);

/* Get request for list of last profiles. */
router.get('/lastProfiles', profile_controller.last_profile_list);

/* Get request for list of latest profiles. */
router.get('/latestProfiles', profile_controller.latest_profile_list);

router.get('/profiles', profile_controller.selected_profile_list);

module.exports = router;