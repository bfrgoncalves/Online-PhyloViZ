 

var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");

var config = require('../../../config.js');


var pg = require("pg");
var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;


router.get('/init', function(req, res, next){ //to change

	var instance = {
		name: 'init',
	    key: '',
	    schemeGenes: [],
	    metadata: [],
	    profiles: [],
	    isolates: [],
	    positions: {},
	    newick: []
	};

	function initDataset(callback){

		var query = 'CREATE TABLE datasets.links (id SERIAL PRIMARY KEY, user_id text NOT NULL, dataset_id text NOT NULL, is_public boolean, data jsonb, distanceMatrix jsonb, put_public boolean, data_timestamp timestamp);' +
					'CREATE TABLE datasets.profiles (id SERIAL PRIMARY KEY, user_id text NOT NULL, schemeGenes text[], dataset_id text NOT NULL, is_public boolean, data jsonb, put_public boolean, data_timestamp timestamp);' +
					'CREATE TABLE datasets.isolates (id SERIAL PRIMARY KEY, user_id text NOT NULL, metadata text[], dataset_id text NOT NULL, is_public boolean, data jsonb, put_public boolean, data_timestamp timestamp);' +
					'CREATE TABLE datasets.positions (id SERIAL PRIMARY KEY, user_id text NOT NULL, dataset_id text NOT NULL, is_public boolean, data jsonb, put_public boolean, data_timestamp timestamp);' +
					'CREATE TABLE datasets.newick (id SERIAL PRIMARY KEY, user_id text NOT NULL, dataset_id text NOT NULL, is_public boolean, data jsonb, put_public boolean, data_timestamp timestamp);' +
					'CREATE TABLE datasets.users (id SERIAL PRIMARY KEY, username text UNIQUE, user_id text UNIQUE, salt text, pass text, email text, put_public boolean, data_timestamp timestamp);' +
					'CREATE TABLE datasets.datasets (id SERIAL PRIMARY KEY, user_id text NOT NULL, name text NOT NULL, dataset_id text NOT NULL, key text NOT NULL, is_public boolean, description text, data_type text NOT NULL, put_public boolean, data_timestamp timestamp);' +
					
					"INSERT INTO datasets.users(username, user_id, salt, pass) VALUES('public', 'public', '1', 'public');";

	
		var client = new pg.Client(connectionString);
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

	initDataset(function(){
		res.send(true);
	})
	
});

router.post('/insert/:table', function(req, res, next){


	function insertOnTable(query, callback){
		
		var client = new pg.Client(connectionString);
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

	insertOnTable(req.params.table, req.query, function (doc){
		res.send(doc);
	});
	
});

router.get('/find/:table/:field/', function(req, res, next){

	function getusernames(userIDs, callback){
		
		query = '';
		for (i in userIDs){
			query += "SELECT username FROM datasets.users WHERE user_id='" + userIDs[i] + "';";
		}

		var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, function(err, result) {
		    if(err) {
		      return console.error('error running query', err);
		    }
		    client.end();
		    callback(result.rows);
		  });
		});

	}

	function findOnTable(userID, params, reqQuery, callback){

		if (params.field == 'all'){

			if (reqQuery.length != 0){

				query = "SELECT * FROM datasets."+params.table+" WHERE put_public ='true' AND user_id !='"+userID+"'";
				for (i in reqQuery){
					if(i != 'user_id'){
						query += " AND ";
						query += i + " = '" + reqQuery[i] + "'";
					}
				}
				query += ';';

				//if (userID != '1'){
					query += "SELECT * FROM datasets."+params.table+" WHERE user_id='"+userID+"'";
					for (i in reqQuery){
						if(i != 'user_id'){
							query += " AND ";
							query += i + " = '" + reqQuery[i] + "'";
						}
					}
					query += ";";
				//}

			} 
			else{
				query = "SELECT * FROM datasets."+params.table+" WHERE put_public ='true' AND user_id !='"+userID+"';";
				if (userID != '1') query += "SELECT * FROM datasets."+params.table+" WHERE user_id='"+userID+"';";
			}

		}
		else{
			query = "SELECT "+req.params.field+",user_id,put_public FROM datasets."+params.table+" WHERE put_public ='true' AND user_id !='"+userID+"'";
			if (Object.keys(reqQuery).length == 0) query+=";";
			else{
				for (i in reqQuery){
					if(i != 'user_id'){
						query += " AND ";
						query += i + " = '" + reqQuery[i] + "'";
					}

				}
				//query = query.substring(0, query.length - 5);
				query += ";";
			}

			if (userID != '1'){
				query += "SELECT "+req.params.field+",user_id,put_public FROM datasets."+params.table+" WHERE user_id='"+userID+"'";
				if (Object.keys(reqQuery).length == 0) query+=";";
				else{
					for (i in reqQuery){
						if(i != 'user_id'){
							query += " AND ";
							query += i + " = '" + reqQuery[i] + "'";
						}

					}
					//query = query.substring(0, query.length - 5);
					query += ";";
				}
			} 
		}

		var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, function(err, result) {
		    if(err) {
		      return console.error('error running query', err);
		    }
		    client.end();
		    callback(result.rows);
		  });
		});

	}

	if (!req.isAuthenticated()) user_id = "1";
	else user_id = req.user.id;

	findOnTable(user_id, req.params, req.query, function (doc){

		var toSend = {publicdatasets: [], userdatasets: []};
		var publicUserIDs = [];
		for (i in doc){
			topass = '';
			if(doc[i].hasOwnProperty('salt') && doc[i].hasOwnProperty('pass')){ 
				delete doc[i]['salt'];
				delete doc[i]['pass'];
			}
			if (req.params.field == 'all') topass = doc[i];
			else topass = doc[i][req.params.field];
			if (doc[i].user_id == user_id){

				if(user_id == '1')topass.owner = 'public';
				else topass.owner = req.user.name;

				toSend.userdatasets.push(topass);
			}
			//else toSend.userdatasets.push(topass);
			if (doc[i].put_public == true){
				publicUserIDs.push(doc[i].user_id);
				toSend.publicdatasets.push(topass);
			}
		}
		getusernames(publicUserIDs, function(doc){
			for (i in doc){
				toSend.publicdatasets[i].owner = doc[i].username;
			}
			res.send(toSend);
		});
	});
	
});

router.put('/update/:table/:field/', function(req, res, next){

	function updateJSON(userID, params, reqBody, callback){

		//query = "SELECT dataset_id FROM datasets.datasets WHERE name = $1 AND user_id=$2;";

		var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  //client.query(query, [reqBody.name, userID], function(err, result) {
		    //if(err) {
		      //return console.error('error running query', err);
		    //}
		    //datasetID = result.rows[0].id;

		    //console.log(reqBody.change, userID, reqBody.dataset_id);

		    if (params.table == 'all'){
		    	query = "UPDATE datasets.datasets SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
		    			"UPDATE datasets.profiles SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
		    			"UPDATE datasets.isolates SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
		    			"UPDATE datasets.newick SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
		    			"UPDATE datasets.positions SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
		    			"UPDATE datasets.links SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';";
		    }
		    else query = "UPDATE datasets."+params.table+" SET "+params.field+" = '"+reqBody.change+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';";

		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }
			    client.end();
			    callback();

			});
		  //});
		});

	}

	if (!req.isAuthenticated()) user_id = "1";
	else user_id = req.user.id;

	updateJSON(user_id, req.params, req.body, function (){
		res.send(true);
	});
	
});

router.delete('/delete', function(req, res){

	function deleteDataset(userID, reqBody, callback){

		var client = new pg.Client(connectionString);
		client.connect(function(err) {
			if(err) {
			  	return console.error('could not connect to postgres', err);
			}

	    	query = "DELETE FROM datasets.datasets WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
	    			"DELETE FROM datasets.profiles WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
	    			"DELETE FROM datasets.isolates WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
	    			"DELETE FROM datasets.newick WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
	    			"DELETE FROM datasets.positions WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';" +
	    			"DELETE FROM datasets.links WHERE user_id = '"+userID+"' AND dataset_id = '"+reqBody.dataset_id+"';";


		    client.query(query, function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }
			    client.end();
			    callback();

			});
		});
	}

	if (!req.isAuthenticated()) user_id = '1';//res.send({message: "Cannot delete datasets without being authenticated"});
	else user_id = req.user.id;

	deleteDataset(user_id, req.body, function (){
		res.send({message: "Dataset deleted"});
	});

});



module.exports = router;