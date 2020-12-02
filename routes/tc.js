const express = require('express');
let router = express.Router();

// Require controller modules
const tc_traj_controller = require('../controllers/tcTrajController')

/* GET an ar shape. */
router.get('/', tc_traj_controller.find_one);

/* GET an ar shape. */
router.get('/findByDate', tc_traj_controller.find_by_date);

router.get('/findByDateRange', tc_traj_controller.find_by_date_range);

router.get('/stormNameList', tc_traj_controller.get_storm_names)

router.get('/findByNameYear', tc_traj_controller.find_by_name_year)

module.exports = router