var colorAttributes = function(graph, graphics, renderer){
	
	options = '';
	var parent = $('#colorAttributesScheme');
  options += '<option>None</option>';
  options += '<option>All</option>';
	for (var index in graph.schemeGenes){
		var property = graph.schemeGenes[index];
		options += '<option>'+property+'</option>';
	}
	parent.append('<select class="selectpicker" id="selectByScheme" data-live-search="true">'+options+'</select>');

	options = '';
  options += '<option>None</option>';
	for (var Nnodes in graph.metadata){
	 	var parent = $('#colorAttributesMetadata');
	 	property = graph.metadata[Nnodes];
		options += '<option>'+property+'</option>';
	}
	parent.append('<select class="selectpicker" id="selectByMetadata" data-live-search="true">'+options+'</select>');

$('.selectpicker').selectpicker();
  $('.selectpicker').selectpicker({
    style: 'btn-info',
    size: 3
});

$('#selectByScheme').change(function(d){
	element = $('#selectByScheme');
	//console.log(element);
	propertyToCheck = element.find(":selected").text();

  gatherSchemeData(graph, propertyToCheck, function(objectOfTotal, objectOfType, propertyIndexes, maxDiffProperties, countProperties){
       changePieData(graphics, maxDiffProperties, countProperties); //First change shaders
       renderer.run(); //Restart nodes
       changeNodeUIData(objectOfType, graphics, propertyIndexes, maxDiffProperties);
  });

});

 $('#selectByMetadata').change(function(d){
  element = $('#selectByMetadata');
 	propertyToCheck = element.find(":selected").text();
  propertyIndex = graph.metadata.indexOf(propertyToCheck);


  gatherMetadata(graph, propertyIndex, function(objectOfTotal, objectOfType, propertyIndexes, maxDiffProperties, countProperties){
       changePieData(graphics, maxDiffProperties, countProperties); //First change shaders
       renderer.run(); //Restart nodes
       changeNodeUIData(objectOfType, graphics, propertyIndexes, maxDiffProperties);
  });

});

}


function assignColor(node, propertyIndex, graphics) {
      var nodeUI = graphics.getNodeUI(node.key);
      nodeUI.color = color(node.profile[propertyIndex]);

    }

function changePieData(graphics, dataLength, totalTypes) {

	  var circleNode = buildCircleNodeShader(dataLength, totalTypes);
    graphics.setNodeProgram(circleNode);
  
}

function assignColorAllProfile(node, graphics, renderer) {
      var nodeUI = graphics.getNodeUI(node.key);
      nodeUI.color = color(node.profile);
    }