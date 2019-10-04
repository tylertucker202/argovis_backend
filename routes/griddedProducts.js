var express = require('express');
var router = express.Router();

// Require controller modules
var grid_controller = require('../controllers/griddedProductController')

router.get('/:grid/window', grid_controller.get_window);

router.get('/:grid/find', grid_controller.find_one);

router.get('/gridParams/:measurement/:pres/:model/:trend/:param', grid_controller.find_grid_param);

module.exports = router;