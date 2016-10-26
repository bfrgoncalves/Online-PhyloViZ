var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");
var goeBURST = require('goeBURST');

var config = require('../../../config.js');

var os = require('os');
var Queue = require('bull');
var queue = Queue("goeBURST queue", 6379, '127.0.0.1');
var cluster = require('cluster');

var pg = require("pg");
var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport')

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    auth: {
        user: config.email,
        pass: config.spe
    }
}));


function getEmail(userID, callback){

    query = "SELECT email FROM datasets.users WHERE user_id = '"+String(userID)+"';";

    var client = new pg.Client(connectionString);

    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query(query, function(err, result) {
            if(err) {
              return console.error('error running query', err);
            }
            callback(result.rows[0].email);
        });
    });
}


function sendMail(mailInfo, callback){

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.title + ' <phylovizonline@gmail.com>', // sender address
        to: mailInfo.email, // list of receivers
        subject: 'Phyloviz - New Dataset', // Subject line
        text: mailInfo.message, // plaintext body
        //html: '<b>Hello world ✔</b>' // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        callback(null, mailOptions);

    });
}



if(cluster.isWorker && cluster.worker.id != 1 && cluster.worker.id > (os.cpus().length/4)){
/*
	if(os.cpus().length >= 8){
		console.log('8 or more cores');
		for (var i = 0; i < 1; i++) {
		    cluster.fork();
		}
	}
	else{

		cluster.fork();
		console.log('less than 8 cores');
	}

  cluster.on('online', function(worker) {

  });
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

}else{
*/
	
	console.log('Process queue');

	queue.process(function(job, jobDone){

		console.log(job.jobId);

		var datasetId;
		var datasetID = job.data.datasetID;
		var userID = job.data.userID;
		var algorithmToUse = job.data.algorithmToUse;
		var analysis_method = job.data.analysis_method;
		var missings = job.data.missings;
		var save = job.data.save;
		var hasmissings = job.data.hasmissings;
		var mailObject = {};

		console.log('processing');
		
		if(datasetID != undefined){ 

			loadProfiles(datasetID, userID, function(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles){
				datasetId = datasetID;
				old_profiles = profiles;

				goeBURST(profileArray, identifiers, algorithmToUse, missings, analysis_method, function(links, distanceMatrix, profilegoeBURST, indexToRemove){
					if(save){
						saveLinks(datasetID, links, function(){
							if(hasmissings == 'true'){
								save_profiles(profilegoeBURST, old_profiles, datasetID, indexToRemove, function(){
									console.log('getting mail');
									getEmail(userID, function(email){
										mailObject.email = email;
										mailObject.message = 'Your data set is now available at: ' + config.final_root + '/main/dataset/' + datasetID;
										console.log('have mail');
										sendMail(mailObject, function(){
											console.log('Mail sent');
										});
									});
									jobDone();
								});
							}
							else {
								console.log('getting mail');
								getEmail(userID, function(email){
									mailObject.email = email;
									mailObject.message = 'Your data set is now available at: ' + config.final_root + '/main/dataset/' + datasetID;
									console.log('have mail');
									sendMail(mailObject, function(){
										console.log('Mail sent');
									});
								});
								jobDone();
							}
						});
					}
					else{
						jobDone();
					}
					//else res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
					//jobDone();
				});
				
			});
		}
		jobDone();

	});

}
  

router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		console.log(req.user);

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

		if(req.query.onqueue == 'true'){
			var parameters = {datasetID:datasetID, userID:userID, algorithmToUse:algorithmToUse, analysis_method:analysis_method, missings:missings, save:req.query.save, hasmissings:req.query.missings};
			queue.add(parameters).then(function(job){
				res.send({queue: 'Your data set is being processed. You will be redirected to a new page and receive an email when the job is finished.', jobid: job.jobId});
			});
		}
		else{	
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


	}
	else{
		res.send({message: 'select a data set ID'});
	}
	
});

router.get('/status', function(req,res,next){
	if(req.isAuthenticated()){
		if(req.query.jobid){
			queue.getJob(req.query.jobid).then(function(job){
				if(job.isCompleted()){
					res.send({status: 'complete'});
				}
				else res.send({status: 'running'});
			});
		}
	}
	else res.send({status:401});

});


router.post('/save', function(req, res, next){
	
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