var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createPhyloviZInput = require('phyloviz_input');

var config = require('../../../config.js');

router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

	    getDataset(datasetID, userID, function(dataset){
	      createPhyloviZInput(dataset, function(graphInput){
	      	res.send(graphInput);
	      });
	    
	    });

	}
	else res.send(false);
		
});

function getDataset(datasetID, userID, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/phyloviz";

	var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }

		    query = "SELECT data AS profiles, schemeGenes FROM datasets.profiles WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS isolates, metadata FROM datasets.isolates WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS links FROM datasets.links WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT distanceMatrix FROM datasets.links WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS newick FROM datasets.newick WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS positions FROM datasets.positions WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT name, key FROM datasets.datasets WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		//console.log(x);
			    		if( x == 'profiles') dataset.profiles = result.rows[i][x]['profiles'];
			    		else if( x  == 'isolates') dataset.isolates = result.rows[i][x]['isolates'];
			    		else if( x  == 'links') dataset.links = result.rows[i][x]['links'];
			    		else if( x  == 'distancematrix'){
			    			try{
			    				dataset.distanceMatrix = result.rows[i][x]['distanceMatrix'];
			    			}
			    			catch (TypeError){
			    				dataset.distanceMatrix = {};
			    			}
			    		} 
			    		else if( x  == 'newick') dataset.newick = result.rows[i][x]['newick'];
			    		else if( x  == 'positions') dataset.positions = result.rows[i][x];
			    		else if( x  == 'name' || x == 'key' || x == 'schemegenes' || x == 'metadata') dataset[x] = result.rows[i][x];
			    	}
			    }
			    //console.log(dataset.profiles.length);
			    client.end();
			    callback([dataset]);
			});

		});
}

module.exports = router; 