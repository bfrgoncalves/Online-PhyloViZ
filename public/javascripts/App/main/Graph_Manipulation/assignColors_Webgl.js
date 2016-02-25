var colorAttributes = function(graphObject){

  graph = graphObject.graphInput; 
  graphics = graphObject.graphics;
  renderer = graphObject.renderer;

  graphObject.arrayOfCurrentCategories = [];
  graphObject.changeFromFilterCategories = false;
  graphObject.modalMaxCategories = false;

  var color = d3.scale.category20();
	
	options = '';
	var parent = $('#colorAttributesScheme');
  var countValues = 1;
  options += '<option value=' + countValues + '>None</option>';

  var schemeGenes = graph.schemeGenes.slice();
  schemeGenes.shift();

	for (var index in schemeGenes){
    countValues += 1;
    var property = schemeGenes[index];
    options += '<option value=' + countValues + '>' +property+'</option>';
    
	}
	parent.append('<select id="selectByScheme" data-live-search="true"><optgroup>'+options+'</optgroup></select>');

	options = '';
  var countValues = 1;
  var parent = $('#colorAttributesMetadata');
  options += '<option value=' + countValues + '>None</option>';

	for (var Nnodes in graph.metadata){
    countValues += 1;
	 	property = graph.metadata[Nnodes];
		options += '<option value=' + countValues + '>'+property+'</option>';
	}
	parent.append('<select id="selectByMetadata" data-live-search="true"><optgroup>'+options+'</optgroup></select>');


$('#selectByScheme').change(function(d){

	element = $('#selectByScheme');
	//console.log(element);
	propertyToCheck = element.find(":selected").text();
  propertyIndex = graph.schemeGenes.indexOf(propertyToCheck);

  if (changeFromTable == false){
    linkGraphAndTable('profiles', propertyIndex, propertyToCheck, graph.key, graphObject);
    if(propertyIndex == -1){
      $('#divButtonLegend').css({'display':'none', 'right': '10.5%'});
      $('#col_info').css('display', 'none');
    }
    else{
      $('#divButtonLegend').css('display', 'block');
      $('#col_info').css('display', 'block');
    }
  }
  else{

    gatherSchemeData(graph, propertyToCheck, schemeFilter, function(objectOfTotal, objectOfType, countProperties, hasMultipleFields){
         graphObject.objectOfType = objectOfType;
         graphObject.property_index = property_IndexProfiles;

         if (hasMultipleFields == false && graphObject.currentNodeProgram == 'buildCircleNodeShader') setNewProgram(graphObject, buildSimpleCircleNodeShader);
         else if (hasMultipleFields == true && graphObject.currentNodeProgram == 'buildSimpleCircleNodeShader') setNewProgram(graphObject, buildCircleNodeShader);
         graphObject.linkMethod = 'profiles';
         changeNodeUIData(graphObject.objectOfType, graphics, graphObject.property_index, arrayColorsProfiles, renderer);
         changeFromTable = false;

         graphObject.arrayOfCurrentCategories = [];
         graphObject.changeFromFilterCategories = false;
    });

    if (propertyIndex == -1){
      $('#divButtonLegend').css({'display':'none', 'right': '10.5%'});
      $('#col_info').css('display', 'none');
    }
  }


});

$('#selectByMetadata').change(function(d){
  element = $('#selectByMetadata');
 	propertyToCheck = element.find(":selected").text();
  propertyIndex = graph.metadata.indexOf(propertyToCheck);

  if (changeFromTable == false){
    linkGraphAndTable('isolates', propertyIndex, propertyToCheck, graph.key, graphObject);
    if(propertyIndex == -1){
      $('#divButtonLegend').css({'display':'none', 'right': '10.5%'});
      $('#col_info').css('display', 'none');
    }
    else{
      $('#divButtonLegend').css('display', 'block');
      $('#col_info').css('display', 'block');
    }
  }
  else{

    gatherMetadata(graph, propertyToCheck, metadataFilter, function(objectOfTotal, objectOfType, countProperties, hasMultipleFields){
       graphObject.objectOfType = objectOfType;
       graphObject.property_index = property_IndexIsolates;
       if (hasMultipleFields == false && graphObject.currentNodeProgram == 'buildCircleNodeShader') setNewProgram(graphObject, buildSimpleCircleNodeShader);
       else if (hasMultipleFields == true && graphObject.currentNodeProgram == 'buildSimpleCircleNodeShader') setNewProgram(graphObject, buildCircleNodeShader);
       graphObject.linkMethod = 'isolates';
       changeNodeUIData(graphObject.objectOfType, graphics, graphObject.property_index, arrayColorsIsolates, renderer);
       changeFromTable = false;

       graphObject.arrayOfCurrentCategories = [];
       graphObject.changeFromFilterCategories = false;
    });

    
  }

});

}