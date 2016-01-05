var pg = require("pg");

var cronFunctions = function(){

	return {
		deletePublic: function(connectionString, timeInterval){

			function deleteDataset(userID, callback){

				var client = new pg.Client(connectionString);
				client.connect(function(err) {
					if(err) {
					  	return console.error('could not connect to postgres', err);
					}

			    	query = "DELETE FROM datasets.datasets WHERE user_id = '"+userID+"' AND data_timestamp < NOW() - INTERVAL '"+ timeInterval + "';" +
			    			"DELETE FROM datasets.profiles WHERE user_id = '"+userID+"' AND data_timestamp < NOW() - INTERVAL '"+ timeInterval + "';" +
			    			"DELETE FROM datasets.isolates WHERE user_id = '"+userID+"' AND data_timestamp < NOW() - INTERVAL '"+ timeInterval + "';" +
			    			"DELETE FROM datasets.newick WHERE user_id = '"+userID+"' AND data_timestamp < NOW() - INTERVAL '"+ timeInterval + "';" +
			    			"DELETE FROM datasets.positions WHERE user_id = '"+userID+"' AND data_timestamp < NOW() - INTERVAL '"+ timeInterval + "';" +
			    			"DELETE FROM datasets.links WHERE user_id = '"+userID+"' AND data_timestamp < NOW() - INTERVAL '"+ timeInterval + "';";


				    client.query(query, function(err, result) {
					    if(err) {
					      return console.error('error running query', err);
					    }
					    client.end();
					    callback();

					});
				});
			}

			user_id = '1';//res.send({message: "Cannot delete datasets without being authenticated"});

			deleteDataset(user_id, function (){
				console.log('CronJob: DeleteDatasets Done');
			});
		}
	}
}

module.exports = cronFunctions;