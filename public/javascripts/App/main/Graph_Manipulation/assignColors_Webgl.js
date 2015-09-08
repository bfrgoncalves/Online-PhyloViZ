var colorAttributes = function(graph, graphics, renderer){

  var color = d3.scale.category20();
	
	options = '';
	var parent = $('#colorAttributesScheme');
  var countValues = 1;
  options += '<option value=' + countValues + '>None</option>';
  countValues+=1;
  options += '<option value=' + countValues + '>All</option>';
	for (var index in graph.schemeGenes){
    countValues += 1;
		var property = graph.schemeGenes[index];
		options += '<option value=' + countValues + '>' +property+'</option>';
	}
	parent.append('<select class="selectpicker" id="selectByScheme" data-live-search="true">'+options+'</select>');

	options = '';
  var countValues = 1;
  options += '<option value=' + countValues + '>None</option>';
	for (var Nnodes in graph.metadata){
    countValues += 1;
	 	var parent = $('#colorAttributesMetadata');
	 	property = graph.metadata[Nnodes];
		options += '<option value=' + countValues + '>'+property+'</option>';
	}
	parent.append('<select class="selectpicker" id="selectByMetadata" data-live-search="true">'+options+'</select>');

// $('.selectpicker').selectpicker();
//   $('.selectpicker').selectpicker({
//     style: 'btn-info',
//     size: 3
// });

$('#selectByScheme').change(function(d){

	element = $('#selectByScheme');
	//console.log(element);
	propertyToCheck = element.find(":selected").text();
  propertyIndex = graph.schemeGenes.indexOf(propertyToCheck);
  console.log(propertyIndex);

  if (changeFromTable == false){
    linkGraphAndTable('profiles', propertyIndex+1);
  }
  else{
    gatherSchemeData(graph, propertyToCheck, function(objectOfTotal, objectOfType, maxDiffProperties, countProperties){
         maxDiffProperties = maxDiffProperties + 3;
         changePieData(graphics, maxDiffProperties, countProperties); //First change shaders
         renderer.run(); //Restart nodes
         changeNodeUIData(objectOfType, graphics, property_IndexProfiles, maxDiffProperties, arrayColorsProfiles);

         changeFromTable = false;
    });
  }


});

$('#selectByMetadata').change(function(d){
  element = $('#selectByMetadata');
 	propertyToCheck = element.find(":selected").text();
  propertyIndex = graph.metadata.indexOf(propertyToCheck);

  if (changeFromTable == false){
    linkGraphAndTable('isolates', propertyIndex);
  }
  else{
    gatherMetadata(graph, propertyIndex, function(objectOfTotal, objectOfType, maxDiffProperties, countProperties){
       maxDiffProperties = maxDiffProperties + 3;
       changePieData(graphics, maxDiffProperties, countProperties); //First change shaders
       renderer.run(); //Restart nodes
       changeNodeUIData(objectOfType, graphics, property_IndexIsolates, maxDiffProperties, arrayColorsIsolates);

       changeFromTable = false;
    });
    
  }

});

}


function changePieData(graphics, dataLength, totalTypes) {
	  var circleNode = buildCircleNodeShader(dataLength, totalTypes);
    graphics.setNodeProgram(circleNode);
  
}

function assignColorAllProfile(node, graphics, renderer) {
      var nodeUI = graphics.getNodeUI(node.key);
      nodeUI.color = color(node.profile);
    }