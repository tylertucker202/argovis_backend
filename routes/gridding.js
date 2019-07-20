var express = require('express');
var router = express.Router();

// Require controller modules
var gridding_controller = require('../controllers/griddedProfileController')

/* Get request for month year query */

router.get('/', function(req, res) {
    res.redirect('/map');
  });

router.get('/presSlice/:format?', gridding_controller.pres_layer_selection);

router.get('/metaDate/:startDate/:endDate', gridding_controller.meta_date_selection);

module.exports = router;