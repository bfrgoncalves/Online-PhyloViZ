var express = require('express'); 
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('apiIndex', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

router.get('/help/login', function(req, res, next){
	res.render('apiHelpUpload', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

router.get('/help/upload', function(req, res, next){
	res.render('apiHelpUpload', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

router.get('/help/finddata', function(req, res, next){
	res.render('apiHelpfinddata', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

router.get('/help/phylovizinput', function(req, res, next){
	res.render('apiHelpInput', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

router.get('/help/goeBURST', function(req, res, next){
	res.render('apiHelpgoeBURST', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

router.get('/help/tabledata', function(req, res, next){
	res.render('apiHelptable', {
		title: 'PHYLOViZ Online',
      	isAuthenticated: req.isAuthenticated(), //function given by passport
      	user: req.user //also given by passport. an user object
	});
});

module.exports = router; 