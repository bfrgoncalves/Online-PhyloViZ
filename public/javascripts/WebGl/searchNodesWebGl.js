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
			if ($('#pauseLayout')[0].innerHTML == "Pause Layout") $( "#pauseLayout" ).trigger( "click" );
            var pos = layout.getNodePosition(nodeId);
            node = graph.getNode(nodeId);
            changeColor(graphics,node,renderer);
            //layout.pinNode(node, !layout.isNodePinned(node));
            var currentScale = String(renderer.zoomIn());
            zoomToNode(1, currentScale,renderer,pos);
    }
	};


// Final bit: most likely graph will take more space than available
// screen. Let's zoom out to fit it into the view:


function zoomToNode(desiredScale, currentScale,renderer,pos) {
// zoom API in vivagraph 0.5.x is silly. There is no way to pass transform
// directly. Maybe it will be fixed in future, for now this is the best I could do:
if (desiredScale < currentScale) {
  zoomOutNode(desiredScale, currentScale,renderer,pos);
}
if (desiredScale > currentScale) {
  zoomInNode(desiredScale, currentScale,renderer,pos);
}
}

function zoomOutNode(desiredScale, currentScale,renderer,pos){
	currentScale = renderer.zoomOut();
	renderer.moveTo(pos.x, pos.y);
	if (desiredScale < currentScale) {
	  	setTimeout(function () {
	      zoomOutNode(desiredScale, currentScale,renderer,pos);
	  	}, 1);
  	}
}

function zoomInNode(desiredScale, currentScale,renderer,pos){
	currentScale = renderer.zoomIn();
	renderer.moveTo(pos.x, pos.y);
	if (desiredScale > currentScale) {
	  	setTimeout(function () {
	      zoomInNode(desiredScale, currentScale,renderer,pos);
	  	}, 1);
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


        