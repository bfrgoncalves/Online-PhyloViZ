
//adjust Node Size
function NodeSize(newSize, renderer, graph, graphics){
    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);
        nodeUI.size = newSize;
    })

    graph.links.forEach(function(link){
    	console.log(link);
        var nodeUI = graphics.getLinkUI();
        console.log(nodeUI);
        // nodeUI.size = newSize;
    })
}