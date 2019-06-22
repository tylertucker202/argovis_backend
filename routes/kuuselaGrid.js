var express = require('express');
var router = express.Router();

// Require controller modules
var grid_controller = require('../controllers/kuuselaGridController.js')

router.get('/', grid_controller.get_window);

router.get('/find', grid_controller.find_one);

module.exports = router;