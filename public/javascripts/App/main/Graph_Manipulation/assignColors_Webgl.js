var colorAttributes = function(graphObject){

  var graph = graphObject.graphInput; 
  var graphics = graphObject.graphics;
  var renderer = graphObject.renderer;

  graphObject.arrayOfCurrentCategories = [];
  graphObject.changeFromFilterCategories = false;
  graphObject.modalMaxCategories = false;

  var color = d3.scale.category20();

  function LoadOptions(){

    options = '';
    var parent = $('#colorAttributesScheme');
    parent.empty();
    var countValues = 1;
    options += '<option value=' + countValues + '>None</option>';

    //var schemeGenes = graph.schemeGenes.slice();
    var schemeGenes = graph.schemeGenes;
    //schemeGenes.shift();

    var maxScheme = 0;
    if(schemeGenes.length < graphObject.graphInput.maxColumns) maxScheme = schemeGenes.length;
    else maxScheme = graphObject.graphInput.maxColumns;

    for (var index = graphObject.graphInput.minColumns-1; index<maxScheme; index++){
      countValues += 1;
      var property = schemeGenes[index];
      options += '<option value=' + countValues + '>' +property+'</option>';
      
    }
    if(graphObject.graphInput.minColumns > 1){
      options += '<option value="prev10">Load previous 10 entries</option>';
    }
    if(schemeGenes.length > graphObject.graphInput.maxColumns) options += '<option value="next10">Load next 10 entries</option>';
    parent.append('<select id="selectByScheme" data-live-search="true"><optgroup>'+options+'</optgroup></select>');

    options = '';
    var countValues = 1;
    var parent = $('#colorAttributesMetadata');
    parent.empty();
    options += '<option value=' + countValues + '>None</option>';

    for (var Nnodes in graph.metadata){
      countValues += 1;
      property = graph.metadata[Nnodes];
      options += '<option value=' + countValues + '>'+property+'</option>';
    }
    parent.append('<select id="selectByMetadata" data-live-search="true"><optgroup>'+options+'</optgroup></select>');
	

    $('#selectByScheme').change(function(d){

      graphObject.linkFromLinkButton = false;

    	element = $('#selectByScheme');
    	//console.log(element);
    	propertyToCheck = element.find(":selected").text();
      if (element.find(":selected").val() == 'next10'){
        $('.next10').trigger('click');
        //LoadOptions();
        return;
      }
      if (element.find(":selected").val() == 'prev10'){
        $('.prev10').trigger('click');
        //LoadOptions();
        return;
      }

      //propertyIndex = graph.schemeGenes.indexOf(propertyToCheck);
      propertyIndex = $("#selectByScheme").prop('selectedIndex');
      //console.log(propertyIndex);

      if (changeFromTable == false){
        linkGraphAndTable('profiles', propertyIndex-1, propertyToCheck, graph.key, graphObject);

        if(propertyToCheck == 'None'){
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
        if (propertyToCheck == 'None'){
          $('#divButtonLegend').css({'display':'none', 'right': '10.5%'});
          $('#col_info').css('display', 'none');
        }
      }


    });

    $('#selectByMetadata').change(function(d){

      graphObject.linkFromLinkButton = false;
      
      element = $('#selectByMetadata');
     	propertyToCheck = element.find(":selected").text();
      propertyIndex = $("#selectByMetadata").prop('selectedIndex') - 1;

      if (changeFromTable == false){
        linkGraphAndTable('isolates', propertyIndex, propertyToCheck, graph.key, graphObject);
        if(propertyToCheck == 'None'){
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

  LoadOptions();
  global_object.LoadOptions = LoadOptions;

}