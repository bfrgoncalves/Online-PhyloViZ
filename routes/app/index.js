var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.isAuthenticated());
  if(req.query.input) res.render('indexApp', { 
  	  title: 'PHYLOViZ Online',
      isAuthenticated: req.isAuthenticated(), //function given by passport
      user: req.user //also given by passport. an user object
   });
  else res.render('indexAppWithoutInput', { 
  	  title: 'PHYLOViZ Online',
      isAuthenticated: req.isAuthenticated(), //function given by passport
      user: req.user //also given by passport. an user object
   });
});

module.exports = router;
