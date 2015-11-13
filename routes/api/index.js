var express = require('express'); 
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('apiIndex', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

module.exports = router; 