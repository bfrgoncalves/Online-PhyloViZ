function loopGraph(allGraph, graphGL, graph){

	var addedNodes = {}; 
	timeout = 0;
	allGraph.forEachNode(function(node){
		timeout+=20;
		setTimeout(function(){
			graphGL.beginUpdate();
			if (!addedNodes.hasOwnProperty(node.data.idGL)){
				graphGL.addNode(graph.nodes[node.data.idGL].key, graph.nodes[node.data.idGL]);
				addedNodes[node.data.idGL] = true;
			}
			allGraph.forEachLinkedNode(node.id, function(linkedNode, link) { 
	        	if (!addedNodes.hasOwnProperty(linkedNode.data.idGL)){
					graphGL.addNode(graph.nodes[linkedNode.data.idGL].key, graph.nodes[linkedNode.data.idGL]);
					addedNodes[linkedNode.data.idGL] = true;
				}
	        	graphGL.addLink(link.fromId, link.toId, link.data);


        	});
	        graphGL.endUpdate();
	    }, timeout);
    });

}