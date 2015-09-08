

function gatherMetadata(graph, propertyIndex, callback){

	var objectOfTotal = {};
	var objectOfType = {};
	//var propertyIndexes = {};
	var countProperties = 0;
	var maxDiffProperties = 1;

	graph.nodes.forEach(function(node){

		objectOfType[node.key] = [];
		var numberTypes = 0;

		if (node.isolates.length > 0){

		  for (i = 0; i < node.isolates.length; i++){

		      if(objectOfTotal[String(node.isolates[i][propertyIndex])]) objectOfTotal[String(node.isolates[i][propertyIndex])] += 1;
		      else{
		        objectOfTotal[String(node.isolates[i][propertyIndex])] = 1;
		        //propertyIndexes[String(node.isolates[i][propertyIndex])] = countProperties;
		        countProperties += 1;
		      } 

		      if(objectOfType[node.key][String(node.isolates[i][propertyIndex])]) objectOfType[node.key][String(node.isolates[i][propertyIndex])] += 1;
		      else{
		        numberTypes += 1;
		        objectOfType[node.key][String(node.isolates[i][propertyIndex])] = 1;
		      } 
		  }
		  if (numberTypes > maxDiffProperties) maxDiffProperties = numberTypes;

		}

  	});

  	callback(objectOfTotal, objectOfType, maxDiffProperties, countProperties);

}


function gatherSchemeData(graph, propertyToCheck, callback){

	var objectOfTotal = {};
	var objectOfProfile = {};
	//var propertyIndexes = {};
	var countProperties = 0;
	var maxDiffProperties = 1;



	graph.nodes.forEach(function(node){

	    objectOfProfile[node.key] = [];
	    var numberTypes = 0;

	    if (propertyToCheck == 'All'){

	        if(objectOfTotal[String(node.profile)]) objectOfTotal[String(node.profile)] += 1;
	        else{
	            objectOfTotal[String(node.profile)] = 1;
	            //propertyIndexes[String(node.profile)] = countProperties;
	            countProperties += 1;
	          }

	        if(objectOfProfile[node.key][String(node.profile)]) objectOfProfile[node.key][String(node.profile)] += 1;
	        else{
	          numberTypes += 1;
	          objectOfProfile[node.key][String(node.profile)] = 1;
	        }
	    }
	    else{

	        propertyIndex = graph.schemeGenes.indexOf(propertyToCheck);

	        if(objectOfTotal[String(node.profile[propertyIndex])]) objectOfTotal[String(node.profile[propertyIndex])] += 1;
	        else{
	            objectOfTotal[String(node.profile[propertyIndex])] = 1;
	            //propertyIndexes[String(node.profile[propertyIndex])] = countProperties;
	            countProperties += 1;
	          }

	        if(objectOfProfile[node.key][String(node.profile[propertyIndex])]) objectOfProfile[node.key][String(node.profile[propertyIndex])] += 1;
	        else{
	          numberTypes += 1;
	          objectOfProfile[node.key][String(node.profile[propertyIndex])] = 1;
	        }
	    }
	    if (numberTypes > maxDiffProperties) maxDiffProperties = numberTypes;

	});

	callback(objectOfTotal, objectOfProfile, maxDiffProperties, countProperties);

}



function changeNodeUIData(objectOfType, graphics, propertyIndexes, maxDiffProperties, arrayColors){


	for(i in objectOfType){
	    var dataToChange = [];
	    var indexes = [];
	    var nodeUI = graphics.getNodeUI(i);
	    var processedData = [];
	    var newIndexes = [];

	    nodeUI.rawData = objectOfType[i];

	    for (j in objectOfType[i]){
	      //console.log(propertyIndexes[j]);
	      dataToChange.push(objectOfType[i][j]);
	      indexes.push(arrayColors[propertyIndexes[j]]);
	    }

	    newValues = assignQuadrant(getDataPercentage(dataToChange), indexes);
	    dataToChange = newValues[0];
	    indexes = newValues[1];

	    while(dataToChange.length < maxDiffProperties){
	      dataToChange.push(0);
	      indexes.push(0);
	    }

	    //console.log(dataToChange);
	    
	    nodeUI.data = dataToChange;  //Apply data to the nodeUI

	    nodeUI.colorIndexes = indexes; //Apply data to the nodeUI

  	}
}