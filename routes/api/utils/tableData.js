var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createTable_data = require('phyloviz_TableData');

router.get('/', function(req, res, next){
	
	if (req.query.name){

		var dataToGraph = {};
		var datasetName = req.query.name;

		if (req.query.parameter != null){
			var parameter = req.query.parameter;
			getDataset(datasetName, function(dataset){
		      createTable_data({dataset: dataset, parameter: parameter}, function(table_data){
		      	res.send({status: 'OK', data: table_data.data, headers: table_data.headers});
		      });
		    });
		} 
		else res.send({status: 'parameter missing'});

	}
	else res.send({status: 'parameter missing'});
		
});

function getDataset(datasetName, callback) {

	var datasetModel = require('../../../models/datasets');
	datasetModel.find({name: datasetName}, function(err, docs){
		callback(docs);
	});
}

module.exports = router; 