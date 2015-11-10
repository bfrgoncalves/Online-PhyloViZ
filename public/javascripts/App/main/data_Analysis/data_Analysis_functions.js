function SelectNodes(node, graphObject){

	var graphics = graphObject.graphics;

	graphObject.selectedNodes.push(node);

	var nodeUI = graphics.getNodeUI(node.id);

	var newColors = [];
    for (i in nodeUI.colorIndexes){
      var colorsPerQuadrant = [];
      for (j in nodeUI.colorIndexes[i]) colorsPerQuadrant.push(0xFFA500ff);
      newColors.push(colorsPerQuadrant);
    }
    nodeUI.colorIndexes = newColors;

}


function hamming(p, q) {
  var res = 0;
  for (var i = 0; i < p.length; i++)
    if (p[i] != q[i])
      res = res + 1;
  return res;
}

function checkLociDifferences(arrayOfNodes, metadata){
	var distanceMatrix = {};
	var NodesToConstructTable = [];
	var maxDistance = -1;

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
	createDistanceTable(NodesToConstructTable, distanceMatrix, metadata, maxDistance);

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

}

function restoreLinkSearch(graphObject){

	var toRemove = graphObject.toRemove;
	var graphics = graphObject.graphics;
	var nodesToCheckLinks = graphObject.nodesToCheckLinks;

	if (toRemove != ""){
		var nodeUI = graphics.getNodeUI(toRemove.id);
		nodeUI.colorIndexes = nodeUI.backupColor;

	}
	for (i in nodesToCheckLinks){
		var nodeUI = graphics.getNodeUI(nodesToCheckLinks[i].id);
		nodeUI.colorIndexes = nodeUI.backupColor; 
	}
}