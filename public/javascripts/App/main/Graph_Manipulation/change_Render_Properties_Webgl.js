
//adjust Node Size
function NodeSize(newSize, renderer, graph, graphics){
    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);
        nodeUI.size = newSize;
    });
}


function linkThickness(newSize, renderer, graph, graphics){

	graph.links.forEach(function(link){
	        var linkUI = graphics.getLinkUI();
	        // nodeUI.size = newSize;
	    })

}