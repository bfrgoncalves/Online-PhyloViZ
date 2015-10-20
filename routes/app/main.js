var express = require('express');
var router = express.Router();
var parseGoe = require('goeBURSTparser');
var crypto = require('crypto');

var config = require('../../config.js');

/* GET home page. */
router.get('/dataset/:datasetID', function(req, res, next) {
  springLength = 50;
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
router.get('/dataset/public/:cipheredDataset', function(req, res, next) {

  //console.log(req.params.cipheredDataset);
  var decipher = crypto.createDecipher(config.cipherUser.algorithm, config.cipherUser.pass);
  datasetID= decipher.update(req.params.cipheredDataset,'hex','utf8');
  //parts = deciphered.split('/');
  //datasetID = parts[0];
  springLength = 50;

  if (req.query.springLength != undefined) springLength = req.query.springLength;
  if (req.query.precompute != undefined) res.render('main', { 
    title: 'PHYLOViZ Online', 
    precompute: req.query.precompute, 
    datasetID: datasetID, 
    springLength : springLength,
    isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user //also given by passport. an user object
  });
  else res.render('main', { 
    title: 'PHYLOViZ Online', 
    precompute: false, 
    datasetID: datasetID, 
    springLength : springLength,
    isAuthenticated: req.isAuthenticated(), //function given by passport
    user: req.user //also given by passport. an user object
  });


});


module.exports = router;