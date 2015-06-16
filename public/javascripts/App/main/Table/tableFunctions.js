
function createTable(dataset, datasetParameter){

	getTableData(dataset, datasetParameter, function(tableData){
		constructTable(tableData, datasetParameter);
	});

}

function getTableData(datasetName, parameterId, callback){

	$.ajax({
      url: '/api/utils/tableData',
      data: $.param({name: datasetName, parameter: parameterId}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(output){
        callback({data: output.data, headers: output.headers});
      }

    });
}

function constructTable(tableData, datasetParameter){

	var divToCheck = 'div' + datasetParameter;
	var tableToCheck = 'table' + datasetParameter;

	console.log(tableToCheck);

	var columns = [];

	for (i in tableData.headers){
		columns.push({'title': tableData.headers[i]});
	}

	$('#'+ divToCheck).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+tableToCheck+'"></table>' );

	$('#' + tableToCheck).dataTable( {
        "data": tableData.data,
        "columns": columns
    } );  
}