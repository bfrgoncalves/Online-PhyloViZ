var colorAttributes = function(graph){
	
	options = '';
	var parent = $('#colorAttributesScheme');
	for (var index in graph.schemeGenes){
		var property = graph.schemeGenes[index];
		options += '<option>'+property+'</option>';

		// if (property != 'isolates'){

		// 	equal = 'yes';
		// 	pNoSpaces = property.replace(/ /g,'');
		// 	if (pNoSpaces != property) equal = 'no';

		// 	parent.append('<div><input type="checkbox" onclick=changeNodeColorByScheme("'+pNoSpaces+'") property= "'+property+'--'+equal+'" id="'+pNoSpaces+'"/>By ' + property +'</div>');
		// }
	}
	parent.append('<select class="selectpicker" data-live-search="true">'+options+'</select>');

	options = '';
	for (var Nnodes in graph.metadata){
	 	var parent = $('#colorAttributesMetadata');
	 	property = graph.metadata[Nnodes];
		options += '<option>'+property+'</option>';
	// 	equal = 'yes';
	// 	pNoSpaces = property.replace(/ /g,'');
	// 	if (pNoSpaces != property) equal = 'no';

	// 	parent.append('<div><input type="checkbox" onclick=changeNodeColorByMetadata("'+pNoSpaces+'") property= "'+property+'--'+equal+'" id="'+pNoSpaces+'"/>By ' + property +'</div>');

	}
	parent.append('<select class="selectpicker" data-live-search="true">'+options+'</select>');

	$('.selectpicker').selectpicker();
    $('.selectpicker').selectpicker({
      style: 'btn-info',
      size: 3
    });
}