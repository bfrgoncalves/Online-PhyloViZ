var express = require('express');
var router = express.Router();

var config = require('../../config.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/index');
});

module.exports = router;