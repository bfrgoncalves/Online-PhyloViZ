var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");
var goeBURST = require('goeBURST');

var config = require('../../../config.js');


router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var datasetId;

		if (req.query.algorithm) var algorithmToUse = req.query.algorithm;
		else var algorithmToUse = 'prim';

		loadProfiles(datasetID, userID, function(profileArray, identifiers, datasetID){
			datasetId = datasetID;
			
			goeBURST(profileArray, identifiers, algorithmToUse, function(links, distanceMatrix){
				if(req.query.save){
					saveLinks(datasetID, links, distanceMatrix, function(){
						res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix});
					});
				}
				else res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix});
			});
		});


	}
	else{
		res.send('goeBURST algorithm');
	}
	
});

function loadProfiles(datasetID, userID, callback){

	var profiles;
	var identifiers = {};
	var countProfiles = 0;
	var profileArray = [];
	var datasetID;

	var pg = require("pg");
	var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id= '"+userID+"';";

	//console.log(query);

	var client = new pg.Client(connectionString);
		
	client.connect(function(err) {
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }
	  //client.query(query, function(err, result) {
	    //if(err) {
	    //  return console.error('error running query', err);
	    //}
	    //else{
	    	//datasetID = result.rows[0].id;

		query = "SELECT data FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';" +
				"SELECT schemeGenes FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';";
		
		client.query(query, function(err, result) {
	    if(err) {
	      return console.error('error running query', err);
	    }

	    var profiles = result.rows[0].data.profiles;
	    var schemeGenes = result.rows[1].schemegenes;
		
		var existsProfile = {};
		
		profiles.forEach(function(profile){
			var arr = [];
			for (i in schemeGenes) arr.push(profile[schemeGenes[i]]);
			//var arr = Object.keys(profile).map(function(k) { return profile[k] });
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
		client.end();
		callback(profileArray, identifiers, datasetID);

	  });
	    //}
	  //});
	});


}

function saveLinks(datasetID, links, distanceMatrix, callback){

	//var datasetModel = require('../../../models/datasets');

	var pg = require("pg");
	var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
	var linksToUse = { links: links };
	var distanceMatrixToUse =  { distanceMatrix: distanceMatrix };

	var client = new pg.Client(connectionString);

		query = "UPDATE datasets.links SET data = '"+JSON.stringify(linksToUse)+"' WHERE dataset_id ='"+datasetID+"';" + 
				"UPDATE datasets.links SET distanceMatrix = '"+JSON.stringify(distanceMatrixToUse)+"' WHERE dataset_id ='"+datasetID+"';";
		
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