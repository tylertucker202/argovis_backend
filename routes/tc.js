const express = require('express');
let router = express.Router();

// Require controller modules
const tc_traj_controller = require('../controllers/tcTrajController')

/* GET an ar shape. */
router.get('/', tc_traj_controller.findOne);

/* GET an ar shape. */
router.get('/findByDate', tc_traj_controller.findByDate);

router.get('/findByDateRange', tc_traj_controller.findByDateRange);

router.get('/findByName', tc_traj_controller.findByName)

module.exports = router