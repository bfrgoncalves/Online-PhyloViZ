function saveTreePositions(graph, layout, datasetName){
	
	var Positions = {};
	var nodePositions = {};
	var linkPositions = {};

	graph.forEachNode(function(node){
		var position = layout.getNodePosition(node.id);
		nodePositions[node.id] = [{ x : position.x, y : position.y}];
	});

	// graph.forEachLink(function(link){
	// 	var linkPosition = layout.getLinkPosition(link.id);
	// 	linkPositions[link.id] = [linkPosition];
	// 	// var position = layout.getNodePosition(node.id);
	// 	// nodePositions[node.id] = [{ x : position.x, y : position.y}];
	// });

	Positions.nodes = [nodePositions];
	// Positions.links = [linkPositions];

	console.log(Object.keys(Positions.nodes[0]).length);

	if (Object.keys(Positions.nodes[0]).length > 700){
		alert('Until know is just possible to save positions of datasets with up to 700 nodes.');
	}
	else{

		$.ajax({
	      url: '/api/db/datasets/update',
	      type: 'POST',
	      data: {
	      		datasetName: datasetName,
	      		Positions: JSON.stringify(Positions),
	      	},
	      dataType: "json",
	      success: function(data){
	        console.log('done');
	      }

	    });
	}
}