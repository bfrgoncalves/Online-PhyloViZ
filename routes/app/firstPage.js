var express = require('express');
var router = express.Router();

var config = require('../../config.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/index');
});

/* GET home page. */
router.get('/examples', function(req, res, next) {
  res.render('downloadPage', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

module.exports = router;