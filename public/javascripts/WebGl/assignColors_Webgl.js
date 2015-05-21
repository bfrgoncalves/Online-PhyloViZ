var colorAttributes = function(graph, graphics, renderer){
	
	options = '';
	var parent = $('#colorAttributesScheme');
  options += '<option>None</option>';
  options += '<option>All</option>';
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
	parent.append('<select class="selectpicker" id="selectByScheme" data-live-search="true">'+options+'</select>');

	options = '';
  options += '<option>None</option>';
	for (var Nnodes in graph.metadata){
	 	var parent = $('#colorAttributesMetadata');
	 	property = graph.metadata[Nnodes];
		options += '<option>'+property+'</option>';
	// 	equal = 'yes';
	// 	pNoSpaces = property.replace(/ /g,'');
	// 	if (pNoSpaces != property) equal = 'no';

	// 	parent.append('<div><input type="checkbox" onclick=changeNodeColorByMetadata("'+pNoSpaces+'") property= "'+property+'--'+equal+'" id="'+pNoSpaces+'"/>By ' + property +'</div>');

	}
	parent.append('<select class="selectpicker" id="selectByMetadata" data-live-search="true">'+options+'</select>');

$('.selectpicker').selectpicker();
  $('.selectpicker').selectpicker({
    style: 'btn-info',
    size: 3
});

$('#selectByScheme').change(function(d){
	element = $('#selectByScheme');
	currentDomain = [];
	//console.log(element);
	propertyToCheck = element.find(":selected").text();
	//console.log(element.find(":selected").text());

  if (propertyToCheck == 'All'){
    graph.nodes.forEach(function(node){

        if (currentDomain.indexOf(String(node.profile)) == -1) currentDomain.push(String(node.profile));
        color.domain(currentDomain).range(ArrayOfColors);
        assignColorAllProfile(node, graphics);
        renderer.rerender();
    })
  }
  else{
    propertyIndex = graph.schemeGenes.indexOf(propertyToCheck);
    graph.nodes.forEach(function(node){
      if (currentDomain.indexOf(node.profile[propertyIndex]) == -1) currentDomain.push(String(node.profile[propertyIndex]));
      color.domain(currentDomain).range(ArrayOfColors);
      assignColor(node, propertyIndex, graphics);
      renderer.rerender();
    })
  }
})

// $('#selectByMetadata').change(function(d){
//   element = $('#selectByScheme');
//   currentDomain = [];
//   //console.log(element);
//   propertyToCheck = element.find(":selected").text();
//   //console.log(element.find(":selected").text());

//   propertyIndex = graph.metadata.indexOf(propertyToCheck);
//   graph.nodes.forEach(function(node){
//     lengthIsolates = node.isolates.length;
//     if (currentDomain.indexOf(node.profile[propertyIndex]) == -1) currentDomain.push(String(node.profile[propertyIndex]));
//     color.domain(currentDomain).range(ArrayOfColors);
//     assignColor(node, propertyIndex, graphics);
//     renderer.rerender();
//   })
  
// })


}


function assignColor(node, propertyIndex, graphics) {
      var nodeUI = graphics.getNodeUI(node.key);
      nodeUI.color = color(node.profile[propertyIndex]);

    }

function assignColorAllProfile(node, graphics, renderer) {
      var nodeUI = graphics.getNodeUI(node.key);
      nodeUI.color = color(node.profile);
    }