

function linkTableAndGraph(property){

	var divToCheck = 'div' + property;
	var tableToCheck = 'table' + property;

	$('#'+tableToCheck+' thead th').click(function(d){
      var columnIndex = $(this).index();
      //if (property == 'profiles') columnIndex += 1;
      var table = $('#'+ tableToCheck).DataTable();
  	  var columnData = table.column(columnIndex).data();

  	  columnName = table.column(columnIndex).header().innerHTML;
      
      createLinkButton(property, columnIndex, columnData, columnName);
      
      constructPie(columnData, columnIndex, columnName, 'pie' + property, 75, 0, 150);

  	});

}


function createLinkButton(property, columnIndex, columnData, columnName){
	
	$("#divbuttonlinkpie" + property).empty();
	
	var button = $('<button id = "buttonlinkpie'+ property + '" type="button" class="btn btn-lg btn-primary">Link to Tree</button>');
	$("#divbuttonlinkpie" + property).append(button);

	$("#buttonlinkpie" + property).click(function(d){

		changeFromTable = true;

		constructPie(columnData, columnIndex, columnName, 'currentpiePlace', 75, 0, 75); //tree tab pie

		$('.nav-tabs > li.active').removeClass('active');
      	$('.tab-pane.active').removeClass('active');
      	$('#treeTab').addClass('active');
      	$('#treeContent').addClass('active');
		
		if (property =='isolates'){
	      	$("#selectByMetadata").val(String(columnIndex+1));
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

function linkGraphAndTable(property, indexProperty, columnName){
	
	var tableToCheck = 'table' + property;
	
	changeFromTable = true;

	if (indexProperty == -1){

		destroyPie('pie' + property);
		destroyPie('currentpiePlace');
		destroyLink(property);

		if (property =='isolates') $("#selectByMetadata").trigger("change"); 
	    else $("#selectByScheme").trigger("change");
	}
	else{
	
		var table = $('#'+ tableToCheck).DataTable();
	  	var columnData = table.column(indexProperty).data();
	  	
	  	constructPie(columnData, indexProperty, columnName, 'pie' + property, 75, 0, 150); //table tab pie

	  	constructPie(columnData, indexProperty, columnName, 'currentpiePlace', 75, 0, 75); //tree tab pie

	  	createLinkButton(property, indexProperty);

	  	if (property =='isolates') $("#selectByMetadata").trigger("change"); 
	    else $("#selectByScheme").trigger("change");
	}
      	
}
