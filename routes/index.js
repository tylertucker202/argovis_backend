var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Profile = require('../models/profile'); 
var async = require('async');
var moment = require('moment')

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/map');
});

router.get('/map', function(req,res) {
        res.render('map_web_mercator', {
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

module.exports = router;
