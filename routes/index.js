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
        res.render('map', {
            lat : 30,
            lng : -35
        });
});

module.exports = router;
