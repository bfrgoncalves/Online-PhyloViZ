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

	if (req.isAuthenticated()){

		var cookie_string = '';
		
		for(i in req.cookies){
			cookie_string = i + '=' + req.cookies[i]; 
		}

		var profileName = makeid()+".txt";
		var metadataName = makeid()+".txt";

		var analysis_method= "core";

		if(req.body.analysis_method){
			analysis_method = analysis_method;
		}

		fs.writeFile("uploads/"+profileName, req.body.profileData, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    fs.writeFile("uploads/"+metadataName, req.body.auxData, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    output='';
			    var python = require('child_process').exec;
			    
			    if(req.body.missings == 'true') var commandstring = 'cd remote_upload/ & python remote_upload/remoteUpload.py -t '+cookie_string+' -cd '+config.final_root+' -root http://localhost:3000 -mc ' + req.body.missingschar + ' -sdt profile -sd uploads/'+profileName+' -d '+req.body.name+' -dn '+req.body.description+' -m uploads/'+metadataName;
			    else var commandstring = 'cd remote_upload/ & python remote_upload/remoteUpload.py -t '+cookie_string+' -cd '+config.final_root+' -root http://localhost:3000 -sdt profile -sd uploads/'+profileName+' -d '+req.body.name+' -dn '+req.body.description+' -m uploads/'+metadataName;
			    
			    python(commandstring, {maxBuffer: 1024 * 4000}, function(error,stdout,stderr){
			    	if(error){
			    		console.log(error);
			    		console.log(stdout);
			    		res.send({stdout:error, status: 500});
			    	}
			    	else {
			    		console.log(stdout);
			    		res.send({stdout:stdout, status: 200});
			    	}
			    });
				

			}); 
		}); 
	}
	else res.send({stdout:'Login before creating a subset.', status: 401});
        
});

module.exports = router;