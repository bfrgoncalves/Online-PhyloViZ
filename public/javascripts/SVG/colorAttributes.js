
var colorAttributes = function(graph){

	for (var index in graph.schemeGenes){
		var property = graph.schemeGenes[index];
		var parent = $('#colorAttributesScheme');
		if (property != 'isolates'){

			equal = 'yes';
			pNoSpaces = property.replace(/ /g,'');
			if (pNoSpaces != property) equal = 'no';

			parent.append('<div><input type="checkbox" onclick=changeNodeColorByScheme("'+pNoSpaces+'") property= "'+property+'--'+equal+'" id="'+pNoSpaces+'"/>By ' + property +'</div>');
		}
	}

	for (var Nnodes in graph.metadata){
		//console.log(graph.nodes[Nnodes]);
		var parent = $('#colorAttributesMetadata');
		property = graph.metadata[Nnodes];
		equal = 'yes';
		pNoSpaces = property.replace(/ /g,'');
		if (pNoSpaces != property) equal = 'no';

		parent.append('<div><input type="checkbox" onclick=changeNodeColorByMetadata("'+pNoSpaces+'") property= "'+property+'--'+equal+'" id="'+pNoSpaces+'"/>By ' + property +'</div>');

	}


}

var changeNodeColorByScheme = function(property){

	var ch = $('#colorAttributesScheme').children();
	var elem = $('#'+property);
	var propAttribute = elem.attr('property');
	var id = propAttribute.split('--');
	var isEqual = id[1];
	var pID = id[0];
	console.log(pID);

	if (elem[0].checked) currentProperty = pID;
	else currentProperty = 'null';

	for (var i=0; i<ch.length;i++){
		if(ch[i].firstChild.getAttribute('property') != propAttribute){
			ch[i].firstChild.checked = false;
		}
	}
	currentDomain = [];

	var indexToCheck = totalGraph.schemeGenes.indexOf(pID);

	svg.selectAll('.node').each(function(d){
		if (currentDomain.indexOf(d.profile[indexToCheck]) == -1) currentDomain.push(String(d.profile[indexToCheck]));
	})

	color.domain(currentDomain).range(ArrayOfColors);

	if (currentProperty == 'null') svg.selectAll(".node").style("fill", function(d) { return baseColor; });
	else svg.selectAll(".node").style("fill", function(d) { return color(d.profile[indexToCheck]); });

	force.start();
}

var changeNodeColorByMetadata = function(property){


	var ch = $('#colorAttributesMetadata').children();
	var elem = $('#'+property);
	var propAttribute = elem.attr('property');
	var id = propAttribute.split('--');
	var isEqual = id[1];
	var pID = id[0];
	//var ObjectOfvalues = {};

	var indexToCheck;

	if (elem[0].checked) currentProperty = pID;
	else currentProperty = 'null';

	for (var i=0; i<ch.length;i++){
		if(ch[i].firstChild.getAttribute('property') != propAttribute){
			ch[i].firstChild.checked = false;
		}
	}
	currentDomain = [];

	//console.log(currentProperty);

	if (currentProperty == 'null') destroyPie();
	else{ 
		createNodePie(currentProperty);
		GlobalPieProperties = createGlobalPieIsolates(currentProperty);
	}

	// svg.selectAll('.node').each(function(d){
	// 	for (var params in d.metadata){
	// 		currentDomain.push(String(d.metadata[params][currentProperty]));
	// 	}
	// 	//currentDomain.push(String(d[currentProperty]));
	// })


	color.domain(currentDomain).range(ArrayOfColors);

	force.start();

	// svg.selectAll(".node").style("fill", function(d) { 
	// 	for (var params in d.metadata) return color(d.metadata[params][currentProperty]); })

	//console.log(pID);

}
