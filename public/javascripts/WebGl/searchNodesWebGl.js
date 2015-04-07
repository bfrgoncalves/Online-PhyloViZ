var optArray = [];

var search_nodes = function(graph){
	for (var i = 0; i < graph.nodes.length - 1; i++) {
	    optArray.push(String(graph.nodes[i].key));
	}
	optArray = optArray.sort();
}

$(function () {
    $("#nodeid").autocomplete({
        source: optArray
    });
});

var centerNode = function(nodeId,graph,layout,renderer,graphics){
	if (graph.getNode(nodeId)) {
			$( "#pauseLayout" ).trigger( "click" );
            var pos = layout.getNodePosition(nodeId);
            renderer.moveTo(pos.x, pos.y);
            node = graph.getNode(nodeId);
            changeColor(graphics,node,renderer);
            //layout.pinNode(node, !layout.isNodePinned(node));
            var currentScale = String(renderer.zoomIn());
            zoomToNode(1, currentScale,renderer);
    }
	};


// Final bit: most likely graph will take more space than available
// screen. Let's zoom out to fit it into the view:


function zoomToNode(desiredScale, currentScale,renderer) {
// zoom API in vivagraph 0.5.x is silly. There is no way to pass transform
// directly. Maybe it will be fixed in future, for now this is the best I could do:
if (desiredScale < currentScale) {
  zoomOut(desiredScale, currentScale,renderer);
}
if (desiredScale > currentScale) {
  zoomIn(desiredScale, currentScale,renderer);
}
}

function zoomOut(desiredScale, currentScale,renderer){
	currentScale = renderer.zoomOut();
	if (desiredScale < currentScale) {
	  	setTimeout(function () {
	      zoomOut(desiredScale, currentScale,renderer);
	  	}, 1);
  	}
}

function zoomIn(desiredScale, currentScale,renderer){
	currentScale = renderer.zoomIn();
	if (desiredScale > currentScale) {
	  	setTimeout(function () {
	      zoomIn(desiredScale, currentScale,renderer);
	  	}, 1);
  	}
}


        