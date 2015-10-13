var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");
var goeBURST = require('goeBURST');


router.get('/', function(req, res, next){
	
	if (req.query.name){

		var datasetName = req.query.name;
		var datasetId;

		if (req.query.algorithm) var algorithmToUse = req.query.algorithm;
		else var algorithmToUse = 'prim';

		loadProfiles(datasetName, function(profileArray, identifiers, datasetID){
			datasetId = datasetID;
			
			goeBURST(profileArray, identifiers, algorithmToUse, function(links){
				if(req.query.save){
					saveLinks(datasetID, links, function(){
						res.send({datasetName: req.query.name, links: links});
					});
				}
				else res.send({datasetName: req.query.name, links: links});
			});
		});


	}
	else{
		res.send('goeBURST algorithm');
	}
	
});

function loadProfiles(datasetName, callback){

	var profiles;
	var identifiers = {};
	var countProfiles = 0;
	var profileArray = [];
	var datasetID;

	var pg = require("pg");
	var connectionString = "postgres://localhost/phyloviz";

	query = "SELECT id FROM datasets.datasets WHERE name = '"+datasetName+"';";

	//console.log(query);

	var client = new pg.Client(connectionString);
		
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, function(err, result) {
		    if(err) {
		      return console.error('error running query', err);
		    }
		    else{
		    	datasetID = result.rows[0].id;
		    	query = "SELECT data FROM datasets.profiles WHERE id = "+datasetID+";";
		    	
		    	client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

			    var profiles = result.rows[0].data.profiles;
				
				var existsProfile = {};

				//console.log(profiles);
				
				profiles.forEach(function(profile){
					var arr = Object.keys(profile).map(function(k) { return profile[k] });
					var identifier = arr.shift();
					//arr.reverse();
					
					if(existsProfile[String(arr)]) {
						console.log('Profile already exists');
						//console.log(identifier);
					}
					
					else{
						existsProfile[String(arr)] = true;
						identifiers[countProfiles] = identifier;
						countProfiles += 1; 
						profileArray.push(arr);

					}
				});
				console.log(countProfiles);
				client.end();
				callback(profileArray, identifiers, datasetID);

			  });
		    }
		  });
		});


}

function saveLinks(datasetID, links, callback){

	//var datasetModel = require('../../../models/datasets');

	var pg = require("pg");
	var connectionString = "postgres://localhost/phyloviz";
	var linksToUse = { links: links };

	var client = new pg.Client(connectionString);
		console.log(datasetID);

		query = "UPDATE datasets.links SET data = '"+JSON.stringify(linksToUse)+"' WHERE id ="+datasetID+";";
		
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, function(err, result) {
		    if(err) {
		      return console.error('error running query', err);
		    }
		    client.end();
			callback();
		  });
		});
}

module.exports = router; 