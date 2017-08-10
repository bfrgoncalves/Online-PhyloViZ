var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var crypto = require('crypto');

var config = require('../../../config.js');
var phyloviz_input_utils = require('phyloviz_input_utils')(config);
var createPhyloviZInput = require('phyloviz_input');

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
		var missing_threshold = '0';

		if(req.body.analysis_method) analysis_method = req.body.analysis_method;
		if(req.body.missing_threshold) missing_threshold = req.body.missing_threshold;
		if(req.body.parent_id) parent_id = req.body.parent_id;


		phyloviz_input_utils.checkIfpublic(req.body.parentName, req.user.id, function(isPublic){
			phyloviz_input_utils.getAux(req.body.parentName, req.user.id, true, function(dataset_aux){
				phyloviz_input_utils.getMetadata(req.body.parentName, req.user.id, true, function(dataset_m){
					dataset_aux[0].metadata = dataset_m[0].metadata;
					createPhyloviZInput(dataset_aux, function(graphInput_aux){
						phyloviz_input_utils.getFromFilterTable(req.body.parentName, function(graph){

							var selectedIndexes = JSON.parse(req.body.nodeindexes);
							//Headers
							console.log(graphInput_aux.schemeGenes);
							Headers_Profiles = graphInput_aux.schemeGenes.join('\t') + '\n';
							console.log(graphInput_aux.metadata);
							if(graphInput_aux.metadata != undefined) Headers_Aux = graphInput_aux.metadata.join('\t') + '\n';
							else Headers_Aux = '';
							

							fs.appendFile("uploads/"+profileName, Headers_Profiles, function(err) {
								fs.appendFile("uploads/"+metadataName, Headers_Aux, function(err) {
									//body
						            countLines = 0;
						            l = 0;
						            function add_toFiles(l){
						            	index = parseInt(selectedIndexes[l]);
										var body_profile = graph.nodes[index].key + '\t' + graph.nodes[index].profile.join('\t') + '\n';
										var aux_isolates = '';

										for(x in graph.mergedNodes[graph.nodes[index].key]){
											console.log(graph.mergedNodes[graph.nodes[index].key][x].key);
											body_profile += graph.mergedNodes[graph.nodes[index].key][x].key + '\t' + graph.mergedNodes[graph.nodes[index].key][x].profile.join('\t') + '\n';
										}



										for(j in graph.nodes[index].isolates){
											aux_isolates += graph.nodes[index].isolates[j].join('\t') + '\n';
										}

										fs.appendFile("uploads/"+profileName, body_profile, function(err) {
												fs.appendFile("uploads/"+metadataName, aux_isolates, function(err) {
													countLines += 1;
													if (countLines == selectedIndexes.length) runPython();
													else add_toFiles(l+1);
							            	});
						            	});
						            }
						            add_toFiles(l);
						            /*
									for(i in selectedIndexes){
										index = parseInt(selectedIndexes[i]);
										var body_profile = graph.nodes[index].key + '\t' + graph.nodes[index].profile.join('\t') + '\n';
										var aux_isolates = '';

										for(j in graph.nodes[index].isolates){
											aux_isolates += graph.nodes[index].isolates[j].join('\t') + '\n';
										}


										fs.appendFile("uploads/"+profileName, body_profile, function(err) {
												fs.appendFile("uploads/"+metadataName, aux_isolates, function(err) {
													countLines += 1;
													if (countLines == selectedIndexes.length) runPython();
							            	});
						            	});

									}
									*/
				            	});
				            });


							function runPython(){
								var python = require('child_process').exec;
								    
							    if(req.body.missings == 'true') var commandstring = 'python remote_upload/remoteUpload.py -t '+cookie_string+' -cd '+config.final_root+' -am '+analysis_method+' -root '+config.final_root+' -mc ' + req.body.missingschar + ' -mt ' + missing_threshold + ' -sdt profile -sd uploads/'+profileName+' -d "'+req.body.name+'" -dn "'+req.body.description+'" -m uploads/'+metadataName+' -pid ' + parent_id;
							    else var commandstring = 'python remote_upload/remoteUpload.py -t '+cookie_string+' -cd '+config.final_root+' -root '+config.final_root+' -sdt profile -sd uploads/'+profileName+' -d "'+req.body.name+'" -dn "'+req.body.description+'" -m uploads/'+metadataName+' -pid ' + parent_id;
							    
							    python(commandstring, {maxBuffer: 1024 * 4000}, function(error,stdout,stderr){
							    	if(error){
							    		console.log(error);
							    		//console.log(stdout);
							    		res.send({stdout:error, status: 500});
							    	}
							    	else {
							    		//console.log(stdout);
							    		res.send({stdout:stdout, status: 200});
							    	}
							    });
							}
							

						    /*
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
								    
								    if(req.body.missings == 'true') var commandstring = 'python remote_upload/remoteUpload.py -t '+cookie_string+' -cd '+config.final_root+' -root '+config.final_root+' -mc ' + req.body.missingschar + ' -sdt profile -sd uploads/'+profileName+' -d '+req.body.name+' -dn '+req.body.description+' -m uploads/'+metadataName;
								    else var commandstring = 'python remote_upload/remoteUpload.py -t '+cookie_string+' -cd '+config.final_root+' -root '+config.final_root+' -sdt profile -sd uploads/'+profileName+' -d '+req.body.name+' -dn '+req.body.description+' -m uploads/'+metadataName;
								    
								    python(commandstring, {maxBuffer: 1024 * 4000}, function(error,stdout,stderr){
								    	if(error){
								    		console.log(error);
								    		//console.log(stdout);
								    		res.send({stdout:error, status: 500});
								    	}
								    	else {
								    		//console.log(stdout);
								    		res.send({stdout:stdout, status: 200});
								    	}
								    });
									

								}); 
							}); 
							*/
						});
					});
				});
			});
		});
	}
	else res.send({stdout:'Login before creating a subset.', status: 401});
        
});



module.exports = router;