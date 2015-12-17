

function checkDatasets(callback){

	$.ajax({
      url: '/api/db/postgres/find/datasets/all',
      //data: $.param({name: 'name'}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        createTable(data, '#existingDatasets', function(datasetObject){
        	callback(datasetObject);
        });
      }

    });
}

function deleteDataset(tableToCheck, datasetObject){
	var table = $('#' + tableToCheck).DataTable();
	selectedData = table.rows('.selected').data();

	$.ajax({
      url: '/api/db/postgres/delete',
      data: {dataset_id: datasetObject[selectedData[0][0]]},
      type: 'DELETE',
      success: function(data){
      	table.row('.selected').remove().draw( false );
        table.$('tr').removeClass('selected');
        status(data.message);
        $('#buttonDeleteDataset').css('display', 'none');

      }

    });

}


function changeDescription(tableToCheck, datasetObject, description){

  var table = $('#' + tableToCheck).DataTable();
  selectedData = table.rows('.selected').data();

  $.ajax({
      url: '/api/db/postgres/update/datasets/description',
      data: {change: description, dataset_id: datasetObject[selectedData[0][0]]},
      type: 'PUT',
      success: function(data){
        table.cell('.selected', 1).data(description).draw(false);
        status('Description updated');
        $('#changeDescription').val("");

      }

    });
}

function changeDatasetName(tableToCheck, datasetObject, newName){

  var table = $('#' + tableToCheck).DataTable();
  selectedData = table.rows('.selected').data();

  checkIfNameExists(newName, function(){
      
      $.ajax({
        url: '/api/db/postgres/update/datasets/name',
        data: {change: newName, dataset_id: datasetObject[selectedData[0][0]]},
        type: 'PUT',
        success: function(data){
          table.cell('.selected', 0).data(newName).draw(false);
          table.$('tr').removeClass('selected');
          status('Dataset Name updated');
          $('#changeDatasetName').val("");

        }

      });

    });

}

function createTable(data, divID, callback){
	var columns = [];
	var tableData = [];
	var datasetObject = {};

	var tableToCheck = 'TableDatasets';

	columns.push({'title': 'Name'});
	columns.push({'title': 'Description'});

	for( i in data ) {
		var row = [];
		row.push(data[i].name);
		if (data[i].description == undefined) row.push("");
		else row.push(data[i].description);
		tableData.push(row);
		datasetObject[data[i].name] = data[i].dataset_id;
	}

	$(divID).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+tableToCheck+'"></table>' );

	var table = $('#' + tableToCheck).DataTable( {
        "data": tableData,
        "columns": columns,
        "bSort" : false,
        "scrollY":        "100px",
        "scrollCollapse": true,
        "paging":         false,
        columnDefs: [
          { className: "dt-center", targets: ["_all"]}
        ],

    } );

    $('#' + tableToCheck+' tbody').on( 'click', 'tr', function () {
    	//console.log($(this).find('td').hasClass('dataTables_empty'));
    	if (!$(this).find('td').hasClass('dataTables_empty') ){
    		if ( $(this).hasClass('selected') ) {
	            $(this).removeClass('selected');
	        }
	        else {
              $('#changeDescriptionDiv').css('display', 'block');
	            table.$('tr.selected').removeClass('selected');
	            $(this).addClass('selected');
	            $('#buttonDeleteDataset').css('float', 'right');
	            $('#buttonDeleteDataset').css('display', 'block');
              //$('#buttonChangeDescription').css('display', 'block');
              //$('#buttonChangeDatasetName').css('display', 'block');
	        }
    	}
    } );

    $('#buttonDeleteDataset').click(function(){
    	deleteDataset(tableToCheck, datasetObject);
    });

    $('#buttonChangeDescription').click(function(){
      var description = $('#changeDescription').val();
      changeDescription(tableToCheck, datasetObject, description);
    });

    $('#buttonChangeDatasetName').click(function(){
      var newName = $('#changeDatasetName').val();
      changeDatasetName(tableToCheck, datasetObject, newName);
    });

    callback(datasetObject);
}

function createDropdown(data, dropdownDiv, placeh, forceSelect, dropDownID){

	var parent = $(dropdownDiv);
	var options = '<option data-hidden = "true"></option>';;
	countOptions = 0;
	for (var index in data){
		countOptions += 1;
		var datasetName = data[index].name;
		var datasetID = data[index].dataset_id;
		if (forceSelect == countOptions) options += '<option value="'+datasetID+'">'+datasetName+'</option>';
		else options += '<option value="'+datasetID+'">'+datasetName+'</option>';
	}
	parent.append('<select title = "'+placeh+'" id="'+dropDownID+'" data-live-search="true">'+options+'</select>');

}