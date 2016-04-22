function SelectNodes(node, graphObject){

	var graphics = graphObject.graphics;
	var renderer = graphObject.renderer;

	var nodeUI = graphics.getNodeUI(node.id);

	if(node.id.indexOf('TransitionNode') < 0 && nodeUI.colorIndexes[0][0] != 0xFFA500ff) {

		graphObject.selectedNodes.push(node);

		//var nodeUI = graphics.getNodeUI(node.id);

		var newColors = [];
	    for (i in nodeUI.colorIndexes){
	      var colorsPerQuadrant = [];
	      for (j in nodeUI.colorIndexes[i]) colorsPerQuadrant.push(0xFFA500ff);
	      newColors.push(colorsPerQuadrant);
	    }
	    nodeUI.colorIndexes = newColors;

	    if(graphObject.isLayoutPaused){
	        renderer.resume();
	        setTimeout(function(){ renderer.pause();}, 5);
	    }

	}

}


function hamming(p, q) {
  var res = 0;
  for (var i = 0; i < p.length; i++)
    if (p[i] != q[i])
      res = res + 1;
  return res;
}

function hammingPairwise(p, q) {
  var res = 0;
  for (var i = 0; i < p.length; i++)
    if (p[i] != q[i] && p[i] != '-' && q[i] != '-')
      res = res + 1;
  return res;
}

var objectofnodes = {};
var arrayofnodes = [];
var newickRoot = "";
var id_to_index = {};


function calculateDistanceMatrix(graphObject, callback){

	objectofnodes = {};
	arrayofnodes = [];
	newickRoot = "";
	var maxDistance = -1;
	
	var distanceMatrix = [];
	setTimeout(function(){
		status('Computing Distance Matrix...');
		if(graphObject.data_type == 'newick'){
			graphObject.JSONnewick = nwk.parser.parse(graphObject.JSONnewick);
			createDistanceMatrix(graphObject, function(distanceMatrix){
				graphObject.distanceMatrix = distanceMatrix;
		    	callback(graphObject);
			});
		}
		else{
			for (var i = 0; i < graphObject.nodes.length-1; i++) {
				distanceMatrix.push([0]);
		    	for (var j = i+1; j < graphObject.nodes.length; j++) {
			      var diff = hammingPairwise(graphObject.nodes[i].profile, graphObject.nodes[j].profile);
			      distanceMatrix[i].push(diff);
			      if(diff > maxDistance) maxDistance = diff;
			    }
		    }
		    graphObject.distanceMatrix = distanceMatrix;
		    graphObject.maxDistanceValue = maxDistance;
		    callback(graphObject);
		}
	}, 10);

}

function createDistanceMatrix(graphObject, callback){

	var distanceMatrix = [];
	var countValues = 0;
	var maxDistance = -1;

	var JSONnewick = graphObject.JSONnewick;

	status('Computing Distance Matrix...');

	constructArray(JSONnewick, function(){

		for(i = 0; i<arrayofnodes.length; i++){
			distanceMatrix.push([]);
			//console.log(arrayofnodes[i].data);
			for(j=i; j<arrayofnodes.length; j++){
				//countValues +=1;
				//console.log(countValues +=1, commonAncestor(arrayofnodes[i], arrayofnodes[j]));
				var distance = commonAncestor(arrayofnodes[i], arrayofnodes[j]);
				if(distance > maxDistance) maxDistance = distance;
				distanceMatrix[i].push(distance);
				//if(arrayofnodes[i].data== '7444885' && arrayofnodes[j].data== '7444886') console.log(commonAncestor(arrayofnodes[i], arrayofnodes[j]));
			}
		}
		//console.log(maxDistance);
		graphObject.maxDistanceValue = maxDistance;
		//console.log(countValues);
		callback(distanceMatrix);

	});


}

function parents(node) {
  var parents = [];
  var distances = [];
  //console.log(node);
  try{

  	while(node.parent_id != null){
	  	parents.unshift(node.id);
	  	distances.unshift(node.branchlength);
	  	node = objectofnodes[node.parent_id];

	 }
  }
  catch(err){
  }
  parents.unshift(newickRoot.id);
  distances.unshift(0);
  return [parents, distances];
}

function commonAncestor(node1, node2) {
  var results1 = parents(node1);
  var results2 = parents(node2);

  var parents1 = results1[0];
  var parents2 = results2[0];
  var distances1 = results1[1];
  var distances2 = results2[1];
  //console.log(parents1, parents2);

  if (parents1[0] != parents2[0]) throw "No common ancestor!"

  for (var i = 0; i < parents1.length; i++) {
    if (parents1[i] != parents2[i]){
    	
    	var newdistances1 = distances1.slice(i, distances1.length);
    	var dist1 = 0;
    	for (k in newdistances1) dist1 += parseFloat(newdistances1[k]);
    	var newdistances2 = distances2.slice(i, distances2.length);
    	var dist2 = 0;
    	for (k in newdistances2) dist2 += parseFloat(newdistances2[k]);

    	//console.log(parents1);
    	//console.log([parents1[i - 1], newdistances2 + newdistances1]);
    	//console.log(node1.id, node2.id);
    	return parseFloat(dist2 + dist1);
    }
  }
  var newdistances1 = distances1.slice(parents1.length-1, distances1.length);
  var dist1 = 0;
  for (x in newdistances1) dist1 += parseFloat(newdistances1[x]);
  var newdistances2 = distances2.slice(parents1.length-1, distances2.length);
  var dist2 = 0;
  for (x in newdistances2) dist2 += parseFloat(newdistances2[x]);
  return dist2 + dist1;
}

function constructArray(JSONnewick, callback){
	var first = true;
	var objectToOrder = {};
	JSONnewick.visit(function(node) {
		if(first == true){
			newickRoot = node;
			first = false;
		}

		if (node.data == '') node.data = 'TransitionNode' + String(node.id);
		//else nodeName = node.data;

		for(i in node.children){
			node.children[i].parent_id = node.id;
		}
		objectToOrder[node.data] = node;
		//arrayofnodes.push(node);
		objectofnodes[node.id] = node;

	});

	arrayofnodes = Object.keys(objectToOrder).map(function(k){ return objectToOrder[k]; });
	
	for(i in arrayofnodes){
		//console.log(arrayofnodes[i]);
		id_to_index[arrayofnodes[i].data] = i;
	}
	callback();
}

function getNewickDistances(graphObject){

	var selectedNodes = graphObject.selectedNodes;
	var metadata = graphObject.graphInput.metadata;
	var distanceMatrix = {};
	var NodesToConstructTable = [];
	var maxDistance = -1;

	status('Computing Distances...');
	$("#waitingGifMain").css({'display': 'block'});

	setTimeout(function(){
		constructDistances();
	}, 100);

	function constructDistances() {

		for(i=0; i<selectedNodes.length; i++){
			if(selectedNodes[i].id.indexOf('TransitionNode') > -1) continue;
			var iDistances = {};
			iDistances[selectedNodes[i].id] = 0;
			for (var j = 0; j<selectedNodes.length; j++){
				if(selectedNodes[i].id.indexOf('TransitionNode') > -1) continue;
				//console.log(selectedNodes[i].id);
				//console.log(arrayofnodes[id_to_index[selectedNodes[i].id]]);
				distance = commonAncestor(arrayofnodes[id_to_index[selectedNodes[i].id]], arrayofnodes[id_to_index[selectedNodes[j].id]]);
				if(selectedNodes[i].id != selectedNodes[j].id) iDistances[selectedNodes[j].id] = distance;
				if(distance > maxDistance) maxDistance = distance;
			}
			distanceMatrix[selectedNodes[i].id] = []
			distanceMatrix[selectedNodes[i].id].push(iDistances);
		}
		//console.log(distanceMatrix);

		for (i in selectedNodes) NodesToConstructTable.push(selectedNodes[i]);

		//constructDistanceTable(distanceMatrix);
		createDistanceTable(NodesToConstructTable, distanceMatrix, metadata, maxDistance, graphObject);


		var tutorialFunctions = tutorial('col_tutorial_main');
        tutorialFunctions.distances();

        $('#divdistances').append('<div></div>');

		$('.nav-tabs > li.active').removeClass('active');
	  	$('.tab-pane.active').removeClass('active');
	  	$('#distanceTab').addClass('active');
	  	$('#distanceContent').addClass('active');

		$("#waitingGifMain").css('display', 'none');
		status('');
	}

}

function checkLociDifferences(graphObject){

	var arrayOfNodes = graphObject.selectedNodes;
	var metadata = graphObject.graphInput.metadata;
	var distanceMatrix = {};
	var NodesToConstructTable = [];
	var maxDistance = -1;

	status('Computing Distances...');
	$("#waitingGifMain").css({'display': 'block'});

	setTimeout(function(){
		constructDistances();
	}, 100);

	function constructDistances() {

		for(i=0; i<arrayOfNodes.length; i++){
			var iDistances = {};
			for (j=0; j<arrayOfNodes.length; j++){
				distance = hammingPairwise(arrayOfNodes[i].data.profile, arrayOfNodes[j].data.profile);
				iDistances[arrayOfNodes[j].id] = distance;
				if(distance > maxDistance) maxDistance = distance;
			}
			distanceMatrix[arrayOfNodes[i].id] = []
			distanceMatrix[arrayOfNodes[i].id].push(iDistances);
		}


		for (i in arrayOfNodes) NodesToConstructTable.push(arrayOfNodes[i]);

		//constructDistanceTable(distanceMatrix);
		createDistanceTable(NodesToConstructTable, distanceMatrix, metadata, maxDistance, graphObject);


		var tutorialFunctions = tutorial('col_tutorial_main');
        tutorialFunctions.distances();

        $('#divdistances').append('<div></div>');

		$('.nav-tabs > li.active').removeClass('active');
	  	$('.tab-pane.active').removeClass('active');
	  	$('#distanceTab').addClass('active');
	  	$('#distanceContent').addClass('active');

		$("#waitingGifMain").css('display', 'none');
		status('');
	}

}

function constructDistanceTable(distanceMatrix){
	var table = {};
	table.headers = [];
	table.data = [];
	table.headers.push('IDs');
	
	for(i in distanceMatrix){
		table.headers.push(i);
		var rows = [];
		var addRowLabel = true;
		for(j in distanceMatrix[i][0]){
			if (addRowLabel){
				addRowLabel = false;
				rows.push(i);
			}
			rows.push(distanceMatrix[i][0][j]);
		}
		table.data.push(rows);
	} 

	constructTable(table, 'distances', function(){
		
	});

	$('.nav-tabs > li.active').removeClass('active');
  	$('.tab-pane.active').removeClass('active');
  	$('#distanceTab').addClass('active');
  	$('#distanceContent').addClass('active');

}

function changeColor(nodeUI, color){
	var newColors = [];
    for (i in nodeUI.colorIndexes){
      var colorsPerQuadrant = [];
      for (j in nodeUI.colorIndexes[i]) colorsPerQuadrant.push(color);
      newColors.push(colorsPerQuadrant);
    }
    nodeUI.colorIndexes = newColors;
}

function getLinks(node, graphObject){

	var nodesToCheckLinks = graphObject.nodesToCheckLinks;
	var graphics = graphObject.graphics;
	var graphGL = graphObject.graphGL;
	var toRemove = graphObject.toRemove;
	var renderer = graphObject.renderer;


	if (toRemove != ""){
		var nodeUI = graphics.getNodeUI(toRemove.id);
		changeColor(nodeUI, nodeUI.baseColor);

	}

	nodesToCheckLinks.push(node);

	var nodeUI = graphics.getNodeUI(node.id);

	changeColor(nodeUI, 0x333333);

	if (nodesToCheckLinks.length == 2){
		var link = graphGL.getLink(nodesToCheckLinks[0].id, nodesToCheckLinks[1].id);
		if (link == null) var link = graphGL.getLink(nodesToCheckLinks[1].id, nodesToCheckLinks[0].id);
		if (link != null) showInfoLinks(link);
		toRemove = nodesToCheckLinks.shift();
	}

	graphObject.nodesToCheckLinks = nodesToCheckLinks;
	graphObject.toRemove = toRemove;

	if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 5);
      }

}

function restoreLinkSearch(graphObject){

	var toRemove = graphObject.toRemove;
	var graphics = graphObject.graphics;
	var nodesToCheckLinks = graphObject.nodesToCheckLinks;
	var renderer = graphObject.renderer;

	if (toRemove != ""){
		var nodeUI = graphics.getNodeUI(toRemove.id);
		nodeUI.colorIndexes = nodeUI.backupColor;

	}
	for (i in nodesToCheckLinks){
		var nodeUI = graphics.getNodeUI(nodesToCheckLinks[i].id);
		nodeUI.colorIndexes = nodeUI.backupColor; 
	}

	if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 5);
      }
}

function exportSelectedDataTree(graphObject){

	var selectedNodes = graphObject.selectedNodes;

	if (selectedNodes.length < 1){
		alert("first you need to select some nodes");
		return false;
	}

	var stringToIsolates = "";
	var stringToProfiles = "";
	var stringToFasta = "";

	if(graphObject.graphInput.data_type == 'newick'){
		stringToIsolates += graphObject.graphInput.metadata.join('\t') + '\n';
		stringToProfiles += 'id\n';
	}
	else{
		stringToIsolates += graphObject.graphInput.metadata.join('\t') + '\n';
		stringToProfiles += graphObject.graphInput.schemeGenes.join('\t') + '\n';
	}

	for (i in selectedNodes){
		var data = selectedNodes[i].data;
		for (j in data.isolates) stringToIsolates += data.isolates[j].join('\t') + '\n';
		if(graphObject.graphInput.data_type != 'newick') stringToProfiles += selectedNodes[i].data.key + '\t' + data.profile.join('\t') + '\n';
		else stringToProfiles += selectedNodes[i].data.key + '\n';

		if(graphObject.graphInput.data_type == 'fasta'){ 
			stringToFasta += '>' + selectedNodes[i].data.key + '\n' + selectedNodes[i].data.sequence + '\n';
		}

	}

	var encodedUriIsolates = 'data:text/csv;charset=utf-8,' + encodeURIComponent(stringToIsolates);
	var encodedUriProfiles = 'data:text/csv;charset=utf-8,' + encodeURIComponent(stringToProfiles);
	var encodedUriFasta = 'data:text/csv;charset=utf-8,' + encodeURIComponent(stringToFasta);

	var toDownload = '';
	if(graphObject.graphInput.metadata.length != 0) toDownload += '<p>Download <a id="linkDownloadIsolateSelectedData">isolate data</a></p>';
	
	if (graphObject.graphInput.data_type == 'newick') toDownload += '<p>Download <a id="linkDownloadProfileSelectedData">node identifiers</a></p>';
	else if (graphObject.graphInput.data_type == 'fasta') toDownload += '<p>Download <a id="linkDownloadFastaSelectedData">sequences (.fasta)</a></p>';
	else toDownload += '<p>Download <a id="linkDownloadProfileSelectedData">profile data</a></p>';

	$('#dialog').empty();

	var a = $(toDownload);

	$('#dialog').append(a);
	$('#linkDownloadIsolateSelectedData').attr("href", encodedUriIsolates).attr('download', "phyloviz_isolateData.tab");
	$('#linkDownloadProfileSelectedData').attr("href", encodedUriProfiles).attr('download', "phyloviz_profileData.tab");
	$('#linkDownloadFastaSelectedData').attr("href", encodedUriFasta).attr('download', "phyloviz_sequenceData.fasta");
	$('#dialog').dialog();
	//window.open(encodedUriIsolates);

}


function exportSelectedDataMatrix(graphObject, selectedNodes, stored){

	if (stored.length < 1){
		alert("first you need to select some nodes from the matrix");
		return false;
	}

	var stringToIsolates = "";
	var stringToProfiles = "";

	stringToIsolates += graphObject.graphInput.metadata.join('\t') + '\n';
	stringToProfiles += graphObject.graphInput.schemeGenes.join('\t') + '\n';

	var alreadyExported = [];

	var toCheck = ["source_node", "target_node"];

	for (i in stored){
		for (j in toCheck){
			if ($.inArray(stored[i][toCheck[j]].id, alreadyExported) < 0){
				var dataToCheck = stored[i][toCheck[j]];
				for (k in dataToCheck.data.isolates){
					stringToIsolates += dataToCheck.data.isolates[k].join('\t') + '\n';
				} 
				stringToProfiles += dataToCheck.data.key + '\t' + dataToCheck.data.profile.join('\t') + '\n';
				alreadyExported.push(stored[i][toCheck[j]].id);
			}
		}
	}

	var encodedUriIsolates = 'data:text/csv;charset=utf-8,' + encodeURIComponent(stringToIsolates);
	var encodedUriProfiles = 'data:text/csv;charset=utf-8,' + encodeURIComponent(stringToProfiles);

	$('#dialog').empty();

	var a = $('<p>Download <a id="linkDownloadIsolateSelectedData">isolate data</a></p><p>Download <a id="linkDownloadProfileSelectedData">profile data</a></p>');

	$('#dialog').append(a);
	$('#linkDownloadIsolateSelectedData').attr("href", encodedUriIsolates).attr('download', "isolateData.tab");
	$('#linkDownloadProfileSelectedData').attr("href", encodedUriProfiles).attr('download', "profileData.tab");
	$('#dialog').dialog();

}

function exportMatrix(graphObject){
	var matrixToUse = graphObject.currentdistanceMatrix;
	var selectedNodes = graphObject.selectedNodes;

	var stringToMatrix = "";
	firstLine = true;

	for (i in selectedNodes){
		if(firstLine == true){
			for (k in selectedNodes){
				stringToMatrix += selectedNodes[k].id + '\t';
			}
			stringToMatrix = stringToMatrix.substring(0, stringToMatrix.length-1) + '\n';
			firstLine = false;
		}
	    stringToMatrix += selectedNodes[i].id;
	    for (j in selectedNodes){
	      stringToMatrix += '\t' + matrixToUse[selectedNodes[i].id][0][selectedNodes[j].id];
	    }
	    stringToMatrix += '\n';
	}
	//console.log(stringToMatrix);


	var encodedUriMatrix = 'data:text/csv;charset=utf-8,' + encodeURIComponent(stringToMatrix);
	//var encodedUriMatrix = encodedUriMatrix.replace(/!!!/g, "#");

	var a = $('<p>Download <a id="linkDownloadMatrix">Distance Matrix</a></p>');

	$('#dialog').empty();
	$('#dialog').append(a);
	$('#linkDownloadMatrix').attr("href", encodedUriMatrix).attr('download', "distanceMatrix.tab");
	$('#dialog').dialog();
}













