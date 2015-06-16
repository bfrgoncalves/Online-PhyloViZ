var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");
var goeBURST = require('goeBURST');


router.get('/', function(req, res, next){
	
	if (req.query.name){

		var datasetName = req.query.name;

		loadProfiles(datasetName, function(profileArray, identifiers){
			goeBURST(profileArray, identifiers, function(links){
				if(req.query.save){
					saveLinks(datasetName, links);
					res.send({datasetName: req.query.name, links: links});
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
	var datasetModel = require('../../../models/datasets');

	datasetModel.find({name: datasetName}, function(err, docs){
		
		var profiles = docs[0].profiles;
		var existsProfile = {};
		
		profiles.forEach(function(profile){
			var arr = Object.keys(profile).map(function(k) { return profile[k] });
			var identifier = arr.pop();
			arr.reverse();
			
			if(existsProfile[String(arr)]) console.log('Profile already exists');
			
			else{
				existsProfile[String(arr)] = true;
				identifiers[countProfiles] = identifier;
				countProfiles += 1; 
				profileArray.push(arr);

			}
		});

		callback(profileArray, identifiers);
	
	});

}

function saveLinks(datasetName, links){

	var datasetModel = require('../../../models/datasets');

	datasetModel.find({name: datasetName}, function(err, docs){
		docs[0].links = links;
		docs[0].save();
	})
}

module.exports = router; 