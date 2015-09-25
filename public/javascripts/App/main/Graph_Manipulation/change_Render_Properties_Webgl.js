
//adjust Node Size
function NodeSize(newSize, renderer, graph, graphics){
    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);
        nodeUI.size = newSize;
    });
}

//adjust Node Size
function LabelSize(newSize, graph, domLabels, graphics){
    graph.nodes.forEach(function(node){
        var labelStyle = domLabels[node.key].style;
        labelStyle.fontSize = String(newSize) + 'px';
    });
}


function linkThickness(newSize, renderer, graph, graphics){

	graph.links.forEach(function(link){
	        var linkUI = graphics.getLinkUI();
	        // nodeUI.size = newSize;
	    })

}