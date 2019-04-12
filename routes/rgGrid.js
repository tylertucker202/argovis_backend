var express = require('express');
var router = express.Router();

// Require controller modules
var grid_controller = require('../controllers/rgGridController')

router.get('/', grid_controller.get_window);

module.exports = router;