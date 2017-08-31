

function gatherMetadata(graph, propertyToCheck, metadataFilter, callback){

	var objectOfTotal = {};
	var objectOfType = {};

	var countProperties = 0;
	var maxDiffProperties = 1;

	propertyIndex = graph.metadata.indexOf(propertyToCheck);
	var hasMultipleFields = false;

	graph.nodes.forEach(function(node){

		checkMetadataInNodes(node, function(){
			graph.mergedNodes[node.key].forEach(function(mergedNode){
				console.log(mergedNode);
				checkMetadataInNodes(mergedNode, function(){});
			});
		})

  	});

  	callback(objectOfTotal, objectOfType, countProperties, hasMultipleFields);

  	function checkMetadataInNodes(node, callback){

  		objectOfType[node.key] = [];
		var numberTypes = 0;
		var prevProperty = null;

  		if (propertyToCheck != 'None'){

			if (node.isolates.length > 0){

			  for (i = 0; i < node.isolates.length; i++){

			  	  if (prevProperty != null && prevProperty != node.isolates[i][propertyIndex]) hasMultipleFields = true;

			      if(objectOfTotal[String(node.isolates[i][propertyIndex])]) objectOfTotal[String(node.isolates[i][propertyIndex])] += 1;
			      else{
			        objectOfTotal[String(node.isolates[i][propertyIndex])] = 1;
			        countProperties += 1;
			      } 

			      if (metadataFilter[2].length == 0 || (metadataFilter[1].indexOf(node.key) > -1 && metadataFilter[2].indexOf(String(node.isolates[i][propertyIndex])) > -1)){
		      		  if(objectOfType[node.key][String(node.isolates[i][propertyIndex])]) objectOfType[node.key][String(node.isolates[i][propertyIndex])] += 1;
				      
				      else{
				        numberTypes += 1;
				        objectOfType[node.key][String(node.isolates[i][propertyIndex])] = 1;
				      } 
				      //console.log(objectOfType[graph.sameNodeHas[node.key]][String(node.isolates[i][propertyIndex])], String(node.isolates[i][propertyIndex]), graph.sameNodeHas[node.key]);
			      }

			      prevProperty = node.isolates[i][propertyIndex];
			  }
			}
		}
		callback();
			
	}

}


function gatherSchemeData(graph, propertyToCheck, schemeFilter, callback){

	var objectOfTotal = {};
	var objectOfProfile = {};
	var countProperties = 0;
	var hasMultipleFields = false;
	var numberTypes = 0;
	var prevProperty = null;

	graph.nodes.forEach(function(node){

	    objectOfProfile[node.key] = [];
	    numberTypes = 0;
	    prevProperty = null;

	    checkDataInNodes(node, function(){
	    	graph.mergedNodes[node.key].forEach(function(mergedNode){

	    		checkDataInNodes(mergedNode, function(){

	    		});
	    	});
	    });


	});

	callback(objectOfTotal, objectOfProfile, countProperties, hasMultipleFields);

	function checkDataInNodes(node, callback){

		if (propertyToCheck != 'None'){
	    	//var schemeGenes = graph.schemeGenes.slice();
	    	var schemeGenes = graph.schemeGenes;
  			//schemeGenes.shift();

	        propertyIndex = schemeGenes.indexOf(propertyToCheck);

	        if (Object.keys(objectOfProfile[graph.sameNodeHas[node.key]]).length > 0) hasMultipleFields = true;

	        if(propertyIndex == 0){

	        	if(objectOfTotal[String(node.key)]) objectOfTotal[String(node.key)] += 1;
		        else{
		            objectOfTotal[String(node.key)] = 1;
		            countProperties += 1;
		          }

		        if (schemeFilter[2].length == 0 || (schemeFilter[1].indexOf(node.key) > -1 && schemeFilter[2].indexOf(String(node.key)) > -1)){

			        if(objectOfProfile[graph.sameNodeHas[node.key]][String(node.key)]) objectOfProfile[graph.sameNodeHas[node.key]][String(node.key)] += 1;
			        else{
			          numberTypes += 1;
			          objectOfProfile[graph.sameNodeHas[node.key]][String(node.key)] = 1;
			        }
			    }

	        }
	        else {
	        	propertyIndex = propertyIndex - 1;
	        	if(objectOfTotal[String(node.profile[propertyIndex])]) objectOfTotal[String(node.profile[propertyIndex])] += 1;
		        else{
		            objectOfTotal[String(node.profile[propertyIndex])] = 1;
		            countProperties += 1;
		          }

		        if (schemeFilter[2].length == 0 || (schemeFilter[1].indexOf(node.key) > -1 && schemeFilter[2].indexOf(String(node.profile[propertyIndex])) > -1)){
			        if(objectOfProfile[graph.sameNodeHas[node.key]][String(node.profile[propertyIndex])]) objectOfProfile[graph.sameNodeHas[node.key]][String(node.profile[propertyIndex])] += 1;
			        else{
			          numberTypes += 1;
			          objectOfProfile[graph.sameNodeHas[node.key]][String(node.profile[propertyIndex])] = 1;
			        }
			    }

	        }
		}
		callback();	
	}

}



function changeNodeUIData(objectOfType, graphics, propertyIndexes, arrayColors, renderer, sameNodeHas){

	//console.log(objectOfType);

	noDataColor = 0xa5a5a5; //Color to use when there is no associated data to the nodes
	changedColor = {};

	for(k in objectOfType){
	    var dataToChange = [];
	    var indexes = [];

	    var nodeUI = graphics.getNodeUI(k);
	    if(nodeUI == undefined) continue;

	    if(!$.isEmptyObject(objectOfType[k])){
		    nodeUI.rawData = objectOfType[k];
		    console.log(nodeUI.rawData);
		    for (j in objectOfType[k]){
		      dataToChange.push(objectOfType[k][j]);
		      indexes.push(arrayColors[propertyIndexes[j]]);
		    }
		}

	    if (dataToChange.length < 1) newValues = assignQuadrant(getDataPercentage([1]), [noDataColor]);
	    else newValues = assignQuadrant(getDataPercentage(dataToChange), indexes);
	    
	    dataToChange = newValues[0];
	    indexes = newValues[1];
	    //if(k == 'Hi-12368') console.log(k, dataToChange, indexes);
	    if(changedColor[sameNodeHas[k]] != true || nodeUI.colorIndexes[0][0] == noDataColor){
	    	//if(k == 'Hi-12368' || k == 'Hi-11358') console.log(k, nodeUI);
		    nodeUI.data = dataToChange;  //Apply data to the nodeUI
		    nodeUI.colorIndexes = indexes; //Apply data to the nodeUI
		    //console.log(nodeUI.colorIndexes);
		    nodeUI.backupColor = indexes;
		    changedColor[sameNodeHas[k]] = true;
		}

  	}
  	//console.log(changedColor);

  	if($('#pauseLayout')[0].innerHTML == "Resume Layout"){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }

}