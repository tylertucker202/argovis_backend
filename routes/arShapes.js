const express = require('express');
let router = express.Router();

// Require controller modules
const ar_shapes_controller = require('../controllers/arShapesController')

/* GET an ar shape. */
router.get('/', ar_shapes_controller.findOne);

/* GET an ar shape. */
router.get('/findByDate', ar_shapes_controller.findByDate);

module.exports = router