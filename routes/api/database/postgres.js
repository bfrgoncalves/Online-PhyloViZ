 

var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");


var pg = require("pg");
var connectionString = "postgres://localhost/phyloviz";


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

		var query = 'CREATE TABLE datasets.links (id SERIAL PRIMARY KEY, user_id text NOT NULL, dataset_id text NOT NULL, is_public boolean, data jsonb);' +
					'CREATE TABLE datasets.profiles (id SERIAL PRIMARY KEY, user_id text NOT NULL, schemeGenes text[], dataset_id text NOT NULL, is_public boolean, data jsonb);' +
					'CREATE TABLE datasets.isolates (id SERIAL PRIMARY KEY, user_id text NOT NULL, metadata text[], dataset_id text NOT NULL, is_public boolean, data jsonb);' +
					'CREATE TABLE datasets.positions (id SERIAL PRIMARY KEY, user_id text NOT NULL, dataset_id text NOT NULL, is_public boolean, data jsonb);' +
					'CREATE TABLE datasets.newick (id SERIAL PRIMARY KEY, user_id text NOT NULL, dataset_id text NOT NULL, is_public boolean, data jsonb);' +
					'CREATE TABLE datasets.users (id SERIAL PRIMARY KEY, username varchar(20) UNIQUE, user_id text UNIQUE, salt text, pass text, email text);' +
					'CREATE TABLE datasets.datasets (id SERIAL PRIMARY KEY, user_id text NOT NULL, name varchar(20) NOT NULL, dataset_id text NOT NULL, key varchar(20) NOT NULL, is_public boolean);' +
					
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

	function findOnTable(userID, params, reqQuery, callback){

		if (params.field == 'all') query = "SELECT * FROM datasets."+params.table+" WHERE user_id=$1;";
		else{
			query = "SELECT "+req.params.field+" FROM datasets."+params.table+" WHERE user_id=$1";
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

		var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, [userID], function(err, result) {
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
		res.send(doc);
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

		    query = "UPDATE datasets."+params.table+" SET "+params.field+" = $1 WHERE user_id = $2 AND dataset_id = $3;";

		    client.query(query, [reqBody.change, userID, reqBody.dataset_id], function(err, result) {
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

	updateJSON(user_id, req.params, req.body, function (doc){
		res.sendStatus(200);
	});
	
});

module.exports = router;