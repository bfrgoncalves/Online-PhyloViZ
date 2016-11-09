var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createPhyloviZInput = require('phyloviz_input');


var config = require('../../../config.js');
var phyloviz_input_utils = require('phyloviz_input_utils')(config);


router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){

			phyloviz_input_utils.getDataset(datasetID, userID, isPublic, function(dataset){
		      createPhyloviZInput(dataset, function(graphInput){
		      	res.send(graphInput);
		      });
		    
		    });

		});

	}
	else res.send(false);
		
});

router.get('/nodes', function(req, res, next){

	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		if(req.query.update == 'true'){
			update = true;
		}
		else update = false;

		var isNewick = false;

		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){
			phyloviz_input_utils.getFromFilterTable(datasetID, function(graph){
				if(graph.nodes.length != 0 && !update){
					console.log('From Filters');
					phyloviz_input_utils.FlushFunction(graph, res);

				}
				else{
					phyloviz_input_utils.getNodes(datasetID, userID, isPublic, function(dataset){
						if (update){
							newMetadata = {metadata:dataset[0].metadata, isolates:dataset[0].isolates};
							phyloviz_input_utils.mergeMetadata(graph, newMetadata, function(graph){
								phyloviz_input_utils.addToFilterTable(graph, userID, datasetID, ['nodes'], function(){
									res.send({status:true});
								});
							});
						}
						else{
					      	createPhyloviZInput(dataset, function(graphInput){
					      		phyloviz_input_utils.addToFilterTable(graphInput, userID, datasetID, [], function(){
					      			phyloviz_input_utils.FlushFunction(graphInput, res);
								});
						      });
					    }
				    });
				}
			})
			

		});

	}
	else res.send(false);
		
});

router.get('/links', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;
		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){
			phyloviz_input_utils.getLinks(datasetID, userID, isPublic, function(dataset){
				//console.log(dataset.links);
		      	createPhyloviZInput(dataset, function(graphInput){
		      		console.log('flush links');
		      		var graph = {};
		      		graph.links = graphInput.links;
		      		phyloviz_input_utils.FlushFunction(graph, res);
			      	//res.send(graphInput);
			      });
		    });

		});

	}
	else res.send(false);
		
});

router.get('/aux', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){
			phyloviz_input_utils.getAux(datasetID, userID, isPublic, function(dataset){
		      	createPhyloviZInput(dataset, function(graphInput){
			      	res.send(graphInput);
			      });
		    });

		});

	}
	else res.send(false);
		
});

router.get('/positions', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){
			phyloviz_input_utils.getPositions(datasetID, userID, isPublic, function(dataset){
		      	createPhyloviZInput(dataset, function(graphInput){
			      	res.send(graphInput);
			      });
		    });

		});

	}
	else res.send(false);
		
});

router.get('/newick', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){
			phyloviz_input_utils.getNewick(datasetID, userID, isPublic, function(dataset){
		      	createPhyloviZInput(dataset, function(graphInput){
			      	res.send(graphInput);
			      });
		    });

		});

	}
	else res.send(false);
		
});

router.get('/metadata', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		phyloviz_input_utils.checkIfpublic(datasetID, userID, function(isPublic){

			phyloviz_input_utils.getMetadata(datasetID, userID, isPublic, function(dataset){
		      	res.send(dataset);
		    });

		});

	}
	else res.send(false);
		
});


module.exports = router; 