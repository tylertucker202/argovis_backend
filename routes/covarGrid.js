var express = require('express');
var router = express.Router();

// Require controller modules
var covar_controller = require('../controllers/covarController')

/* Get request for month year query */


router.get('/:lat/:lon/:radius?', covar_controller.radius_selection);

module.exports = router;