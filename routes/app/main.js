var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/dataset/:datasetID', function(req, res, next) {

  //if(!req.isAuthenticated()) return res.redirect("/");

  springLength = 1;
  if (req.query.springLength != undefined) springLength = req.query.springLength;
  if (req.query.precompute != undefined) res.render('main', { 
  	title: 'PHYLOViZ Online', 
  	precompute: req.query.precompute, 
  	datasetID: req.params.datasetID, 
  	springLength : springLength,
  	isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user //also given by passport. an user object
  });
  else res.render('main', { 
  	title: 'PHYLOViZ Online', 
  	precompute: false, 
  	datasetID: req.params.datasetID, 
  	springLength : springLength,
  	isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user //also given by passport. an user object
  });


});

/* GET home page. */
router.get('/dataset/public/:datasetID', function(req, res, next) {

  springLength = 1;

  if (req.query.springLength != undefined) springLength = req.query.springLength;
  if (req.query.precompute != undefined) res.render('main', { 
    title: 'PHYLOViZ Online', 
    precompute: req.query.precompute, 
    datasetID: req.params.datasetID, 
    springLength : springLength,
    isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user, //also given by passport. an user object
    isPublic : true
  });
  else res.render('main', { 
    title: 'PHYLOViZ Online', 
    precompute: false, 
    datasetID: req.params.datasetID, 
    springLength : springLength,
    isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user, //also given by passport. an user object
    isPublic: true
  });


});

/* GET home page. */
router.get('/dataset/share/:cipheredDataset', function(req, res, next) {

  springLength = 1;

  if (req.query.springLength != undefined) springLength = req.query.springLength;
  if (req.query.precompute != undefined) res.render('main', { 
    title: 'PHYLOViZ Online', 
    precompute: req.query.precompute, 
    datasetID: req.params.cipheredDataset, 
    springLength : springLength,
    isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user, //also given by passport. an user object
    isPublic : true
  });
  else res.render('main', { 
    title: 'PHYLOViZ Online', 
    precompute: false, 
    datasetID: req.params.cipheredDataset, 
    springLength : springLength,
    isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user, //also given by passport. an user object
    isPublic: true
  });


});


module.exports = router;