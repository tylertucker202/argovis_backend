var express = require('express');
var router = express.Router();

// Require controller modules
const profile_controller = require('../controllers/profileController');
const bgc_profile_controller = require('../controllers/bgcProfileController')
const meta_controller = require('../controllers/metaDataController');

/* GET selection home page. */
router.get('/', profile_controller.profile_list);

router.get('/globalMapProfiles/:startDate/:endDate', meta_controller.global_map_profiles);

/* Get request for list of latest profiles. */
router.get('/lastThreeDays/:startDate?', meta_controller.last_three_days);

router.get('/profiles/:format?', profile_controller.selected_profile_list);

router.get('/box/profiles/:format?', profile_controller.select_profile_2d);

router.get('/bgc_data_selection/:format?', bgc_profile_controller.bgc_data_selection);

/* Get request for month year query */
router.get('/profiles/:month/:year/:format?', meta_controller.month_year_profile_list);

/* Get request for database overview */
router.get('/overview', meta_controller.db_overview);
module.exports = router;