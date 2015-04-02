var express = require('express');
var router = express.Router();
var parseGoe = require('goeBURSTparser');

/* GET home page. */
router.get('/', function(req, res, next) {

  if (req.query['data'] == 'saureus'){
    	parseGoe('data/staureusST.txt','data/staureusLinks.txt', 'data/sampleADfile.txt', 'ST');
   }
   else if (req.query['data'] == 'spneumo'){
    	parseGoe('data/spneumoST.txt','data/spneumoLinks.txt', 'data/sampleADfile.txt', 'ST');
   }
   else if (req.query['data'] == 'pyogenes'){
    	parseGoe('data/pyogenesST.txt','data/pyogenesLinks.txt', 'data/sampleADfile.txt', 'ST');
   }
   else if (req.query['data'] == 'sample'){
    	parseGoe('data/sampleAPfile.txt','data/links.txt', 'data/sampleADfile.txt', 'ST');
   }
   else{
   		parseGoe('data/sampleAPfile.txt','data/links.txt', 'data/sampleADfile.txt', 'ST');
   }

  setTimeout(function(){
  	res.render('indexWebGl', { title: 'PhyloViZ WebGl' });

  },150);

});

module.exports = router;