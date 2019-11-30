var express = require('express');
var router = express.Router();
<<<<<<< HEAD
var path = require('path');

/* GET ng home page. */
router.get('/', function(req, res, next) {
  res.redirect('/ng/home')
=======
var mongoose = require('mongoose');
var Profile = require('../models/profile'); 
var async = require('async');
var moment = require('moment')

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/map');
>>>>>>> 2e2c33800c8bb896fc1378632764f41bd548f047
});

router.get('/ng/*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../dist/', 'index.html'));
})

router.get('/ng/home', function(req, res, next) {
  const mpath = path.join(__dirname, '../../dist/', 'index.html')
  console.log(mpath)
  res.sendFile(mpath);
});

router.get('/covarMap', function(req,res) {
  res.render('covarPage', {
      lat : 0,
      lng : 0
  });
});

module.exports = router;
