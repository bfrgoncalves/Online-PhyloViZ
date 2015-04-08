
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

function searchNode() {
    //find the node
    var selectedVal = document.getElementById('nodeid').value;
    var node = svg.selectAll(".node");
    if (selectedVal == "none") {
        node.style("stroke", "white").style("stroke-width", "1");
    } else {
        var selected = node.filter(function (d, i) {
            return d.key != selectedVal;
        });

        selected.style("opacity", "0");
        var link = svg.selectAll(".link")
        link.style("opacity", "0");
        d3.selectAll(".node, .link").transition()
            .duration(5000)
            .style("opacity", 1);
    }
}
