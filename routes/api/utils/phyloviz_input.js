var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createPhyloviZInput = require('phyloviz_input');

router.get('/', function(req, res, next){
	
	if (req.query.name){

		var dataToGraph = {};
		var datasetName = req.query.name;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

	    getDataset(datasetName, userID, function(dataset){
	      createPhyloviZInput(dataset, function(graphInput){
	      	res.send(graphInput);
	      });
	    
	    });

	}
	else res.send(false);
		
});

function getDataset(datasetName, userID, callback) {

	var pg = require("pg");
	var connectionString = "postgres://localhost/phyloviz";

	var datasetID;

	query = "SELECT id FROM datasets.datasets WHERE name = '"+datasetName+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, [userID], function(err, result) {
		    if(err) {
		      return console.error('error running query', err);
		    }
		    datasetID = result.rows[0].id;

		    query = "SELECT data AS profiles, schemeGenes FROM datasets.profiles WHERE id="+datasetID+";" +
		    		"SELECT data AS isolates, metadata FROM datasets.isolates WHERE id="+datasetID+";" +
		    		"SELECT data AS links FROM datasets.links WHERE id="+datasetID+";" +
		    		"SELECT data AS newick FROM datasets.newick WHERE id="+datasetID+";" +
		    		"SELECT data AS positions FROM datasets.positions WHERE id="+datasetID+";" +
		    		"SELECT name, key FROM datasets.datasets WHERE id="+datasetID+";";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){

			    		if( x == 'profiles') dataset.profiles = result.rows[i][x]['profiles'];
			    		else if( x  == 'isolates') dataset.isolates = result.rows[i][x]['isolates'];
			    		else if( x  == 'links') dataset.links = result.rows[i][x]['links'];
			    		else if( x  == 'newick') dataset.newick = result.rows[i][x]['newick'];
			    		else if( x  == 'positions') dataset.positions = result.rows[i][x];
			    		else if( x  == 'name' || x == 'key' || x == 'schemegenes' || x == 'metadata') dataset[x] = result.rows[i][x];
			    	}
			    }
			    client.end();
			    callback([dataset]);
			});

		  });
		});
}

module.exports = router; 