var express = require('express'); 
var router = express.Router();
var createTable_data = require('phyloviz_TableData');

var config = require('../../../config.js');

router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		if(req.query.analysis_method !=null) analysis_method = req.query.analysis_method;
		else analysis_method = 'core';

		if(req.query.delimiter !=null) delimiter = req.query.delimiter;
		else delimiter = null;

		if (req.query.parameter != null){
			var parameter = req.query.parameter;
			checkIfpublic(datasetID, userID, function(isPublic){

				getDataset(datasetID, userID, isPublic, parameter, function(dataset){
			      createTable_data({dataset: dataset[0].data, parameter: parameter, headers: dataset[1].headers, analysis_method:analysis_method, delimiter:delimiter}, function(table_data){
			      	res.send({status: 'OK', data: table_data.data, headers: table_data.headers});
			      });
			    });

			});
		} 
		else res.send({status: 'parameter missing'});

	}
	else res.send({status: 'parameter missing'});
		
});


function checkIfpublic(datasetID, userID, callback){

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	var isPublic = false;

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }

		    query = "SELECT name FROM datasets.datasets WHERE dataset_id='"+datasetID+"' AND put_public='t' LIMIT 1;";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

				if (result.rows.length > 0){
					isPublic = true;
				}

			    client.end();
			    callback(isPublic);
			});

		});


}

function getDataset(datasetID, userID, isPublic, parameter, callback) {

	var pg = require("pg");
  	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

  	var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
        if(isPublic == true){
        	query = "SELECT data FROM datasets."+parameter+" WHERE dataset_id='"+datasetID+"' LIMIT 1;";
	        if (parameter == 'isolates') query += " SELECT metadata AS headers FROM datasets.isolates WHERE dataset_id='"+datasetID+"' LIMIT 1;";
	        else if (parameter == 'profiles') query +=  " SELECT schemeGenes AS headers FROM datasets.profiles WHERE dataset_id='"+datasetID+"' LIMIT 1;";
        }
        else{
        	query = "SELECT data FROM datasets."+parameter+" WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";
	        if (parameter == 'isolates') query += " SELECT metadata AS headers FROM datasets.isolates WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";
	        else if (parameter == 'profiles') query +=  " SELECT schemeGenes AS headers FROM datasets.profiles WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";
        }
       
       
        client.query(query, function(err, result) {
	        if(err) {
	          return console.error('error running query', err);
	        }
	        client.end();
	        callback(result.rows);
	    });
    });
}

module.exports = router; 