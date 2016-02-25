

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

           $('#buttonPutPublicDatasetuser').click(function(){
              tableToCheck = 'tableuser';
              var tableUser = $('#tableuser').DataTable();
              selectedDataUser = tableUser.rows('.selected').data();
              publicvalue = selectedDataUser[0][4];
              putDatasetPublic(tableToCheck, 'user', publicvalue, datasetObject);
            });

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
        $('#buttonPutPublicDataset' + usertype).css('display', 'none');
        $('#changeDescription' + usertype).val("");
        $('#changeDatasetName' + usertype).val("");

      }

    });

}

function putDatasetPublic(tableToCheck, usertype, value, datasetObject){
  var table = $('#' + tableToCheck).DataTable();
  selectedData = table.rows('.selected').data();
  var publictable = $('#tablepublic').DataTable();
  selectedData = table.rows('.selected').data();
  selectedDatapublic = publictable.rows().data();

  urlToUse = '/api/db/postgres/update/datasets/put_public';
  var valToUse = false;

  if (value == true) valToUse = false;
  else valToUse = true;

  
  $.ajax({
    url: urlToUse,
    type: 'PUT',
    data: {
                dataset_id: datasetObject['user'][0][selectedData[0][0]],
                change: valToUse,
          },
    dataType: "json",
    success: function(data){
      if(valToUse==true){
        selectedData[0][4] = true;
        status('The data set is now Public');
      } 
      else {
        selectedData[0][4] = false;
        status('The data set is now Private');
      }
      if(valToUse==true){
        selectedData[0][4] = true;
        $('#buttonPutPublicDataset' + usertype).html('Set as Private');
        datasetObject['public'][0][selectedData[0][0]] = datasetObject['user'][0][selectedData[0][0]];
        publictable.row.add(selectedData[0]).draw(false);
      } 
      else{
        selectedData[0][4] = false;
        $('#buttonPutPublicDataset' + usertype).html('Set as Public');
        delete datasetObject['public'][selectedData[0][0]];

        for (i = 0; i <selectedDatapublic.length; i++){
          if (selectedDatapublic[i][0] == selectedData[0][0] && selectedDatapublic[i][1] == selectedData[0][1]) {
            publictable.row(i).remove().draw( false );
          }
        }
      } 

      table.cell('.selected', 4).data(valToUse).draw(false);

      table.$('tr.selected').removeClass('selected');
      $('#changeDescriptionDiv' + usertype).css('display', 'none');
      $('#buttonDeleteDataset' + usertype).css('display', 'none');
      $('#buttonPutPublicDataset' + usertype).css({'display': 'none'});

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
        table.cell('.selected', 3).data(description).draw(false);
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
  var publicvalue = false;


	columns.push({'title': 'Name'});
  columns.push({'title': 'Owner'});
  columns.push({'title': 'Data type'});
	columns.push({'title': 'Description'});
  columns.push({'title': 'Public'});

  divID = divID + usertype;
  tableToCheck = 'table' + usertype;


	for( i in data ) {
		var row = [];
    row.push(data[i].name);
    row.push(data[i].owner);
    row.push(data[i].data_type);
		if (data[i].description == undefined || data[i].description == "undefined") row.push("");
		else row.push(data[i].description);
    row.push(data[i].put_public);
		tableData.push(row);
		datasetObject[data[i].name] = data[i].dataset_id;
	}


	$('#' + divID).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+tableToCheck+'"></table>' );

	var table = $('#' + tableToCheck).DataTable( {
        "data": tableData,
        "columns": columns,
        "bSort" : false,
        //"scrollY":        "200px",
        //"scrollCollapse": true,
        "paging":         true,
        "pageLength": 5,
        columnDefs: [
          { className: "dt-center", targets: ["_all"]}
        ],

    } );

    $('#' + tableToCheck+' tbody').on( 'click', 'tr', function () {
    	//console.log($(this).find('td').hasClass('dataTables_empty'));
      var table = $('#' + tableToCheck).DataTable();   

    	if (!$(this).find('td').hasClass('dataTables_empty') ){
    		if ( $(this).hasClass('selected') ) {
	            $(this).removeClass('selected');
              $('#changeDescriptionDiv' + usertype).css('display', 'none');
              $('#buttonDeleteDataset' + usertype).css('display', 'none');
              $('#buttonPutPublicDataset' + usertype).css({'display': 'none'});
	        }
	        else {
              $('#changeDescriptionDiv' + usertype).css('display', 'block');
	            table.$('tr.selected').removeClass('selected');
	            $(this).addClass('selected');

              var tableUser = $('#table' + usertype).DataTable();
              selectedDataUser = tableUser.rows('.selected').data();
              publicvalue = selectedDataUser[0][4];
              if(publicvalue==true) $('#buttonPutPublicDataset' + usertype).html('Set as Private');
              else $('#buttonPutPublicDataset' + usertype).html('Set as Public');

	            $('#buttonDeleteDataset' + usertype).css('float', 'right');
	            $('#buttonDeleteDataset' + usertype).css('display', 'block');
              $('#buttonPutPublicDataset' + usertype).css({'float': 'right'});
              $('#buttonPutPublicDataset' + usertype).css({'display': 'block'});
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