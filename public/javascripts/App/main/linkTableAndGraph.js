
var firstTimeFilterIsolates = true;
var firstTimeFilterProfiles = true;


function linkTableAndGraph(property, graphObject){

	key = graphObject.graphInput.key;

	var divToCheck = 'div' + property;
	var tableToCheck = 'table' + property;

	var headers = [];


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

	$('#'+tableToCheck+' thead th').click(function(d){


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

      var columnIndex = $(this).index();
      //if (property == 'profiles') columnIndex += 1;
      var table = $('#'+ tableToCheck).DataTable();

      $( table.cells().nodes() ).removeClass( 'highlight' );
      $( table.column( columnIndex ).nodes() ).addClass( 'highlight' );

      if (table.rows('.selected').data().length != 0){
      	var columnDataInter = table.rows('.selected').data();
      	var columnData = [];
      	var keyData = [];
      	for(i=0;i<columnDataInter.length;i++){
      		columnData.push(columnDataInter[i][columnIndex]);
      		if (property == 'isolates') keyData.push(columnDataInter[i][metadataFilter[0]]);
      		else if (property == 'profiles') keyData.push(columnDataInter[i][schemeFilter[0]]);
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

  	  if (property == 'isolates') var pieHeight = graphObject.tableIsolatesHeight;
  	  else if (property == 'profiles')var pieHeight = graphObject.tableProfilesHeight;

  	  var radious = pieHeight / 6;
  	  var legendRectSize = radious / 6;
      
      createLinkButton(property, columnIndex, columnData, columnName);
      
      constructPie(columnData, columnIndex, columnName, 'pie' + property, radious, legendRectSize, radious);

  	});

}


function createLinkButton(property, columnIndex, columnData, columnName){
	
	$("#divbuttonlinkpie" + property).empty();
	
	var button = $('<button id = "buttonlinkpie'+ property + '" type="button" class="btn btn-primary">Link to Tree</button>');
	$("#divbuttonlinkpie" + property).append(button);

	var ButtonfontSize = $("#pauseLayout").css('font-size');

	$("#buttonlinkpie" + property).css('font-size', ButtonfontSize);

	$("#buttonlinkpie" + property).click(function(d){

		changeFromTable = true;

		$('.nav-tabs > li.active').removeClass('active');
      	$('.tab-pane.active').removeClass('active');
      	$('#treeTab').addClass('active');
      	$('#treeContent').addClass('active');

		$('#divButtonLegend').css('display', 'block');
		$('#col_info').css('display', 'block');

		var pieHeight = $('#col_info').height();
		var pieWidth = $('#col_info').width();
  	  	var radious = pieHeight * 0.14;
  	  	//var legendRectSize = $('#pauseLayout').height();
  	  	var legendRectSize = radious / 5;

		constructPie(columnData, columnIndex, columnName, 'currentpiePlace', pieWidth, legendRectSize, radious); //tree tab pie

      	fontSize = ButtonfontSize.replace('px', '');
        fontSize1 = parseFloat(fontSize);

      	legendHeight = $('#col_info').height() - $('#SVcurrentpiePlace').height() - (radious + fontSize1);


        $('#legendcurrentpiePlace').css('height', legendHeight);
		
		if (property =='isolates'){
	      	$("#selectByMetadata").val(String(columnIndex+2));
	      	$("#selectByMetadata").trigger("change");
	    }
        else{
	      	if(columnIndex != 0){
	      		$("#selectByScheme").val(String(columnIndex+1));
	      		$("#selectByScheme").trigger("change");
	      	}
      	}
	});
}

function destroyLink(property){
	$("#divbuttonlinkpie" + property).empty();
}

function linkGraphAndTable(property, indexProperty, columnName, key){
	
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

	if (indexProperty == -1){

		destroyPie('pie' + property);
		destroyPie('currentpiePlace');
		destroyLink(property);

		if (property =='isolates') $("#selectByMetadata").trigger("change"); 
	    else $("#selectByScheme").trigger("change");
	}
	else{
	
		var table = $('#'+ tableToCheck).DataTable();
	  	//var columnData = table.column(indexProperty).data();
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

	  	if (table.rows('.selected').data().length != 0){
	      	var columnDataInter = table.rows('.selected').data();
	      	var columnData = [];
	      	var keyData = [];
	      	for(i=0;i<columnDataInter.length;i++){
	      		columnData.push(columnDataInter[i][indexProperty]);
	      		if (property == 'isolates') keyData.push(columnDataInter[i][metadataFilter[0]]);
      			else if (property == 'profiles') keyData.push(columnDataInter[i][schemeFilter[0]]);
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

	  	var pieHeight = $('#col_info').height();
		var pieWidth = $('#col_info').width();
  	  	var radious = pieHeight * 0.2;
  	  	//var legendRectSize = $('#pauseLayout').height();
  	  	var legendRectSize = radious / 5;
	  	
	  	constructPie(columnData, indexProperty, columnName, 'pie' + property, radious, legendRectSize, radious); //table tab pie

	  	var radious = pieHeight * 0.14;
  	  	//var legendRectSize = $('#pauseLayout').height();
  	  	var legendRectSize = radious / 5;


	  	constructPie(columnData, indexProperty, columnName, 'currentpiePlace', pieWidth, legendRectSize, radious); //tree tab pie

	  	$('#buttonlink' + 'pie' + property).remove();
	  	//createLinkButton(property, indexProperty);

	  	if (property =='isolates') $("#selectByMetadata").trigger("change"); 
	    else $("#selectByScheme").trigger("change");
	}
      	
}
