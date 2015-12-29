

function checkDatasets(callback){

	$.ajax({
      url: '/api/db/postgres/find/datasets/all',
      //data: $.param({name: 'name'}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        datasetObject = {};
        createTable(data.userdatasets, 'existingDatasets', 'user', function(datasetObjectuser){
          datasetObject['user'] = [datasetObjectuser];
          createTable(data.publicdatasets, 'existingDatasets', 'public', function(datasetObjectpublic){
           datasetObject['public'] = [datasetObjectpublic];

           $('#userDataset').css({"display": "none"});
           $('#publicDataset').css({"display": "none"});
        	 callback(datasetObject);
          });
        });
      }

    });
}

function deleteDataset(tableToCheck, usertype, datasetObject){
	var table = $('#' + tableToCheck).DataTable();
	selectedData = table.rows('.selected').data();
  var publictable = $('#tablepublic').DataTable();
  selectedData = table.rows('.selected').data();
  selectedDatapublic = publictable.rows().data();

	$.ajax({
      url: '/api/db/postgres/delete',
      data: {dataset_id: datasetObject[selectedData[0][0]]},
      type: 'DELETE',
      success: function(data){
      	table.row('.selected').remove().draw( false );
        table.$('tr').removeClass('selected');
        status(data.message);

        for (i = 0; i <selectedDatapublic.length; i++){
          if (selectedDatapublic[i][0] == selectedData[0][0] && selectedDatapublic[i][1] == selectedData[0][1]) {
            publictable.row(i).remove().draw( false );
          }
        }
        $('#buttonDeleteDataset' + usertype).css('display', 'none');
        $('#changeDescriptionDiv' + usertype).css('display', 'none');
        $('#changeDescription' + usertype).val("");
        $('#changeDatasetName' + usertype).val("");

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

          var prevInfo = datasetObject[selectedData[0][0]];
          delete datasetObject[selectedData[0][0]];
          datasetObject[newName] = prevInfo;
          
          table.cell('.selected', 0).data(newName).draw(false);
          table.$('tr').removeClass('selected');
          status('Dataset Name updated');
          $('#changeDatasetName').val("");

        }

      });

    });

}

function createTable(data, divID, usertype, callback){
	var columns = [];
	var tableData = [];
	var datasetObject = {};


	columns.push({'title': 'Name'});
	columns.push({'title': 'Description'});

  divID = divID + usertype;
  tableToCheck = 'table' + usertype;


	for( i in data ) {
		var row = [];
    row.push(data[i].name);
		if (data[i].description == undefined || data[i].description == "undefined") row.push("");
		else row.push(data[i].description);
		tableData.push(row);
		datasetObject[data[i].name] = data[i].dataset_id;
	}


	$('#' + divID).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+tableToCheck+'"></table>' );

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
              $('#changeDescriptionDiv' + usertype).css('display', 'block');
	            table.$('tr.selected').removeClass('selected');
	            $(this).addClass('selected');
	            $('#buttonDeleteDataset' + usertype).css('float', 'right');
	            $('#buttonDeleteDataset' + usertype).css('display', 'block');
              //$('#buttonChangeDescription').css('display', 'block');
              //$('#buttonChangeDatasetName').css('display', 'block');
	        }
    	}
    } );

    $('#buttonDeleteDataset' + usertype).click(function(){
      tableToCheck = 'table' + usertype;
    	deleteDataset(tableToCheck, usertype, datasetObject);
    });

    $('#buttonChangeDescription' + usertype).click(function(){
      var description = $('#changeDescription' + usertype).val();
      tableToCheck = 'table' + usertype;
      changeDescription(tableToCheck, datasetObject, description);
    });

    $('#buttonChangeDatasetName' + usertype).click(function(){
      var newName = $('#changeDatasetName' + usertype).val();
      tableToCheck = 'table' + usertype;
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