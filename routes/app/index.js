var express = require('express');
var router = express.Router();

var config = require('../../config.js');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('indexApp', { 
  	  title: 'PHYLOViZ Online',
      isAuthenticated: req.isAuthenticated(), //function given by passport
      user: req.user, //also given by passport. an user object
      root_path: config.root_path
  });

});
/* GET input information. */
router.get('/inputinfo', function(req, res, next) {
  res.render('inputInformation', { 
  	  title: 'PHYLOViZ Online',
      isAuthenticated: req.isAuthenticated(), //function given by passport
      user: req.user //also given by passport. an user object
  });

});

/* GET input information. */
router.get('/tutorial', function(req, res, next) {
  res.render('tutorial/tutorial', { 
      title: 'PHYLOViZ Online',
      isAuthenticated: req.isAuthenticated(), //function given by passport
      user: req.user //also given by passport. an user object
  });

});

module.exports = router;
