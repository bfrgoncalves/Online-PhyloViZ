var optArray = [];


var centerNode = function(nodeId, graphObject){

	var graph = graphObject.graphGL;
	var layout = graphObject.layout;
	var renderer = graphObject.renderer;
	var graphics = graphObject.graphics;

	nodeId = graphObject.graphInput.sameNodeHas[nodeId];
	
	if (graph.getNode(nodeId)) {
			var newColors = [];
			
			if ($('#pauseLayout')[0].innerHTML == "Pause Layout") $( "#pauseLayout" ).trigger( "click" );
            var pos = layout.getNodePosition(nodeId);
            node = graph.getNode(nodeId);
            var nodeUI = graphics.getNodeUI(node.id);
            for (i in nodeUI.colorIndexes){
		      var colorsPerQuadrant = [];
		      for (j in nodeUI.colorIndexes[i]) colorsPerQuadrant.push(0xFFA500ff);
		      newColors.push(colorsPerQuadrant);
		    }
		    nodeUI.colorIndexes = newColors;
            renderer.moveTo(pos.x, pos.y);
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
	renderer.moveTo(pos.x, pos.y);
	currentScale = renderer.zoomOut();
	if (desiredScale < currentScale) {
	  	setTimeout(function () {
	      zoomOutNode(desiredScale, currentScale,renderer,pos);
	  	}, 1);
  	}
}

function zoomInNode(desiredScale, currentScale,renderer,pos){
	renderer.moveTo(pos.x, pos.y);
	currentScale = renderer.zoomIn();
	if (desiredScale > currentScale) {
	  	setTimeout(function () {
	      zoomInNode(desiredScale, currentScale,renderer,pos);
	  	}, 1);
  	}
}

function zoomOut(desiredScale, currentScale, graphObject){
	renderer = graphObject.renderer;
	currentScale = renderer.zoomOut();
	if (desiredScale < currentScale) {
	  	setTimeout(function () {
	      zoomOut(desiredScale, currentScale, graphObject);
	  	},1);
  	}
  	else{
  		if (!graphObject.isLayoutPaused){
  			graphObject.renderer.resume();
  		}
  	}
}
