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
	else if(nodeUI.colorIndexes[0][0] == 0xFFA500ff){

		var newSelected = [];
		for(i in graphObject.selectedNodes){
			if(graphObject.selectedNodes[i].id != node.id) newSelected.push(graphObject.selectedNodes[i]); 
		}
		graphObject.selectedNodes = newSelected;
		
		nodeUI.colorIndexes = nodeUI.backupColor;

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

			var profileGroup = [];

			if(graphObject.hasOwnProperty('indexesToRemove')){
				if(Object.keys(graphObject.indexesToRemove).length > 0){
					profileGroup = graphObject.subsetProfiles;
				}
				else profileGroup = graphObject.nodes;
			}
			else profileGroup = graphObject.nodes;

			for (var i = 0; i < profileGroup.length-1; i++) {
				distanceMatrix.push([0]);
		    	for (var j = i+1; j < profileGroup.length; j++) {

			      var diff = hamming(profileGroup[i].profile, profileGroup[j].profile) - 1;
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
				if(graphObject.graphInput.hasOwnProperty('indexesToRemove')){
					distance = hamming(graphObject.graphInput.subsetProfiles[arrayOfNodes[i].data.idGL].profile, graphObject.graphInput.subsetProfiles[arrayOfNodes[j].data.idGL].profile);
				}
				else distance = hamming(arrayOfNodes[i].data.profile, arrayOfNodes[j].data.profile);
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
		var toDialog = '<div style="text-align: center;"><label>Select some nodes to export their data.</label></div>';

    	$('#dialog').empty();
		$('#dialog').append(toDialog);
		$('#dialog').dialog({
	              height: $(window).height() * 0.15,
	              width: $(window).width() * 0.2,
	              modal: true,
	              resizable: true,
	              dialogClass: 'no-close success-dialog'
	          });

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

function selectedDataToString(graphObject){

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

	return [stringToIsolates, stringToProfiles];

}

function createSubset(toFiles, name, description, missings, missingsChar, analysis_method, callback){

	$('#dialog').dialog('close');

	status('Creating Subset...');
	$("#waitingGifMain").css({'display': 'block'});

	$.ajax({
      url: '/api/utils/phylovizsubset',
      data: {auxData: toFiles[0], profileData: toFiles[1], name: name, description: description, missings: missings, missingschar: missingsChar, analysis_method: analysis_method},
      type: 'POST',
      success: function(data){
  
      	status();
		$("#waitingGifMain").css({'display': 'none'});
      	
      	if(data.status == 200){
      		var code = data.stdout.split('code:')[1].split('\n')[0];

      		var datasetL = data.stdout.split('message:')[1].split('\n')[0];
  			var toDialog = '<div style="text-align: center;"><label>'+datasetL+'</label></div>';

			if (code == 'queue'){
				var toDialog = '<div style="text-align: center;"><label>'+datasetL+'</label>'+
								'<div style="width:100%;height:100%;"><br><img id="subsetLoading" class="waitingImage"></img></div></div>';


				var jobid = data.stdout.split('jobid:')[1].split('\n')[0];
				var datasetID = data.stdout.split('datasetID:')[1].split('\n')[0];
				var checkI = setInterval(function(){ 
					checkgoeBURSTstatus(jobid, function(status){
			            if(status == 'complete'){
			            	var win = window.open(datasetID, '_blank');
  							win.focus();
  							clearInterval(checkI);
			            }
			          }) 
			        }, 30000);


  			}

  			$('#dialog').empty();
			$('#dialog').append(toDialog);
			$('#dialog').dialog({
		              height: $(window).height() * 0.40,
		              width: $(window).width() * 0.40,
		              modal: true,
		              resizable: true,
		              dialogClass: 'no-close success-dialog'
		          });

			$('#subsetLoading').attr("src", '/images/waitingGIF.gif');
			$('#subsetLoading').css({'display':'block', 'width':'10%', 'margin-left': 'auto', 'margin-right': 'auto'});

  			/*
      		var win = window.open(datasetL, '_blank');
  			win.focus();
  			setTimeout(function(){
  				win.document.getElementById('parentDataset').innerHTML = '<a href="'+window.location.href+'">Link</a>';
  				win.document.getElementById('i_parent_dataset').style.display = 'block';
  				callback(data);
  			}, 1000);
			*/


      	}
      	else if(data.status == 401){
      		data.error = data.stdout;
      		console.log(data);
      		callback(data);
      	}
      	else console.log(data);
      }

    });
}

function checkgoeBURSTstatus(jobID, callback){

  $.ajax({
    url: '/api/algorithms/goeBURST/status',
    data: $.param({jobid: jobID}),
    processData: false,
    contentType: false,
    type: 'GET',
    success: function(data){
      callback(data.status);
    }

  });

}

function create_subset_profile(graph, callback){

	var newProfiles = [];
    var newProfile = [];
    var indexToRemove = {};
    var exportAllProfileObject = {};
    var sameProfileHas = {};
    var sameNodeHas = {};

    var newNodes = [];
    
    var usedLoci = {};

    if(!graph.hasOwnProperty('indexesToRemove')) return callback(graph);

	var nodes = graph.nodes;
	var links = graph.links;
	
	for(i in nodes){
		profile = nodes[i].profile;

		var newProfile = [];
		var countPosition = -1;

		exportAllProfileObject[nodes[i].key] = [];

		for(position in profile){
			countPosition++;
			if(!graph.indexesToRemove.hasOwnProperty(countPosition)){
				usedLoci[graph.schemeGenes[countPosition+1]] = countPosition;
				newProfile.push(profile[position]);
				exportAllProfileObject[nodes[i].key].push({gene: graph.schemeGenes[countPosition+1], value:profile[position]});
			}
		}
		if(!sameProfileHas[String(newProfile)]){
			if(newNodes.length == 0) nodeIndex = 0;
			else nodeIndex = newNodes.length - 1
			sameProfileHas[String(newProfile)] = [nodes[i].key, nodeIndex];
			sameNodeHas[nodes[i].key] = nodes[i].key;
			newNodes.push(nodes[i]);
			newProfiles.push({profile: newProfile});
		}
		else{
			sameNodeHas[nodes[i].key] = sameProfileHas[String(newProfile)][0];
			newNodes[sameProfileHas[String(newProfile)][1]].isolates = newNodes[sameProfileHas[String(newProfile)][1]].isolates.concat(nodes[i].isolates);
		}
	}

	for(j in links){
		links[j].source = sameNodeHas[links[j].source];
		links[j].target = sameNodeHas[links[j].target];
	}
	graph.links = links;
	graph.nodes = newNodes;
	graph.sameProfileHas = sameProfileHas;
	graph.sameNodeHas = sameNodeHas;
	graph.subsetProfiles = newProfiles;
	graph.usedLoci = usedLoci;
	graph.goeBURSTprofileExport = exportAllProfileObject;
	callback(graph);

}

function get_exclusive_loci(graphObject, callback){

	var exclusive = [];
	var its_exclusive = true;
	var sel_positions = [];

	for(var i=0; i < graphObject.graphInput.schemeGenes.length - 1; i++){ //First index is the header

		sel_positions = [];

		for(j in graphObject.selectedNodes){
			sel_positions.push(graphObject.selectedNodes[j].data.idGL);
			var profile = graphObject.selectedNodes[j].data.profile;
			if(profile[i] != '0') its_exclusive = true;
			else {
				its_exclusive = false;
				break
			}
		}
		if (its_exclusive){
			for(j in graphObject.graphInput.nodes){

				if(!sel_positions.includes(parseInt(j))){
					var profile = graphObject.graphInput.nodes[j].profile;
					if(profile[i] == '0') its_exclusive = true;
					else {
						its_exclusive = false;
						break
					}
				}
			}
			if(its_exclusive){
				exclusive.push({'position': i+1, 'locus': graphObject.graphInput.schemeGenes[i+1]});
			}
		}

	}
	graphObject.exclusive_loci = exclusive;
	callback();

}

function exportgoeBURSTprofiles(graphObject){

	var toFile = '';
	var firstLine = true;

	for(i in graphObject.graphInput.goeBURSTprofileExport){
		var profileData = graphObject.graphInput.goeBURSTprofileExport[i];
		if(firstLine){
			toFile += graphObject.graphInput.key[0];
			for(j in profileData){
				toFile += '\t' + profileData[j].gene;
			}
			toFile += '\n';
			firstLine = false
		}
		toFile += i;
		for(j in profileData){
			toFile += '\t' + profileData[j].value;
		}
		toFile += '\n';
	}

	var encodedUriProfiles = 'data:text/csv;charset=utf-8,' + encodeURIComponent(toFile);

	$('#dialog').empty();

	var a = $('<p>Download <a id="linkDownloadgoeBURSTData">goeBURST Profiles</a></p>');

	$('#dialog').append(a);
	$('#linkDownloadgoeBURSTData').attr("href", encodedUriProfiles).attr('download', "goeBURSTprofileData.tab");
	$('#dialog').dialog();


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

function write_exclusive_file(graphObject){

	var ToFile = '';
	firstLine = true;

	for(i in graphObject.exclusive_loci){
		if(firstLine){
			ToFile += 'Position\tLocus\n';
			firstLine = false;
		}
		ToFile += graphObject.exclusive_loci[i].position + '\t' + graphObject.exclusive_loci[i].locus + '\n';
	}

	var encodedUriExclusive = 'data:text/csv;charset=utf-8,' + encodeURIComponent(ToFile);

	var a = $('<div style="width:100%;text-align:center;"><label>There are '+String(graphObject.exclusive_loci.length)+' Exclusive Loci.</label><p>Download exclusive loci file <a id="linkDownloadExclusive">here</a>.</p></div>');
	$('#dialog').empty();
	$('#dialog').append(a);
	$('#linkDownloadExclusive').attr("href", encodedUriExclusive).attr('download', "exclusive_loci.tab");
	$('#dialog').dialog({
      height: $(window).height() * 0.20,
      width: $(window).width() * 0.40,
      modal: true,
      resizable: true,
      dialogClass: 'no-close success-dialog'
  });

}

function saveDistanceMatrixImage(graphObject){

	var divdistance = document.getElementById('divsvg');
    var divlegend = document.getElementById('divsvgLegend');
    var newWin=window.open('','Print-Window','width=21cm','height=29.7cm');

	if (newWin == null || typeof(newWin)=='undefined')
		alert("Please disable your pop-up blocker.\n\nTo save the image, a new window must be created.");

    newWin.document.open();
	newWin.document.write('<html><body style="width:100%;height:100%;"><div style="width:100%;">'+divdistance.innerHTML+'</div><br></br><div style="width:100%;height:100%;">'+divlegend.innerHTML.replace('id="grouplegendsvg" width="23.333333333333332" height="20.58823529411765"', 'id="grouplegendsvg" width="100%" height="100%"')+'</div></body></html>');

	setTimeout(function(){ 
	    newWin.window.print();
	    newWin.close();}, 100);
	  //newWin.document.getElementById('canvas').remove();


}













