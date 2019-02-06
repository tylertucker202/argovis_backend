var express = require('express');
var router = express.Router();

/* GET ng home page. */
router.get('/', function(req, res, next) {
  res.render('dist/index');
});


router.get('/map', function(req,res) {
        res.render('map_web_mercator', {
            lat : 0,
            lng : 0
        });
});

router.get('/covarMap', function(req,res) {
  res.render('covarPage', {
      lat : 0,
      lng : 0
  });
});

router.get('/mapNPS', function(req,res) {
  res.render('map_north_polar_stereo', {
      lat : 89,
      lng : 0.1
  });
});

router.get('/mapSPS', function(req,res) {
  res.render('map_south_polar_stereo', {
      lat : -89,
      lng : -0.1
  });
});

router.get('/mapEQUIREC', function(req,res) {
  res.render('map_equireq_proj', {
      lat : 0,
      lng : 0
  });
});

module.exports = router;
