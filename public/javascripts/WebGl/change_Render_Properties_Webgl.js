
//adjust Node Size
function NodeSize(newSize, renderer, graph, graphics){
    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);
        nodeUI.size = newSize;
    })

    graph.links.forEach(function(link){
        var nodeUI = graphics.getLinkUI();
        // nodeUI.size = newSize;
    })
}