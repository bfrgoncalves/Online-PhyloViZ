var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var createTable_data = require('phyloviz_TableData');

router.get('/', function(req, res, next){
	
	if (req.query.name){

		var dataToGraph = {};
		var datasetName = req.query.name;

		if (req.query.parameter != null){
			var parameter = req.query.parameter;
			getDataset(datasetName, parameter, function(dataset){
		      createTable_data({dataset: dataset[0].data, parameter: parameter, headers: dataset[1].headers}, function(table_data){
		      	res.send({status: 'OK', data: table_data.data, headers: table_data.headers});
		      });
		    });
		} 
		else res.send({status: 'parameter missing'});

	}
	else res.send({status: 'parameter missing'});
		
});

function getDataset(datasetName, parameter, callback) {

	var pg = require("pg");
  	var connectionString = "postgres://localhost/phyloviz";

  	query = "SELECT id FROM datasets.datasets WHERE name='"+datasetName+"';";

  	var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        //client.end();
        datasetID = result.rows[0].id;
        query = "SELECT data FROM datasets."+parameter+" WHERE id="+datasetID+";";
        if (parameter == 'isolates') query += " SELECT metadata AS headers FROM datasets.isolates WHERE id="+datasetID+";";
        else if (parameter == 'profiles') query +=  " SELECT schemeGenes AS headers FROM datasets.profiles WHERE id="+datasetID+";";

        client.query(query, function(err, result) {
	        if(err) {
	          return console.error('error running query', err);
	        }
	        client.end();
	        callback(result.rows);
	    });
      });
    });
}

module.exports = router; 