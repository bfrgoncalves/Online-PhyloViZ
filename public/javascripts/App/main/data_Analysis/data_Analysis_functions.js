function SelectNodes(node, graphObject){

	var graphics = graphObject.graphics;
	var renderer = graphObject.renderer;

	graphObject.selectedNodes.push(node);

	var nodeUI = graphics.getNodeUI(node.id);

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


function hamming(p, q) {
  var res = 0;
  for (var i = 0; i < p.length; i++)
    if (p[i] != q[i])
      res = res + 1;
  return res;
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
				distance = hamming(arrayOfNodes[i].data.profile, arrayOfNodes[j].data.profile);
				iDistances[arrayOfNodes[j].id] = distance;
				if(distance > maxDistance) maxDistance = distance;
			}
			distanceMatrix[arrayOfNodes[i].id] = []
			distanceMatrix[arrayOfNodes[i].id].push(iDistances);
		}


		for (i in arrayOfNodes) NodesToConstructTable.push(arrayOfNodes[i]);

		constructDistanceTable(distanceMatrix);
		createDistanceTable(NodesToConstructTable, distanceMatrix, metadata, maxDistance, graphObject);

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

	var stringToIsolates = "data:text/csv;charset=utf-8,";
	var stringToProfiles = "data:text/csv;charset=utf-8,";


	stringToIsolates += graphObject.graphInput.metadata.join('\t') + '\n';
	stringToProfiles += graphObject.graphInput.schemeGenes.join('\t') + '\n';

	for (i in selectedNodes){
		var data = selectedNodes[i].data;
		for (j in data.isolates) stringToIsolates += data.isolates[j].join('\t') + '\n';
		stringToProfiles += selectedNodes[i].data.key + '\t' + data.profile.join('\t') + '\n';
	}

	var encodedUriIsolates = encodeURI(stringToIsolates);
	var encodedUriProfiles = encodeURI(stringToProfiles);

	$('#dialog').empty();

	var a = $('<p>Download <a id="linkDownloadIsolateSelectedData">isolate data</a></p><p>Download <a id="linkDownloadProfileSelectedData">profile data</a></p>');

	$('#dialog').append(a);
	$('#linkDownloadIsolateSelectedData').attr("href", encodedUriIsolates).attr('download', "isolateData.tab");
	$('#linkDownloadProfileSelectedData').attr("href", encodedUriProfiles).attr('download', "profileData.tab");
	$('#dialog').dialog();
	//window.open(encodedUriIsolates);

}


function exportSelectedDataMatrix(graphObject, selectedNodes, stored){

	if (stored.length < 1){
		alert("first you need to select some nodes from the matrix");
		return false;
	}

	var stringToIsolates = "data:text/csv;charset=utf-8,";
	var stringToProfiles = "data:text/csv;charset=utf-8,";

	stringToIsolates += graphObject.graphInput.metadata.join('\t') + '\n';
	stringToProfiles += graphObject.graphInput.schemeGenes.join('\t') + '\n';

	for (i in stored){
		var index = stored[i].y;
		var data = selectedNodes[index].data;
		for (j in data.isolates) stringToIsolates += data.isolates[j].join('\t') + '\n';
		stringToProfiles += selectedNodes[index].data.key + '\t' + data.profile.join('\t') + '\n';
	}

	var encodedUriIsolates = encodeURI(stringToIsolates);
	var encodedUriProfiles = encodeURI(stringToProfiles);

	$('#dialog').empty();

	var a = $('<p>Download <a id="linkDownloadIsolateSelectedData">isolate data</a></p><p>Download <a id="linkDownloadProfileSelectedData">profile data</a></p>');

	$('#dialog').append(a);
	$('#linkDownloadIsolateSelectedData').attr("href", encodedUriIsolates).attr('download', "isolateData.tab");
	$('#linkDownloadProfileSelectedData').attr("href", encodedUriProfiles).attr('download', "profileData.tab");
	$('#dialog').dialog();

}











