var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var crypto = require('crypto');

var config = require('../../../config.js');
var fs = require('fs');

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

router.post('/', function(req, res, next){

	//if (req.isAuthenticated()){

		var profileName = makeid()+".txt";
		var metadataname = makeid()+".txt";

		fs.writeFile("uploads/"+profileName, req.body.profileData, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("The file was saved!");

		    fs.writeFile("uploads/"+metadataName, req.body.auxData, function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			    output='';
			    var python = require('child_process').exec;
			    python('cd remote_upload/ & python remote_upload/remoteUpload.py -u bruno -p test -sdt profile -sd uploads/'+profileName+' -d '+req.body.name+' -dn '+req.body.description+' -m uploads/'+metadataName, function(error,stdout,stderr){
			    	if(error){
			    		console.log(error);
			    	}
			    	console.log('AQUI');
			    	console.log(stdout);
			    	res.send(200, stdout);
			    });
			}); 
		}); 
	//}
	//else res.send("Login first");
        
});

module.exports = router;