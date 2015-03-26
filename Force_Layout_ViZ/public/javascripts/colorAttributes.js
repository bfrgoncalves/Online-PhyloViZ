
var colorAttributes = function(graph){

	for (var property in graph.nodes[0]){
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
	//console.log(property);

	var ch = $('#colorAttributesScheme').children();
	var elem = $('#'+property);
	var propAttribute = elem.attr('property');
	var id = propAttribute.split('--');
	var isEqual = id[1];
	var pID = id[0];

	if (elem[0].checked) currentProperty = pID;
	else currentProperty = 'null';

	for (var i=0; i<ch.length;i++){
		if(ch[i].firstChild.getAttribute('property') != propAttribute){
			ch[i].firstChild.checked = false;
		}
	}
	currentDomain = [];

	if (currentProperty == 'profile'){
		svg.selectAll('.node').each(function(d){
			currentDomain.push(d[currentProperty].toString());
		})
	}

	else{
		svg.selectAll('.node').each(function(d){
			currentDomain.push(String(d[currentProperty]));
		})
	}

	color.domain(currentDomain).range(ArrayOfColors);

	svg.selectAll(".node").style("fill", function(d) { return color(d[currentProperty]); });
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


	createPie(currentProperty);

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
