var express = require('express');
var router = express.Router();

// Require controller modules
var profile_controller = require('../controllers/profileController');
var meta_controller = require('../controllers/metaDataController');

/* GET selection home page. */
router.get('/', profile_controller.profile_list);

/* Get request for list of last profiles. */
router.get('/lastProfiles/:format?', meta_controller.last_profile_list);

/* Get request for list of latest profiles. */
router.get('/latestProfiles/:format?', meta_controller.latest_profile_list);

router.get('/profiles/:format?', profile_controller.selected_profile_list);

/* Get request for month year query */
router.get('/profiles/:month/:year/:format?', meta_controller.month_year_profile_list);

module.exports = router;