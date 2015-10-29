function SelectNodes(selectedNodesArray, node, graphics){
	selectedNodesArray.push(node);

	var nodeUI = graphics.getNodeUI(node.id);

	var newColors = [];
    for (i in nodeUI.colorIndexes){
      var colorsPerQuadrant = [];
      for (j in nodeUI.colorIndexes[i]) colorsPerQuadrant.push(0xFFA500ff);
      newColors.push(colorsPerQuadrant);
    }
    nodeUI.colorIndexes = newColors;
    nodeUI.size = 30;


	return selectedNodesArray;
}


function hamming(p, q) {
  var res = 0;
  for (var i = 0; i < p.length; i++)
    if (p[i] != q[i])
      res = res + 1;
  return res;
}

function checkLociDifferences(arrayOfNodes){
	var distanceMatrix = {};

	for(i=0; i<arrayOfNodes.length; i++){
		var iDistances = {};
		for (j=0; j<arrayOfNodes.length; j++){
			iDistances[arrayOfNodes[j].id] = hamming(arrayOfNodes[i].data.profile, arrayOfNodes[j].data.profile);
		}
		distanceMatrix[arrayOfNodes[i].id] = []
		distanceMatrix[arrayOfNodes[i].id].push(iDistances);
	}

	constructDistanceTable(distanceMatrix);

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
    nodeUI.size = 30;
}

function getLinks(nodesToCheckLinks, node, graphics, graphGL, toRemove){

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

	return nodesToCheckLinks, toRemove;

}

function restoreLinkSearch(nodesToCheckLinks, graphics, toRemove){
	if (toRemove != ""){
		var nodeUI = graphics.getNodeUI(toRemove.id);
		changeColor(nodeUI, nodeUI.baseColor);

	}
	for (i in nodesToCheckLinks){
		var nodeUI = graphics.getNodeUI(nodesToCheckLinks[i].id);
		changeColor(nodeUI, nodeUI.baseColor);
	}
}