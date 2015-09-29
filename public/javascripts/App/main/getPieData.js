

function gatherMetadata(graph, propertyIndex, callback){

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

			      if(objectOfType[node.key][String(node.isolates[i][propertyIndex])]) objectOfType[node.key][String(node.isolates[i][propertyIndex])] += 1;
			      else{
			        numberTypes += 1;
			        objectOfType[node.key][String(node.isolates[i][propertyIndex])] = 1;
			      } 
			  }
			}
		}

  	});

  	callback(objectOfTotal, objectOfType, countProperties);

}


function gatherSchemeData(graph, propertyToCheck, callback){

	var objectOfTotal = {};
	var objectOfProfile = {};
	var countProperties = 0;



	graph.nodes.forEach(function(node){

	    objectOfProfile[node.key] = [];
	    var numberTypes = 0;

	    if (propertyToCheck != 'None'){

	        propertyIndex = graph.schemeGenes.indexOf(propertyToCheck);

	        if(objectOfTotal[String(node.profile[propertyIndex])]) objectOfTotal[String(node.profile[propertyIndex])] += 1;
	        else{
	            objectOfTotal[String(node.profile[propertyIndex])] = 1;
	            countProperties += 1;
	          }

	        if(objectOfProfile[node.key][String(node.profile[propertyIndex])]) objectOfProfile[node.key][String(node.profile[propertyIndex])] += 1;
	        else{
	          numberTypes += 1;
	          objectOfProfile[node.key][String(node.profile[propertyIndex])] = 1;
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
		    var processedData = [];
		    var newIndexes = [];

		    nodeUI.rawData = objectOfType[i];

		    for (j in objectOfType[i]){
		      dataToChange.push(objectOfType[i][j]);
		      indexes.push(arrayColors[propertyIndexes[j]]);
		    }
		}

	    if (dataToChange.length < 1) newValues = assignQuadrant(getDataPercentage([1]), [nodeUI.baseColor]);
	    else newValues = assignQuadrant(getDataPercentage(dataToChange), indexes);
	    
	    dataToChange = newValues[0];
	    indexes = newValues[1];
	    
	    nodeUI.data = dataToChange;  //Apply data to the nodeUI
	    nodeUI.colorIndexes = indexes; //Apply data to the nodeUI
	    nodeUI.backupColor = indexes;

  	}
}