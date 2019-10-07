var express = require('express');
var router = express.Router();

// Require controller modules
var grid_controller = require('../controllers/griddedProductController')

router.get('/grid/window', grid_controller.get_grid_window);

router.get('/grid/find', grid_controller.find_grid);

router.get('/gridParams/find', grid_controller.find_grid_param);
router.get('/gridParams/window', grid_controller.get_param_window)

module.exports = router;