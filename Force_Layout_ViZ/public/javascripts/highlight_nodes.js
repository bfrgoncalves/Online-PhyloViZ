

//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};

var highlight_nodes = function(graph){

	for (i = 0; i < graph.nodes.length; i++) {
	    linkedByIndex[i + "," + i] = 1;
	};
	graph.links.forEach(function (d) {
	    linkedByIndex[d.source.index + "," + d.target.index] = 1;
	});
	//This function looks up whether a pair are neighbours

}

function neighboring(a, b) {
	return linkedByIndex[a.index + "," + b.index];
}
function connectedNodes() {
	if (toggle == 0) {
	    //Reduce the opacity of all but the neighbouring nodes
	    d = d3.select(this).node().__data__;
	    node.style("opacity", function (o) {
	        return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
	    });
	    link.style("opacity", function (o) {
	        return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
	    });
	    //Reduce the op
	    toggle = 1;
	} else {
	    //Put them back to opacity=1
	    node.style("opacity", 1);
	    link.style("opacity", 1);
	    toggle = 0;
	}
}

