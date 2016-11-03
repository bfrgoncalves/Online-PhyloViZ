var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createPhyloviZInput = require('phyloviz_input');

var config = require('../../../config.js');

router.get('/', function(req, res, next){
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		checkIfpublic(datasetID, userID, function(isPublic){

			getDataset(datasetID, userID, isPublic, function(dataset){
		      createPhyloviZInput(dataset, function(graphInput){
		      	res.send(graphInput);
		      });
		    
		    });

		});

	}
	else res.send(false);
		
});

router.get('/nodes', function(req, res, next){


	var iterCount = 0;
	var maxCount = 0;

	function populateArray(dataString, profileLength, nodeLength, callback) {

	    send(dataString, profileLength, nodeLength, function(){
	    	callback();
	    });
	}

	function send(dataString, profileLength, nodeLength, callback) {

	  if(profileLength != null && profileLength > 1000){
	  	setTimeout(function(){
	  		write_to_client(function(){
	  			callback();
	  		});
	  	}, 10)
	  }
	  else{
	  	write_to_client(function(){
	  		callback();
	  	});
	  }

	  function write_to_client(callback){
	  	  res.write("data: " + dataString + '\n\n');
	      res.flush(function() { // <--------- callback to flush which on invocation resumes the array population
		    callback();
	        //populateArray(++iterCount);

	      });
	  }
	}
	
	if (req.query.dataset_id){

		var dataToGraph = {};
		var datasetID = req.query.dataset_id;

		if (!req.isAuthenticated()) var userID = "1";
		else var userID = req.user.id;

		var isNewick = false;

		checkIfpublic(datasetID, userID, function(isPublic){
			getNodes(datasetID, userID, isPublic, function(dataset){
		      	createPhyloviZInput(dataset, function(graphInput){

		      		//res.setMaxListeners(0); //set listerners to infinity

		      		var counts = 0;
		      		var arrayOfKeys = Object.keys(graphInput);
		      		var numKeys = arrayOfKeys.length;
		      		var toAdd = '';

		      		var batches = 0;
					//var doneBatches = 0;
					var profileLength = graphInput.nodes[0].profile.length;

		      		maxCount = numKeys;

		      		res.setHeader('Content-Type', 'text/event-stream')
  					res.setHeader('Cache-Control', 'no-cache')

  					function flushSubset(toSend, callback){


  					}

  					function runFlush(index){

  						if(arrayOfKeys[index] == 'nodes' || arrayOfKeys[index] == 'subsetProfiles' || arrayOfKeys[index] == 'links'){
  							console.log(arrayOfKeys[index]);
  							if(graphInput[arrayOfKeys[index]].length != 0){
  								batches += 1;
  								console.log('BATCH ', batches);
		      					var nodeSlice = graphInput[arrayOfKeys[index]].splice(0, 1); //config.batchSize
		      					nodeLength = nodeSlice.length;
		      					var toSend = '{"' + arrayOfKeys[index] + '":' + JSON.stringify(nodeSlice) + '}';

 		      					populateArray(toSend, profileLength, nodeLength, function(){
		  							runFlush(index);
		  						});
  							}
  							else{
  								index += 1;
  								runFlush(index);
  							}

  						}
  						/*else if (arrayOfKeys[index] == 'subsetProfiles'){
  							if(graphInput.subsetProfiles.length != 0){
  								batches += 1;
  								console.log('BATCH ', batches);
		      					var nodeSlice = graphInput.subsetProfiles.splice(0, 1); //config.batchSize
		      					nodeLength = nodeSlice.length;
		      					var toSend = '{"' + arrayOfKeys[index] + '":' + JSON.stringify(nodeSlice) + '}';

 		      					populateArray(toSend, profileLength, nodeLength, function(){
		  							runFlush(index);
		  						});
  							}
  							else{
  								index += 1;
  								runFlush(index);
  							}
  						}*/
  						else{
  							console.log(arrayOfKeys[index]);
  							var toSend = '{"' + arrayOfKeys[index] + '":' + JSON.stringify(graphInput[arrayOfKeys[index]]) + '}';

  							//var toSend = '{"' + arrayOfKeys[index] + '":' + JSON.stringify({}) + '}';

	  						populateArray(toSend, null, null, function(){
	  							index += 1;
	  							if(index < numKeys) runFlush(index);
	  							else{
							      res.end();
							      return;
								    
	  							}
	  						});

  						}
  					}

  					runFlush(0);

  					/*

		      		for(i in graphInput){
		      			counts += 1;
		      			console.log(i);

		      			if(i == 'nodes'){
		      				
		      				/*
		      				var batches = 0;
		      				console.log(i, graphInput.nodes.length);
		      				while(graphInput.nodes.length){
		      					console.log('BATCH ', batches);
		      					if (batches == 0) addToBatches = '';
		      					else addToBatches = ',';
 		      					res.write(addToBatches + JSON.stringify({nodes: graphInput.nodes.splice(0, config.batchSize)}));
 		      					batches += 1;
		      				}
		      				*/
		      				

		      			//}
		      			//else{
		      				//console.log(i, graphInput[i].length);
		      				//res.write(JSON.stringify({values:graphInput[i]}));

		      			//}
		      			
		      			//if(counts != numKeys) res.write(',');
		      			//populateArray({values:graphInput[i]});

		      			//res.flush(); //used in the compression module to send data to the client
		      		//}
		      		/*
		      		res.on('close', function () {
		      			console.log('End');
					    res.end();
					})
					*/
		      		//res.flush();
			      	//res.end();

			      });
		    });

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

		checkIfpublic(datasetID, userID, function(isPublic){
			getLinks(datasetID, userID, isPublic, function(dataset){
		      	createPhyloviZInput(dataset, function(graphInput){
			      	res.send(graphInput);
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

		checkIfpublic(datasetID, userID, function(isPublic){
			getAux(datasetID, userID, isPublic, function(dataset){
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

		checkIfpublic(datasetID, userID, function(isPublic){
			getPositions(datasetID, userID, isPublic, function(dataset){
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

		checkIfpublic(datasetID, userID, function(isPublic){
			getNewick(datasetID, userID, isPublic, function(dataset){
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

		checkIfpublic(datasetID, userID, function(isPublic){

			getMetadata(datasetID, userID, isPublic, function(dataset){
		      	res.send(dataset);
		    });

		});

	}
	else res.send(false);
		
});


function checkIfpublic(datasetID, userID, callback){

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;
	var isPublic = false;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }

		    query = "SELECT name FROM datasets.datasets WHERE dataset_id='"+datasetID+"' AND put_public='t' LIMIT 1;";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

				if (result.rows.length > 0){
					isPublic = true;
				}

			    client.end();
			    callback(isPublic);
			});

		});


}

function getNodes(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  if(isPublic == true){
		  	query = "SELECT data AS profiles, schemeGenes FROM datasets.profiles WHERE dataset_id='"+datasetID+"';"+
		  			"SELECT data AS isolates, metadata FROM datasets.isolates WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		  			"SELECT key FROM datasets.datasets WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		  			"SELECT data AS links FROM datasets.links WHERE dataset_id='"+datasetID+"' LIMIT 1;";;

		  }
		  else{
		  	query = "SELECT data AS profiles, schemeGenes FROM datasets.profiles WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t');" +
		  			"SELECT data AS isolates, metadata FROM datasets.isolates WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		  			"SELECT key FROM datasets.datasets WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		  			"SELECT data AS links FROM datasets.links WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";
		  }

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};
				dataset.profiles = [];

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x == 'profiles') {
			    			dataset.profiles = dataset.profiles.concat(result.rows[i][x]['profiles']);//JSON.parse(JSON.stringify(result.rows[i][x]['profiles']).replace(/&39/g, "'"));
			    			if (result.rows[i][x].hasOwnProperty('indexestoremove')) dataset.indexestoremove = result.rows[i][x]['indexestoremove'];//JSON.parse(JSON.stringify(result.rows[i][x]['indexestoremove']).replace(/&39/g, "'"));
			    			if (result.rows[i][x].hasOwnProperty('profilesize')) dataset.profilesize = result.rows[i][x]['profilesize'];
			    		}
			    		else if( x  == 'links'){
			    			dataset.links = result.rows[i][x]['links'];
			    			dataset.missings = result.rows[i][x]['missings'];
			    		}
			    		else if( x  == 'isolates') dataset.isolates = result.rows[i][x]['isolates'];
			    		else if( x == 'schemegenes' || x == 'metadata' || x == 'key') dataset[x] = result.rows[i][x].toString().replace(/&39/g, "'").split(',');
			    	}
			    }

			    //dataset.links = [];
			    dataset.positions = {};

			    client.end();
			    callback([dataset]);
			});

		});

}

function getLinks(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  if(isPublic == true) query = "SELECT data AS links FROM datasets.links WHERE dataset_id='"+datasetID+"' LIMIT 1;";
		  else query = "SELECT data AS links FROM datasets.links WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x  == 'links'){
			    			dataset.links = result.rows[i][x]['links'];
			    			dataset.missings = result.rows[i][x]['missings'];
			    		}
			    	}
			    }

			    dataset.profiles = [];
			    dataset.isolates = [];
			    dataset.positions = {};


			    client.end();
			    callback([dataset]);
			});

		});

}

function getMetadata(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }

		  if(isPublic == true) query = "SELECT data AS isolates, metadata FROM datasets.isolates WHERE dataset_id='"+datasetID+"' LIMIT 1;";
		  else query = "SELECT data AS isolates, metadata FROM datasets.isolates WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";


		  //console.log(query);
		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x  == 'isolates') dataset.isolates = JSON.parse(JSON.stringify(result.rows[i][x]['isolates']).replace(/&39/g, "'"));
			    		else if(x == 'metadata') dataset[x] = result.rows[i][x].toString().replace(/&39/g, "'").split(',');
			    	}
			    }

			    client.end();
			    callback([dataset]);
			});

		});

}

function getAux(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  if(isPublic == true){
		  	query = "SELECT name, key, data_type FROM datasets.datasets WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		  			"SELECT schemeGenes FROM datasets.profiles WHERE dataset_id='"+datasetID+"';";
		  }
		  else{
		  	query = "SELECT name, key, data_type FROM datasets.datasets WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		  			"SELECT schemeGenes FROM datasets.profiles WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t');";
		  }

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x  == 'name' || x == 'key' || x == 'schemegenes' || x == 'data_type') dataset[x] = result.rows[i][x].toString().replace(/&39/g, "'").split(',');
			    	}
			    }
			    dataset.profiles = [];
			    dataset.isolates = [];
			    dataset.links = [];
			    dataset.positions = {};

			    client.end();
			    callback([dataset]);
			});

		});

}

function getPositions(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  if(isPublic == true) query = "SELECT data AS positions FROM datasets.positions WHERE dataset_id='"+datasetID+"' LIMIT 1;";
		  else query = "SELECT data AS positions FROM datasets.positions WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x  == 'positions') dataset.positions = result.rows[i][x];
			    	}
			    }

			    dataset.profiles = [];
			    dataset.isolates = [];
			    dataset.links = [];

			    client.end();
			    callback([dataset]);
			});

		});

}

function getNewick(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  if(isPublic == true) query = "SELECT data AS newick FROM datasets.newick WHERE dataset_id='"+datasetID+"' LIMIT 1;";
		  else query = "SELECT data AS newick FROM datasets.newick WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x  == 'newick') dataset.newick = result.rows[i][x]['newick'];
			    	}
			    }

			    client.end();
			    callback([dataset]);
			});

		});

}

function getDataset(datasetID, userID, isPublic, callback) {

	var pg = require("pg");
	var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

	//var datasetID;

	//query = "SELECT id FROM datasets.datasets WHERE dataset_id = '"+datasetID+"' AND user_id=$1;";

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }

		  if(isPublic == true){

		  	query = "SELECT data AS profiles, schemeGenes FROM datasets.profiles WHERE dataset_id='"+datasetID+"';" +
		    		"SELECT data AS isolates, metadata FROM datasets.isolates WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		    		"SELECT data AS links FROM datasets.links WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		    		//"SELECT distanceMatrix FROM datasets.links WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		    		"SELECT data AS newick FROM datasets.newick WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		    		"SELECT data AS positions FROM datasets.positions WHERE dataset_id='"+datasetID+"' LIMIT 1;" +
		    		"SELECT name, key, data_type FROM datasets.datasets WHERE dataset_id='"+datasetID+"' LIMIT 1;";

		  }
		  else{

		    query = "SELECT data AS profiles, schemeGenes FROM datasets.profiles WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t');" +
		    		"SELECT data AS isolates, metadata FROM datasets.isolates WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS links FROM datasets.links WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		//"SELECT distanceMatrix FROM datasets.links WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS newick FROM datasets.newick WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT data AS positions FROM datasets.positions WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;" +
		    		"SELECT name, key, data_type FROM datasets.datasets WHERE (dataset_id='"+datasetID+"' AND user_id='"+userID+"') OR (dataset_id='"+datasetID+"' AND is_public='t') LIMIT 1;";
		  }

		  //console.log(query);


		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }

				var dataset = {};
				dataset.profiles = [];

			    for(i in result.rows){
			    	for(x in result.rows[i]){
			    		if( x == 'profiles') {
			    			dataset.profiles = dataset.profiles.concat(result.rows[i][x]['profiles']);//JSON.parse(JSON.stringify(result.rows[i][x]['profiles']).replace(/&39/g, "'"));
			    			if (result.rows[i][x].hasOwnProperty('indexestoremove')) dataset.indexestoremove = result.rows[i][x]['indexestoremove'];//JSON.parse(JSON.stringify(result.rows[i][x]['indexestoremove']).replace(/&39/g, "'"));
			    			if (result.rows[i][x].hasOwnProperty('profilesize')) dataset.profilesize = result.rows[i][x]['profilesize'];
			    		}
			    		else if( x  == 'isolates') dataset.isolates = result.rows[i][x]['isolates'];
			    		else if( x  == 'links'){
			    			dataset.links = result.rows[i][x]['links'];
			    			dataset.missings = result.rows[i][x]['missings'];
			    		}
			    		else if( x  == 'distancematrix'){
			    			try{
			    				dataset.distanceMatrix = result.rows[i][x]['distanceMatrix'];
			    			}
			    			catch (TypeError){
			    				dataset.distanceMatrix = {};
			    			}
			    		} 
			    		else if( x  == 'newick') dataset.newick = result.rows[i][x]['newick'];
			    		else if( x  == 'positions') dataset.positions = result.rows[i][x];
			    		else if( x  == 'name' || x == 'key' || x == 'schemegenes' || x == 'metadata' || x == 'data_type') dataset[x] = result.rows[i][x].toString().replace(/&39/g, "'").split(',');
			    	}
			    }
			    client.end();
			    callback([dataset]);
			});

		});
}

module.exports = router; 