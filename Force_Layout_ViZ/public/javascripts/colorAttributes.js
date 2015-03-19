
var colorAttributes = function(graph){

	for (var property in graph.nodes[0]){
		var parent = $('#colorAttributes');
		if (property != 'name' && property != 'id'){

			parent.append('<div><input type="checkbox" onclick="changeNodeColor('+property+')" id="'+property+'"/>By ' + property +'</div>');
		}
	}
}

var changeNodeColor = function(property){

	var ch = $('#colorAttributes').children();

	for (var i=0; i<ch.length;i++){
		if(ch[i].firstChild.id != property['id']){
			ch[i].firstChild.checked = false;
		}
	}
	svg.selectAll(".node").style("fill", function(d) { return color(d[property['id']]); })
}