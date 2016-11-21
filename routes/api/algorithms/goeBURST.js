var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");
var goeBURST = require('goeBURST');

var config = require('../../../config.js');

var os = require('os');
//var Queue = require('bull');
//var queue = Queue("goeBURST queue", 6379, '127.0.0.1');

var kue = require('kue')
var queue = kue.createQueue();

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

var createPhyloviZInput = require('phyloviz_input');
var phyloviz_input_utils = require('phyloviz_input_utils')(config);


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

function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
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
//if(cluster.isWorker){
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

	queue.on('stalled', function(job){
	  console.log('stalled job, restarting it again!', job.jobId);
	});

	queue.process('goeBURST', function(job, jobDone){

		console.log(job.jobId);
		console.log('WORKER:', cluster.worker.id);

		var start = clock(); //Timer

		var datasetId;
		var datasetID = job.data.datasetID;
		var userID = job.data.userID;
		var algorithmToUse = job.data.algorithmToUse;
		var analysis_method = job.data.analysis_method;
		var missings = job.data.missings;
		var save = job.data.save;
		var hasmissings = job.data.hasmissings;
		var send_email = job.data.sendEmail;
		var missing_threshold = job.data.missing_threshold;
		var parent_id = job.data.parent_id;
		var mailObject = {};

		console.log('processing');
		
		if(datasetID != undefined){ 

			process.nextTick(function(){
				loadProfiles(datasetID, userID, function(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles, entries_ids){
					datasetId = datasetID;
					old_profiles = profiles;
					process.nextTick(function(){
						goeBURST(profileArray, identifiers, algorithmToUse, missings, analysis_method, missing_threshold, function(links, distanceMatrix, profilegoeBURST, indexToRemove){
							if(save){
								saveLinks(datasetID, links, missings, function(){
									//if(hasmissings == 'true'){
										goeburstTimer = clock(start);
										min = (goeburstTimer/1000/60) << 0;
		   								sec = (goeburstTimer/1000) % 60;
		   								goeburstTimer = min + ':' + sec;

										save_profiles(profilegoeBURST, old_profiles, datasetID, indexToRemove, entries_ids, analysis_method, missing_threshold, goeburstTimer, parent_id, function(){
											phyloviz_input_utils.getNodes(datasetID, userID, false, function(dataset){
										      	createPhyloviZInput(dataset, function(graphInput){
										      		graphInput.distanceMatrix = distanceMatrix;
										      		phyloviz_input_utils.addToFilterTable(graphInput, userID, datasetID, [], function(){
										      			
										      			console.log('ADDED TO FILTER');
										      			if(send_email){
															console.log('getting mail');
															getEmail(userID, function(email){
																mailObject.email = email;
																mailObject.message = 'Your data set is now available at: ' + config.final_root + '/main/dataset/' + datasetID;
																console.log('have mail');
																sendMail(mailObject, function(){
																	console.log('Mail sent');
																});
															});
														}
														jobDone();
										      			
													});
											      });
										    });
										});
									/*}
									else {
										phyloviz_input_utils.getNodes(datasetID, userID, false, function(dataset){
									      	createPhyloviZInput(dataset, function(graphInput){
									      		graphInput.distanceMatrix = distanceMatrix;
									      		var t1 = performance.now();
									      		graphInput.goeburstTimer = t0-t1;
									      		phyloviz_input_utils.addToFilterTable(graphInput, userID, datasetID, [], function(){

									      			if(send_email){
														console.log('getting mail');
														getEmail(userID, function(email){
															mailObject.email = email;
															mailObject.message = 'Your data set is now available at: ' + config.final_root + '/main/dataset/' + datasetID;
															console.log('have mail');
															sendMail(mailObject, function(){
																console.log('Mail sent');
															});
														});
													}
													jobDone();
									      			
												});
										      });
									    });
									}
									*/
								});
							}
							else{
								jobDone();
							}
							//else res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
							//jobDone();
						});
					});
				});
			});
		}
		else jobDone();

	});

}
  

router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		console.log('WORKER:', cluster.worker.id);

		var datasetID = req.query.dataset_id;
		var sendEmail = false;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		//console.log(req.user);

		var datasetId;
		var missings = [false, ''];
		var analysis_method = 'core';
		var missing_threshold = '100';

		if (req.query.send_email == 'true'){
			sendEmail = true;
		}

		if (req.query.missings == 'true'){
			missings = [true, req.query.missingchar];
		}

		if (req.query.parent_id != undefined || req.query.parent_id != 'false'){
			parent_id = req.query.parent_id;
		}
		else parent_id = undefined;

		if (req.query.missing_threshold){
			missing_threshold = req.query.missing_threshold;
		}

		if (req.query.analysis_method){
			analysis_method = req.query.analysis_method;
		}

		missing_threshold = parseFloat(missing_threshold)/100;

		if (req.query.algorithm) var algorithmToUse = req.query.algorithm;
		else var algorithmToUse = 'prim';

		if(req.query.onqueue == 'true'){
			var parameters = {datasetID:datasetID, sendEmail:sendEmail, userID:userID, algorithmToUse:algorithmToUse, analysis_method:analysis_method, missings:missings, save:req.query.save, hasmissings:req.query.missings, missing_threshold:missing_threshold, parent_id:parent_id};
			
			var job = queue.create('goeBURST', parameters).save(function(err){
				if(!err) {
					queue_message = 'Your data set is being processed. You will be redirected to your <a href="'+config.final_root+'/main/dataset/'+datasetID+'">data set URL</a> ';
					if(sendEmail) queue_message += 'and receive an email ';
					queue_message += 'when the job is finished.';
					res.send({queue: queue_message, jobid: job.id});
				}
			});
			/* Bull
			queue.add(parameters, {timeout:10000000000000, attempts:2}).then(function(job){
				queue_message = 'Your data set is being processed. You will be redirected to your <a href="'+config.final_root+'/main/dataset/'+datasetID+'">data set URL</a> ';
				if(sendEmail) queue_message += 'and receive an email ';
				queue_message += 'when the job is finished.';
				res.send({queue: queue_message, jobid: job.jobId});
			});
			*/	


		}
		else{
			var start = clock();	
			loadProfiles(datasetID, userID, function(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles, entries_ids){
				datasetId = datasetID;
				old_profiles = profiles;
				goeBURST(profileArray, identifiers, algorithmToUse, missings, analysis_method, missing_threshold, function(links, distanceMatrix, profilegoeBURST, indexToRemove){
					var goeburstTimer = clock(start);
					min = (goeburstTimer/1000/60) << 0;
					sec = (goeburstTimer/1000) % 60;
					goeburstTimer = min + ':' + sec;

					if(req.query.save){
						saveLinks(datasetID, links, missings, function(){
							//if(req.query.missings == 'true'){
							save_profiles(profilegoeBURST, old_profiles, datasetID, indexToRemove, entries_ids, analysis_method, missings[1], goeburstTimer, parent_id, function(){
								res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
							});
							//}
							//else res.send({datasetID: req.query.dataset_id, links: links, distanceMatrix: distanceMatrix, dupProfiles: dupProfiles, dupIDs: dupIDs});
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
	if(req.query.jobid){
		var status = '';
		queue.complete(function(err, ids){
			ids.forEach( function( job_id ) {
				if (parseInt(job_id) == parseInt(req.query.jobid)){
					status = 'completed';
					kue.Job.get(job_id, function(err, job) {
						job.remove();
					});
					res.send({status: status});
				}
				
			});
			
		})
		if (status != 'completed'){
			status = 'active';
		}

		/* Bull
		queue.getJob(req.query.jobid).then(function(job){
			job.getState().then(function(state){
				console.log(state);
				res.send({status: state});
			});
		});
		*/
	}
	else res.send({status: 'error'});

});


router.post('/save', function(req, res, next){
	
	if (req.body.dataset_id){

		var datasetID = req.body.dataset_id;
		var missings = [false, ''];

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		if (req.query.missings == 'true'){
			missings = [true, req.query.missingchar];
		}

		saveLinks(datasetID, req.body.links, missings, function(){
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
				"SELECT data, id FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';" +
				"SELECT schemeGenes FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';";
		
		client.query(query, function(err, result) {
	    if(err) {
	      return console.error('error running query', err);
	    }

	    var profiles = [];
	    var entries_ids = [];
	    for(row in result.rows){
	    	var resultObject = result.rows[row];
	    	if(resultObject.hasOwnProperty('data')){
	    		profiles = profiles.concat(result.rows[row].data.profiles);
	    		entries_ids.push(result.rows[row].id);
	    	}
	    	else if(resultObject.hasOwnProperty('data_type')) var data_type = result.rows[row].data_type;
	    	else if(resultObject.hasOwnProperty('schemegenes')) var schemeGenes = result.rows[row].schemegenes;
	    }
	    //console.log(profiles);
	    //var data_type = result.rows[0].data_type;

	    //console.log(profiles);
	    //var profiles = result.rows[1].data.profiles;
	    //var schemeGenes = result.rows[2].schemegenes;

		
		var existsProfile = {};
		var dupProfiles = [];
		var dupIDs = [];
		var existsIdentifiers = {}

		console.log('before', profiles.length);

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
		callback(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles, entries_ids);


	  });
	    //}
	  //});
	});


}

function saveLinks(datasetID, links, missings, callback){

	//var datasetModel = require('../../../models/datasets');

	var pg = require("pg");
	var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
	var linksToUse = { links: links, missings: missings };
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

function save_profiles(profilegoeBURST, profiles, datasetID, indexesToRemove, entries_ids, analysis_method, missing_threshold, goeburst_timer, parent_id, callback){
	
	var countProfiles = 0;
	var newProfiles = [];
	console.log('S', missing_threshold);

	var pg = require("pg");
	var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;

	//if(profilegoeBURST[0].length != Object.keys(profiles[0]).length) 
	var profilesToUse = { profiles: profiles, indexestoremove: indexesToRemove, profilesize: profilegoeBURST[0].length };
	//else var profilesToUse = { profiles: profiles };
	//var distanceMatrixToUse =  { distanceMatrix: distanceMatrix };
	//distanceMatrixToUse = {distanceMatrix: []};

	var client = new pg.Client(connectionString);

	 client.connect(function(err) {
      if(err) {
        data.hasError = true;
        data.errorMessage = 'Could not connect to database.'; //+ err.toString();
        return callback(data);
      }

		var pTouse = {};
		countEntries = 0;
		countBatches = 0;
		var completeBatches = 0;

		while(profilesToUse.profiles.length){
	        countBatches+=1;
	        if(countBatches == 1) pTouse[countBatches] = { profiles: profilesToUse.profiles.splice(0, config.batchSize), indexestoremove: indexesToRemove, profilesize: profilegoeBURST[0].length, analysis_method:analysis_method, missing_threshold: missing_threshold, goeburst_timer: goeburst_timer, parent_id:parent_id};
	        else pTouse[countBatches] = { profiles: profilesToUse.profiles.splice(0, config.batchSize)};

	        queryUpdate = "UPDATE datasets.profiles SET data = $1 WHERE dataset_id ='"+datasetID+"' AND id ='"+String(entries_ids[countEntries])+"';";

	          client.query(queryUpdate, [pTouse[countBatches]], function(err, result) {
	          	completeBatches += 1;
	            if(err) {
	              data.hasError = true;
	              console.log(err);
	              data.errorMessage = 'Could not upload input data. Possible unsupported file type. For information on supported file types click <a href="/index/inputinfo">here</a>.'; //+ err.toString();
	              return callback(data);
	            }
	            if (countBatches == completeBatches){
	            	callback();
	           	}

	          });
	        countEntries+=1;
	    }
	   });

}

module.exports = router; 