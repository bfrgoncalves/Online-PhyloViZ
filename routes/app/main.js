var express = require('express');
var router = express.Router();
var parseGoe = require('goeBURSTparser');

/* GET home page. */
router.get('/', function(req, res, next) {

  if (req.query.precompute != undefined) res.render('main', { title: 'PHYLOViZ Online', precompute: req.query.precompute, datasetName: req.query.datasetName });
  else res.render('main', { title: 'PHYLOViZ Online', precompute: false, datasetName: req.query.datasetName });


});


module.exports = router;