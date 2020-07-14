const express = require('express');
let router = express.Router();

// Require controller modules
const grid_controller = require('../controllers/griddedProductController')

router.get('/grid/window', grid_controller.get_grid_window);

router.get('/grid/find', grid_controller.find_grid);

router.get('/gridMetadata', grid_controller.get_grid_metadata);

router.get('/gridParams/find', grid_controller.find_grid_param);
router.get('/gridParams/window', grid_controller.get_param_window)
router.get('/nonUniformGrid/window', grid_controller.get_non_uniform_grid_window);

module.exports = router;