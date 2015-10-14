 

var express = require('express'); 
//var app = express();
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

		var query = 'CREATE TABLE datasets.links (id SERIAL PRIMARY KEY, dataset_id integer NOT NULL, data jsonb);' +
					'CREATE TABLE datasets.profiles (id SERIAL PRIMARY KEY, dataset_id integer NOT NULL, schemeGenes text[], data jsonb);' +
					'CREATE TABLE datasets.isolates (id SERIAL PRIMARY KEY, dataset_id integer NOT NULL, metadata text[], data jsonb);' +
					'CREATE TABLE datasets.positions (id SERIAL PRIMARY KEY, dataset_id integer NOT NULL, data jsonb);' +
					'CREATE TABLE datasets.newick (id SERIAL PRIMARY KEY, dataset_id integer NOT NULL, data jsonb);' +
					'CREATE TABLE datasets.users (id SERIAL PRIMARY KEY, username varchar(20) UNIQUE, pass text);' +
					'CREATE TABLE datasets.datasets (id SERIAL PRIMARY KEY, user_id varchar(20) NOT NULL, name varchar(20) NOT NULL, key varchar(20) NOT NULL);';

	
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

	console.log(req);


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

	function findOnTable(params, reqQuery, callback){

		if (params.field == 'all') query = "SELECT * FROM datasets."+params.table+";";
		else{
			query = "SELECT "+req.params.field+" FROM datasets."+params.table;
			if (Object.keys(reqQuery).length == 0) query+=";";
			else{
				query += " WHERE ";
				for (i in reqQuery){
					query += i + " = '" + reqQuery[i] + "'";
					query += ' AND ';

				}
				query = query.substring(0, query.length - 5);
				query += ";";
				console.log(query);
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

	findOnTable(req.params, req.query, function (doc){
		res.send(doc);
	});
	
});

router.put('/update/:table/:field/', function(req, res, next){

	function updateJSON(params, reqBody, callback){

		query = "SELECT id FROM datasets.datasets WHERE name = $1;";

		var client = new pg.Client(connectionString);
		client.connect(function(err) {
		  if(err) {
		    return console.error('could not connect to postgres', err);
		  }
		  client.query(query, [reqBody.name], function(err, result) {
		    if(err) {
		      return console.error('error running query', err);
		    }
		    datasetID = result.rows[0].id;

		    query = "UPDATE datasets."+params.table+" SET "+params.field+" = $1 WHERE id = $2;";

		    client.query(query, [reqBody.change, datasetID], function(err, result) {
			    if(err) {
			      return console.error('error running query', err);
			    }
			    client.end();
			    callback();

			});
		  });
		});

	}

	updateJSON(req.params, req.body, function (doc){
		res.sendStatus(200);
	});
	
});

module.exports = router;