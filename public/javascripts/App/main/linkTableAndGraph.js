

function linkTableAndGraph(property){

	var divToCheck = 'div' + property;
	var tableToCheck = 'table' + property;

	$('#'+tableToCheck+' thead th').click(function(d){
      var columnIndex = $(this).index();
      var table = $('#'+ tableToCheck).DataTable();
  	  var columnData = table.column(columnIndex).data();
      
      createLinkButton(property, columnIndex, columnData);
      
      constructPie(columnData, columnIndex, 'pie' + property, 75, 0, 150);

  	});

}


function createLinkButton(property, columnIndex, columnData){
	
	$("#divbuttonlinkpie" + property).empty();
	
	var button = $('<button id = "buttonlinkpie'+ property + '" type="button" class="btn btn-lg btn-primary">Link to Tree</button>');
	$("#divbuttonlinkpie" + property).append(button);

	$("#buttonlinkpie" + property).click(function(d){

		changeFromTable = true;

		constructPie(columnData, columnIndex, 'currentpiePlace', 75, 0, 75); //tree tab pie

		$('.nav-tabs > li.active').removeClass('active');
      	$('.tab-pane.active').removeClass('active');
      	$('#treeTab').addClass('active');
      	$('#treeContent').addClass('active');
		
		if (property =='isolates'){
	      	$("#selectByMetadata").val(String(columnIndex+2));
	      	$("#selectByMetadata").trigger("change");
	    }
        else{
	      	if(columnIndex != 0){
	      		$("#selectByScheme").val(String(columnIndex+2));
	      		$("#selectByScheme").trigger("change");
	      	}
      	}
	});
}

function linkGraphAndTable(property, indexProperty){
	
	var tableToCheck = 'table' + property;

	changeFromTable = true;
	
	var table = $('#'+ tableToCheck).DataTable();
  	var columnData = table.column(indexProperty).data();
  	
  	constructPie(columnData, indexProperty, 'pie' + property, 75, 0, 150); //table tab pie

  	constructPie(columnData, indexProperty, 'currentpiePlace', 75, 0, 75); //tree tab pie

  	createLinkButton(property, indexProperty);

  	if (property =='isolates') $("#selectByMetadata").trigger("change"); 
    else $("#selectByScheme").trigger("change");
      	
}
