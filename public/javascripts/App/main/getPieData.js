

function gatherMetadata(graph, propertyIndex, metadataFilter, callback){

	var objectOfTotal = {};
	var objectOfType = {};

	var countProperties = 0;
	var maxDiffProperties = 1;

	propertyIndex = graph.metadata.indexOf(propertyToCheck);

	graph.nodes.forEach(function(node){

		objectOfType[node.key] = [];
		var numberTypes = 0;

		if (propertyToCheck != 'None'){

			if (node.isolates.length > 0){

			  for (i = 0; i < node.isolates.length; i++){

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
			      }
			  }
			}
		}

  	});

  	callback(objectOfTotal, objectOfType, countProperties);

}


function gatherSchemeData(graph, propertyToCheck, schemeFilter, callback){

	var objectOfTotal = {};
	var objectOfProfile = {};
	var countProperties = 0;

	graph.nodes.forEach(function(node){

	    objectOfProfile[node.key] = [];
	    var numberTypes = 0;

	    if (propertyToCheck != 'None'){
	    	var schemeGenes = graph.schemeGenes.slice();
  			schemeGenes.shift();

	        propertyIndex = schemeGenes.indexOf(propertyToCheck);

	        if(objectOfTotal[String(node.profile[propertyIndex])]) objectOfTotal[String(node.profile[propertyIndex])] += 1;
	        else{
	            objectOfTotal[String(node.profile[propertyIndex])] = 1;
	            countProperties += 1;
	          }

	        if (schemeFilter[2].length == 0 || (schemeFilter[1].indexOf(node.key) > -1 && schemeFilter[2].indexOf(String(node.profile[propertyIndex])) > -1)){
		        if(objectOfProfile[node.key][String(node.profile[propertyIndex])]) objectOfProfile[node.key][String(node.profile[propertyIndex])] += 1;
		        else{
		          numberTypes += 1;
		          objectOfProfile[node.key][String(node.profile[propertyIndex])] = 1;
		        }
		    }
		}	

	});

	callback(objectOfTotal, objectOfProfile, countProperties);

}



function changeNodeUIData(objectOfType, graphics, propertyIndexes, arrayColors){

	for(i in objectOfType){
	    var dataToChange = [];
	    var indexes = [];
	    var nodeUI = graphics.getNodeUI(i);
	    
	    if(!$.isEmptyObject(objectOfType[i])){

		    nodeUI.rawData = objectOfType[i];

		    for (j in objectOfType[i]){
		      dataToChange.push(objectOfType[i][j]);
		      indexes.push(arrayColors[propertyIndexes[j]]);
		    }
		}
		noDataColor = 0xDEDEDE; //Color to use when there is no associated data to the nodes
	    if (dataToChange.length < 1) newValues = assignQuadrant(getDataPercentage([1]), [noDataColor]);
	    else newValues = assignQuadrant(getDataPercentage(dataToChange), indexes);
	    
	    dataToChange = newValues[0];
	    indexes = newValues[1];
	    
	    nodeUI.data = dataToChange;  //Apply data to the nodeUI
	    //console.log(dataToChange);
	    nodeUI.colorIndexes = indexes; //Apply data to the nodeUI
	    nodeUI.backupColor = indexes;

  	}
}