var express = require('express');
var router = express.Router();
var parseGoe = require('goeBURSTparser');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query.springLength);
  springLength = 50;
  if (req.query.springLength != undefined) springLength = req.query.springLength;
  if (req.query.precompute != undefined) res.render('main', { title: 'PHYLOViZ Online', precompute: req.query.precompute, datasetName: req.query.datasetName, springLength : springLength });
  else res.render('main', { title: 'PHYLOViZ Online', precompute: false, datasetName: req.query.datasetName, springLength : springLength });


});


module.exports = router;