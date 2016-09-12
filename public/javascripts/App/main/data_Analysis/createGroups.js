
function createGroups(graphObject, distance){
	
	var graph = graphObject.graphInput;
	var graphGL = graphObject.graphGL;

	for (i in graph.links){

		//console.log(graph.links[i]);
		if (graph.links[i].value <= distance){
			var sourceNode = graphGL.getNode(graph.links[i].source);
			var targetNode = graphGL.getNode(graph.links[i].target);

			console.log(sourceNode, targetNode);

			if(sourceNode !=undefined && targetNode !=undefined){
				console.log(sourceNode.data.isolates);
				sourceNode.data.isolates = sourceNode.data.isolates.concat(targetNode.data.isolates);
				console.log(sourceNode.data.isolates);
				console.log(sourceNode.key);

				var nodeUI = graphObject.graphics.getNodeUI(sourceNode.data.key);
				nodeUI.size = sourceNode.data.isolates.length;

				//graphGL.removeNode(graph.links[i].source);
				graphGL.removeNode(graph.links[i].target);
				graphGL.forEachLinkedNode(graph.links[i].target, function(linkedNode, link){
				  graphGL.removeLink(link); 
				});
			}

			//graphGL.addNode(sourceNode.data.key, sourceNode.data);

			//console.log(sourceNode.data);
		}
    }
}