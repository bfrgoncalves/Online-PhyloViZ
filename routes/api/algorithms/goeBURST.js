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


function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
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

		//if(req.query.onqueue == 'true'){
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

		/*
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
		*/


	}
	else{
		res.send({message: 'select a data set ID'});
	}
	
});

router.get('/status', function(req,res,next){
	console.log("AQUI");
	if(req.query.jobid){
		console.log(req.query.jobid)
		var status = '';
		queue.complete(function(err, ids){
			console.log("ENTROU");
			ids.forEach( function( job_id ) {
				if (parseInt(job_id) == parseInt(req.query.jobid)){
					kue.Job.get(job_id, function(err, job) {
						console.log(job_id, job.state())
						if(job.state() == 'complete'){
							job.remove();
						}
						if (job.state() != 'complete'){
							status = 'active';
							res.send({status: status});
						}
						else res.send({status: job.state()});
					});
				}
				
			});
			
		})

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

module.exports = router; 