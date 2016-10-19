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
		var missings = [false, ''];
		var analysis_method = 'core';

		if (req.query.missings == 'true'){
			missings = [true, req.query.missingchar];
		}

		if (req.query.analysis_method){
			analysis_method = req.query.analysis_method;
		}

		if (req.query.algorithm) var algorithmToUse = req.query.algorithm;
		else var algorithmToUse = 'prim';

		loadProfiles(datasetID, userID, function(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles){
			datasetId = datasetID;
			old_profiles = profiles;
			goeBURST(profileArray, identifiers, algorithmToUse, missings, analysis_method, function(links, distanceMatrix, profilegoeBURST, indexToRemove){
				if(req.query.save){
					saveLinks(datasetID, links, function(){
						if(req.query.missings == 'true'){
							save_profiles(profilegoeBURST, old_profiles, datasetID, indexToRemove, function(){
								res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
							});
						}
						else res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
					});
				}
				else res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
			});
		});


	}
	else{
		res.send('goeBURST algorithm');
	}
	
});


router.post('/save', function(req, res, next){
	console.log(req.body);
	
	if (req.body.dataset_id){

		var datasetID = req.body.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		saveLinks(datasetID, req.body.links, function(){
			res.send({datasetID: req.body.dataset_id, status: true});
		});
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

	var client = new pg.Client(connectionString);
		
	client.connect(function(err) {
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }

		query = "SELECT data_type FROM datasets.datasets WHERE dataset_id = '"+datasetID+"';" +
				"SELECT data FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';" +
				"SELECT schemeGenes FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';";
		
		client.query(query, function(err, result) {
	    if(err) {
	      return console.error('error running query', err);
	    }

	    var data_type = result.rows[0].data_type;
	    var profiles = result.rows[1].data.profiles;
	    var schemeGenes = result.rows[2].schemegenes;

		
		var existsProfile = {};
		var dupProfiles = [];
		var dupIDs = [];
		var existsIdentifiers = {}

		profiles.forEach(function(profile){

			if(data_type == 'fasta') var profile = profile.profile;
			
			var arr = schemeGenes.map(function(d){ return profile[d]; });
			//for (i in schemeGenes) arr.push(profile[schemeGenes[i]]);
			//var arr = Object.keys(profile).map(function(k) { return profile[k] });
			var identifier = arr.shift();
			//arr.reverse();
			
			if(existsProfile[String(arr)]) {
				dupProfiles.push([identifier, String(arr)]);
				//console.log('Profile already exists');
				//console.log(identifier);
			}
			else if(existsIdentifiers[identifier]){
				dupIDs.push(identifier);
				//console.log('Duplicate ID');
			}
			else{
				existsProfile[String(arr)] = true;
				identifiers[countProfiles] = identifier;
				existsIdentifiers[identifier] = true;
				countProfiles += 1; 
				profileArray.push(arr);

			}
		});
		client.end();
		callback(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles);


	  });
	    //}
	  //});
	});


}

function saveLinks(datasetID, links, callback){

	//var datasetModel = require('../../../models/datasets');

	var pg = require("pg");
	var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
	var linksToUse = { links: links };
	//var distanceMatrixToUse =  { distanceMatrix: distanceMatrix };
	//distanceMatrixToUse = {distanceMatrix: []};

	var client = new pg.Client(connectionString);

		query = "UPDATE datasets.links SET data = '"+JSON.stringify(linksToUse)+"' WHERE dataset_id ='"+datasetID+"';";
				//"UPDATE datasets.links SET distanceMatrix = '"+JSON.stringify(distanceMatrixToUse)+"' WHERE dataset_id ='"+datasetID+"';";
		
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

function save_profiles(profilegoeBURST, profiles, datasetID, indexesToRemove, callback){
	
	var countProfiles = 0;
	var newProfiles = [];

	var pg = require("pg");
	var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;

	if(profilegoeBURST[0].length != Object.keys(profiles[0]).length) var profilesToUse = { profiles: profiles, indexestoremove: indexesToRemove, profilesize: profilegoeBURST[0].length };
	else var profilesToUse = { profiles: profiles };
	//var distanceMatrixToUse =  { distanceMatrix: distanceMatrix };
	//distanceMatrixToUse = {distanceMatrix: []};

	var client = new pg.Client(connectionString);

		query = "UPDATE datasets.profiles SET data = '"+JSON.stringify(profilesToUse)+"' WHERE dataset_id ='"+datasetID+"';";
				//"UPDATE datasets.links SET distanceMatrix = '"+JSON.stringify(distanceMatrixToUse)+"' WHERE dataset_id ='"+datasetID+"';";
		
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