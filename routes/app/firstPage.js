var express = require('express');
var router = express.Router();

var config = require('../../config.js');

/* GET home page. */
router.get(config.root_path + '/', function(req, res, next) {
  res.redirect('/index');
});

/* GET home page. */
router.get(config.root_path + '/examples', function(req, res, next) {
  res.render('downloadPage', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

module.exports = router;