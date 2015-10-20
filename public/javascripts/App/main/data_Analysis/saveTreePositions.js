function saveTreePositions(graph, layout, datasetID){
	
	var Positions = {};
	var nodePositions = {};
	var linkPositions = {};

	graph.forEachNode(function(node){
		var position = layout.getNodePosition(node.id);
		nodePositions[node.id] = [{ x : position.x, y : position.y}];
	});


	Positions.nodes = [nodePositions];

	$.ajax({
      url: '/api/db/postgres/update/positions/data',
      type: 'PUT',
      data: {
      		dataset_id: datasetID,
      		change: JSON.stringify(Positions),
      	},
      dataType: "json",
      success: function(data){
        console.log('done');
      }

    });
}