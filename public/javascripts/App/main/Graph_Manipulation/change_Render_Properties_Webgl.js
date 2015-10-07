
//adjust Node Size
function NodeSize(newSize, renderer, graph, graphics){
    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);
        nodeUI.size = newSize;
    });
}

//adjust Node Size
function LabelSize(newSize, graph, domLabels, graphics, type){

    if (type == 'node'){
        graph.nodes.forEach(function(node){
            var labelStyle = domLabels[node.key].style;
            labelStyle.fontSize = String(newSize) + 'px';
        });
    }
    else if (type == 'link'){
        var countLinks = 0;  
        graph.links.forEach(function(link){
            var labelStyle = domLabels[countLinks].style;
            labelStyle.fontSize = String(newSize) + 'px';
            countLinks += 1;
        });
    }
    
    
}


function linkThickness(newSize, renderer, graph, graphics){

	graph.links.forEach(function(link){
	        var linkUI = graphics.getLinkUI();
	    })

}