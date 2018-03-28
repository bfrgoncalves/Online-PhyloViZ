var express = require('express'); 
var router = express.Router(); 
var goeBURST = require('goeBURST');
var config = require('../../../config.js');
var kue = require('kue');
var queue = kue.createQueue();
var cluster = require('cluster');


router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		console.log('WORKER:', cluster.worker.id);

		var datasetID = req.query.dataset_id;
		var sendEmail = false;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

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

		var parameters = {datasetID:datasetID, sendEmail:sendEmail, userID:userID, algorithmToUse:algorithmToUse, analysis_method:analysis_method, missings:missings, save:req.query.save, hasmissings:req.query.missings, missing_threshold:missing_threshold, parent_id:parent_id};
		
		var job = queue.create('goeBURST', parameters).save(function(err){
			if(!err) {
				queue_message = 'Your data set is being processed. You will be redirected to your <a href="'+config.final_root+'/main/dataset/'+datasetID+'">data set URL</a> ';
				if(sendEmail) queue_message += 'and receive an email ';
				queue_message += 'when the job is finished.';
				res.send({queue: queue_message, jobid: job.id});
			}
		});
	}
	else{
		res.send({message: 'select a data set ID'});
	}
	
});

router.get('/status', function(req,res,next){
	if(req.query.jobid){
		var status = '';
		queue.complete(function(err, ids){
			totalids = ids.length;
			countids = 0;
			ids.forEach( function( job_id ) {
				countids += 1;
				if (parseInt(job_id) == parseInt(req.query.jobid)){
					kue.Job.get(job_id, function(err, job) {
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
				else if (countids === totalids){
					res.send({status: "active"});
				}
			});
		})
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