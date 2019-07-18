var express = require('express');
var router = express.Router();
var path = require('path');

/* GET ng home page. */
router.get('/', function(req, res, next) {
  res.redirect('/ng/home')
});

router.get('/ng/*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../dist/', 'index.html'));
})

router.get('/ng/home', function(req, res, next) {
  const mpath = path.join(__dirname, '../../dist/', 'index.html')
  console.log(mpath)
  res.sendFile(mpath);
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



router.get('/grid', function(req,res) {
  res.render('gridPage', {
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
