const express = require('express');
let router = express.Router();

// Require controller modules
const grid_controller = require('../controllers/griddedProductController')

router.get('/', grid_controller.get_window);

router.get('/find', grid_controller.find_one);

module.exports = router;