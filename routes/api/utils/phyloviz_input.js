var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createPhyloviZInput = require('phyloviz_input');

router.get('/', function(req, res, next){
	
	if (req.query.name){

		var dataToGraph = {};
		var datasetName = req.query.name;

	    getDataset(datasetName, function(dataset){
	      createPhyloviZInput(dataset, function(graphInput){
	      	res.send(graphInput);
	      });
	    });

	}
	else res.send(false);
		
});

function getDataset(datasetName, callback) {

	var datasetModel = require('../../../models/datasets');
	datasetModel.find({name: datasetName}, function(err, docs){
		callback(docs);
	});
}

module.exports = router; 