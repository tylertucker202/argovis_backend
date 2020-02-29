const express = require('express');
let router = express.Router();

// Require controller modules
const covar_controller = require('../controllers/covarController')

router.get('/:lat/:lon/:forcastDays', covar_controller.radius_selection);

module.exports = router;