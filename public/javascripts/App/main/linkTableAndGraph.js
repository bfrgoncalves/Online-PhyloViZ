
var firstTimeFilterIsolates = true;
var firstTimeFilterProfiles = true;


function linkTableAndGraph(property, graphObject){

	key = graphObject.graphInput.key[0];

	var divToCheck = 'div' + property;
	var tableToCheck = 'table' + property;

	var headers = [];

  graphObject['selectedOnTable' + property] = false;


    if (property == 'isolates'){
    	var tHeadersI = [];
    	$('#'+tableToCheck+' thead th').each(function(i, header){
    		tHeadersI.push(header.innerHTML);
    	});
    	keyIndexI = tHeadersI.indexOf(key);
    }
    if (property == 'profiles'){
    	var tHeadersP = [];
    	$('#'+tableToCheck+' thead th').each(function(i, header){
    		tHeadersP.push(header.innerHTML);
    	});
    	keyIndexP = tHeadersP.indexOf(key);
    }

    var prevColumnIndex = -1;

	$('#'+tableToCheck+' thead th').click(function(d){

    graphObject.linkFromLinkButton = false;

	  if (firstTimeFilterIsolates){
	  	metadataFilter = new Array(3);
	  	metadataFilter[0] = keyIndexI;
	  	firstTimeFilterIsolates = false;
	  }
	  if (firstTimeFilterProfiles){
	  	schemeFilter = new Array(3);
	  	schemeFilter[0] = keyIndexP;
	  	firstTimeFilterProfiles = false;
	  }

      var columnIndex = parseInt($(this).attr('real_index'));

      //if( columnIndex == 0 && property == 'profiles') return 0;

      var table = $('#'+ tableToCheck).DataTable();

      if (prevColumnIndex != -1) $( table.column( prevColumnIndex ).nodes() ).removeClass( 'highlight' );
      
      $( table.column( columnIndex ).nodes() ).addClass( 'highlight' );

      prevColumnIndex = columnIndex;

      //var columnData = table.column(columnIndex).data();
      var selectedData = table.rows('.selected').data();

      if (selectedData.length != 0){
        graphObject['selectedOnTable' + property] = true;
      	//var columnDataInter = table.rows('.selected').data();
      	var columnData = [];
      	var keyData = [];
      	for(i=0;i<selectedData.length;i++){
      		columnData.push(selectedData[i][columnIndex]);
      		if (property == 'isolates') keyData.push(selectedData[i][metadataFilter[0]]);
      		else if (property == 'profiles') keyData.push(selectedData[i][schemeFilter[0]]);
      	}
      	if (property == 'isolates'){
      		metadataFilter[1] = keyData;
      		metadataFilter[2] = columnData;
      	}
      	else if (property == 'profiles'){
      		schemeFilter[1] = keyData;
      		schemeFilter[2] = columnData;
      	}
      }
  	  else{
        graphObject['selectedOnTable' + property] = false;
  	  	var columnData = table.column(columnIndex).data();
  	  	if (property == 'isolates'){
  	  		metadataFilter[1] = [];
      		metadataFilter[2] = [];
  	  	}
  	  	else if (property == 'profiles'){
  	  		schemeFilter[1] = [];
  	  		schemeFilter[2] = [];
  	  	} 
  	  }

  	  columnName = table.column(columnIndex).header().innerHTML;

  	  if (property == 'isolates'){
  	  	if(graphObject.tableIsolatesHeight == null) graphObject.tableIsolatesHeight = $("#tableisolates_wrapper").height();
  	  	var pieHeight = graphObject.tableIsolatesHeight;
  	  }
  	  else if(property == 'profiles'){
  	  	if(graphObject.tableProfilesHeight == null) graphObject.tableProfilesHeight = $("#tableprofiles_wrapper").height();
  	  	var pieHeight = graphObject.tableProfilesHeight;
  	  }

  	  var radious = pieHeight / 6;
  	  var legendRectSize = radious / 6;
      
      createLinkButton(property, columnIndex, columnData, columnName, graphObject);
      
      constructPie(columnData, columnIndex, columnName, 'pie' + property, radious, legendRectSize, radious, graphObject);

  	});

}


function createLinkButton(property, columnIndex, columnData, columnName, graphObject){
	
	$("#divbuttonlinkpie" + property).empty();
	
	var button = $('<button id = "buttonlinkpie'+ property + '" type="button" class="btn btn-primary">Link to Tree</button>');
	$("#divbuttonlinkpie" + property).append(button);

	var ButtonfontSize = $("#pauseLayout").css('font-size');

	$("#buttonlinkpie" + property).css('font-size', ButtonfontSize);

	$("#buttonlinkpie" + property).click(function(d){

    graphObject.linkFromLinkButton = true;

    if(graphObject['selectedOnTable' + property] == true){
      $('#dialog').empty();
      var toAppend = '<div style="font-size:150%;text-align:center;">To remove the filter applied to the data, return to the <b>table</b>, press the <i>Deselect All Rows</i> button and select one column header to refresh the selection.';
      $('#dialog').append(toAppend);
      $('#dialog').dialog({
          height: $(window).height() * 0.2,
          width: $(window).width() * 0.4,
          modal: true,
          resizable: true,
          dialogClass: 'no-close success-dialog'
      });
    }

		changeFromTable = true;

		$('.nav-tabs > li.active').removeClass('active');
      	$('.tab-pane.active').removeClass('active');
      	$('#treeTab').addClass('active');
      	$('#treeContent').addClass('active');

      	var tutorialFunctions = tutorial('col_tutorial_main');
        tutorialFunctions.tree();

		$('#divButtonLegend').css('display', 'block');
		$('#col_info').css('display', 'block');
    $("#piePlace").css({display:"block"});
    $('#outerColorLegendDiv').css('display', 'block');

		var pieHeight = $('#col_info').height() * 0.5;
		var pieWidth = $('#col_info').width() * 0.5;
  	  	var radious = pieHeight * 0.14;
  	  	//var legendRectSize = $('#pauseLayout').height();
  	  	var legendRectSize = radious / 5;

		constructPie(columnData, columnIndex, columnName, 'currentpiePlace', pieWidth, legendRectSize, radious, graphObject); //tree tab pie

      	fontSize = ButtonfontSize.replace('px', '');
        fontSize1 = parseFloat(fontSize);

        console.log($("#buttononlegend").height());

      	legendHeight = $('#col_info').height();


        $('#legendcurrentpiePlace').css('height', legendHeight);

		if (property =='isolates'){
	      	$("#selectByMetadata").val(String(columnIndex+2));
	      	$("#selectByMetadata").trigger("change");
	    }
        else{
	      	//if(columnIndex != 0){
	      		$("#selectByScheme").val(String(columnIndex+2));
	      		$("#selectByScheme").trigger("change");
	      	//}
      	}
	});
}

function destroyLink(property){
	$("#divbuttonlinkpie" + property).empty();
}

function linkGraphAndTable(property, indexProperty, columnName, key, graphObject){

  key = key[0];
	
	var tableToCheck = 'table' + property;
	
	changeFromTable = true;

	if (firstTimeFilterIsolates && property == 'isolates'){
    	var tHeadersI = [];
    	$('#'+tableToCheck+' thead th').each(function(i, header){
    		tHeadersI.push(header.innerHTML);
    	});
    	keyIndexI = tHeadersI.indexOf(key);
    }
    if (firstTimeFilterProfiles && property == 'profiles'){
    	var tHeadersP = [];
    	$('#'+tableToCheck+' thead th').each(function(i, header){
    		tHeadersP.push(header.innerHTML);
    	});
    	keyIndexP = tHeadersP.indexOf(key);
    }

    if (firstTimeFilterIsolates){
	  	metadataFilter = new Array(3);
	  	metadataFilter[0] = keyIndexI;
	  	firstTimeFilterIsolates = false;
	  }
	  if (firstTimeFilterProfiles){
	  	schemeFilter = new Array(3);
	  	schemeFilter[0] = keyIndexP;
	  	firstTimeFilterProfiles = false;
	  }

	if (columnName == 'None'){

		destroyPie('pie' + property);
		destroyPie('currentpiePlace');
		destroyLink(property);

		if (property =='isolates') $("#selectByMetadata").trigger("change"); 
	  else $("#selectByScheme").trigger("change");
	}
	else{
	
		var table = $('#'+ tableToCheck).DataTable();
	  	//var columnData = table.column(indexProperty).data();
		var selectedData = table.rows('.selected').data();

	  	if (selectedData.length != 0){
	      	//var columnDataInter = table.rows('.selected').data();
	      	var columnData = [];
	      	var keyData = [];
	      	for(i=0;i<selectedData.length;i++){
	      		columnData.push(selectedData[i][indexProperty]);
	      		if (property == 'isolates') keyData.push(selectedData[i][metadataFilter[0]]);
      			else if (property == 'profiles') keyData.push(selectedData[i][schemeFilter[0]]);
	      	}
	      	if (property == 'isolates'){
      		metadataFilter[1] = keyData;
      		metadataFilter[2] = columnData;
	      	}
	      	else if (property == 'profiles'){
	      		schemeFilter[1] = keyData;
	      		schemeFilter[2] = columnData;
	      	}
	    }
  	    else{
	  	  	var columnData = table.column(indexProperty).data();
	  	  	if (property == 'isolates'){
  	  		metadataFilter[1] = [];
      		metadataFilter[2] = [];
	  	  	}
	  	  	else if (property == 'profiles'){
	  	  		schemeFilter[1] = [];
	  	  		schemeFilter[2] = [];
	  	  	}
	  	  }

	  	//var pieHeight = $('#col_info').height() * 0.15;

	  	var pieHeight = $('#col_info').height() * 0.5;
		  var pieWidth = $('#col_info').width() * 0.5;

  	  	var radious = pieHeight * 0.2;
  	  	//var legendRectSize = $('#pauseLayout').height();
  	  	var legendRectSize = radious / 5;
	  	
	  	constructPie(columnData, indexProperty, columnName, 'pie' + property, radious, legendRectSize, radious, graphObject); //table tab pie

	  	var radious = pieHeight * 0.14;
  	  	//var legendRectSize = $('#pauseLayout').height();
  	  	var legendRectSize = radious / 5;


	  	constructPie(columnData, indexProperty, columnName, 'currentpiePlace', pieWidth, legendRectSize, radious, graphObject); //tree tab pie

	  	$('#buttonlink' + 'pie' + property).remove();
	  	//createLinkButton(property, indexProperty);

	  	if (property =='isolates') $("#selectByMetadata").trigger("change"); 
	    else $("#selectByScheme").trigger("change");
	}
      	
}
