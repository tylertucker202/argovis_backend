const express = require('express');
let router = express.Router();
const path = require('path');

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

router.get('/covarMap', function(req,res) {
  res.render('covarPage', {
      lat : 0,
      lng : 0
  });
});

module.exports = router;
