var express = require('express');
var router = express.Router();

var config = require('../../config.js');

var https_redirect = function(req, res, next) {
  if (!req.secure) {
      return res.redirect(config.currentRoot.substring(0, config.currentRoot.length - 1) + req.url);
  } else {
    return next();
  }
};

//redirect if not secure
router.get('*', function(req, res, next) {
  https_redirect(req, res, next);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/index');
});

module.exports = router;