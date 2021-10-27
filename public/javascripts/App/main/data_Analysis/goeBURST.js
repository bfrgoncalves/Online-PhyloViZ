
function client_goeburst(datasetID, callback){

	loadProfiles(datasetID, function(results){

		datasetID = results.datasetID;
		results=results;
		
		goeBURST(results.profileArray, results.identifiers, function(links){
				saveLinks(datasetID, links, function(data){
					callback({datasetID: datasetID, links: links, dupProfiles: results.dupProfiles, dupIDs: results.dupIDs});
				});
			

		});
	});
}



function loadProfiles(datasetID, callback){

	var profiles;
	var identifiers = {};
	var countProfiles = 0;
	var profileArray = [];
	var datasetID;


	$.ajax({
      url: '/api/db/postgres/find/profiles/all',
      data: {dataset_id: datasetID},
      type: 'GET',
      success: function(data1){
      	$.ajax({
	      url: '/api/db/postgres/find/datasets/all',
	      data: {dataset_id: datasetID},
	      type: 'GET',
	      success: function(data2){
	      	arrangeProfiles(data1.userdatasets[0], data2.userdatasets[0].data_type, function(results){
	      		callback(results);
	      	});
	      }
	  	});
      }

  	});

  	function arrangeProfiles(data, data_type, callback){

	    var data_type = data_type;
	    var profiles = data.data.profiles;
	    var schemeGenes = data.schemegenes;

		
		var existsProfile = {};
		var dupProfiles = [];
		var dupIDs = [];
		var existsIdentifiers = {}
		
		profiles.forEach(function(profile){

			if(data_type == 'fasta') var profile = profile.profile;
			
			var arr = [];
			for (i in schemeGenes) arr.push(profile[schemeGenes[i]]);
			//var arr = Object.keys(profile).map(function(k) { return profile[k] });
			var identifier = arr.shift();
			//arr.reverse();
			
			if(existsProfile[String(arr)]) {
				dupProfiles.push([identifier, String(arr)]);
				console.log('Profile already exists');
				//console.log(identifier);
			}
			else if(existsIdentifiers[identifier]){
				dupIDs.push(identifier);
				console.log('Duplicate ID');
			}
			
			else{
				existsProfile[String(arr)] = true;
				identifiers[countProfiles] = identifier;
				existsIdentifiers[identifier] = true;
				countProfiles += 1; 
				profileArray.push(arr);

			}
		});
		results_array = {profileArray:profileArray, identifiers:identifiers, datasetID:datasetID, dupProfiles:dupProfiles, dupIDs:dupIDs}
		console.log(results_array);
		callback(results_array);
	}

}


function hamming(p, q) {
  var res = 0;
  for (var i = 0; i < p.length; i++)
    if (p[i] != q[i])
      res = res + 1;
  return res;
}


function goeBURST(profiles, identifiers, callback) {

  var lvs = profiles.map(function(x){
    return x.map(function(x){return 0;});
  });
 
  var pi = [];
  var color =[];
  var hammingValues= {};
  var count = 0;

  //var distanceMatrix = [];

  //profiles.map(function(x){
  //  return profiles.map(function(y){return 0;});
  //});

  for (var i = 0; i < profiles.length; i++)
    color[i] = 0;

  for (var i = 0; i < profiles.length-1; i++) {
    //distanceMatrix.push([0]);
    for (var j = i+1; j < profiles.length; j++) {
      var diff = hamming(profiles[i], profiles[j]) - 1;
      //distanceMatrix[i].push(diff);
      lvs[i][diff] ++;
      lvs[j][diff] ++;
    }
  }

  tree = [];
  var pqueue = new Heap(function(a, b) {
    return edgecmp(pi[a], pi[b]);
  });
  pqueue.push(0);
  color[0] = 1;

  while (! pqueue.empty()) {
    var u = pqueue.pop();
    color[u] = 2;
    if (u != 0){
    	count++;
      console.log('Link: ' + String(count));
      tree.push({source: identifiers[pi[u][0]], target: identifiers[pi[u][1]], value: hamming(profiles[pi[u][0]], profiles[pi[u][1]])});
    }

    for (var v = 0; v < profiles.length; v++) {

      if (color[v] == 0) {
        color[v] = 1;
        pi[v] = [u,v];
        pqueue.push(v);
      } else if (color[v] == 1 && edgecmp([u,v], pi[v]) < 0) {
        pi[v] = [u,v];
        pqueue.updateItem(v);
      }
    }
  }

  function edgecmp(e, f) {
  	
    var elevel = hamming(profiles[e[0]], profiles[e[1]]);
    var flevel = hamming(profiles[f[0]], profiles[f[1]]);
    var n = lvs[e[0]].length;

    if (elevel != flevel)
      return elevel - flevel;

    for (var l = 0; l < n; l++) {
      maxe = Math.max(lvs[e[0]][l], lvs[e[1]][l]);
      maxf = Math.max(lvs[f[0]][l], lvs[f[1]][l]);

      if (maxe != maxf)
        return maxf - maxe;

      mine = Math.min(lvs[e[0]][l], lvs[e[1]][l]);
      minf = Math.min(lvs[f[0]][l], lvs[f[1]][l]);

      if (mine != minf)
        return minf - mine;
    }

    maxe = Math.max(e[0], e[1]);
    maxf = Math.max(f[0], f[1]);

    if (maxe != maxf)
      return maxe - maxf;

    mine = Math.min(e[0], e[1]);
    minf = Math.min(f[0], f[1]);

    return minf - mine;
  }
  callback(tree);
}



function saveLinks(datasetID, links, callback){


	$.ajax({
	  type: 'POST',
      url: '/api/algorithms/goeBURST/save',
      data: JSON.stringify({ links: links, dataset_id: datasetID }),
      contentType: "application/json",
      dataType: "json",
      success: function(data){
      	callback(data);
      }

  	});

}