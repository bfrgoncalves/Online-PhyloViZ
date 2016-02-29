
function createTable(dataset, datasetParameter, callback){

	getTableData(dataset, datasetParameter, function(tableData){
    if (tableData.data.length != 0) constructTable(tableData, datasetParameter, function(){
      callback();
    });
    else callback();
	});

}

function getTableData(datasetID, parameterId, callback){

	$.ajax({
      url: '/api/utils/tableData',
      data: $.param({dataset_id: datasetID, parameter: parameterId}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(output){
        callback({data: output.data, headers: output.headers});
      }

    });
}

function constructTable(tableData, datasetParameter, callback){

	var divToCheck = 'div' + datasetParameter;
	var tableToCheck = 'table' + datasetParameter;

	var columns = [];

	for (i in tableData.headers){
		columns.push({'title': tableData.headers[i]});
	}

   $('#export'+datasetParameter).empty();


  //$('#pie'+datasetParameter).empty();
  //$('#legendpie'+datasetParameter).empty();
  //$('#divbuttonlink'+datasetParameter).empty();

	$('#'+ divToCheck).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+tableToCheck+'"></table>' );


  $('#numberOfColumns' + datasetParameter).text('Number of Columns: ' + columns.length);

  $('#numberOfColumns' + datasetParameter).css({top: '18%', left:'25%', position:'absolute', fontSize: '16px'});




	var table = $('#' + tableToCheck).DataTable( {

        "data": tableData.data,
        "columns": columns,
        "bSort" : false,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'print', //'pdf'
            //'selected',
            //'selectedSingle',
            //'selectAll',
            //'selectNone',
            {
                extend: 'selectAll',
                text: 'Select All',
                action: function ( e, dt, node, config ) {
                    table.$('tr', {search:'applied'}).toggleClass('selected');

                }
            },
            {
                extend: 'selectNone',
                text: 'Deselect All',
                action: function ( e, dt, node, config ) {
                    table.$('tr').removeClass('selected');

                }
            },
            'selectRows',
            //'selectColumns'
            //'selectCells'
        ],
        select: true,
        columnDefs: [
          { className: "dt-center", targets: ["_all"]}
        ],

        "fnInitComplete": function(oSettings, json) {

          createFooter('#' + tableToCheck, columns, function(){
            createColumnSearch(tableToCheck);
            addToDiv(tableToCheck);
            //$(divToCheck).css('overflow-x','auto');
          });
          exportButtons = $('#' + tableToCheck + '_wrapper .buttons-html5');
          buttonPrint = $('#' + tableToCheck + '_wrapper .buttons-print');
          $('#export'+datasetParameter).append(exportButtons);
          $('#export'+datasetParameter).append(buttonPrint);

          $('table thead tr th').addClass('doHover');
          $("table").css({"overflow-x": 'auto'});
          callback();


        }
    } );


}

function addToDiv(tableToCheck){
  $("#" + tableToCheck + '_wrapper').append($('<div id="' + tableToCheck + '_container"></div>'));
  $("#" + tableToCheck).appendTo('#' + tableToCheck + '_container');
  $('#' + tableToCheck + '_container').css({'width': '100%', 'overflow-x': 'auto', 'height': '50%'});
}

function createFooter(element, columns, callback) {
        var footer = document.createElement('tfoot');
        var tr = document.createElement('tr');
 
        $.each(columns, function (i, value) {
            var th = document.createElement('th');
            th.innerHTML = value.title;
            tr.appendChild(th);
        });
        element = $(element);
        footer.appendChild(tr);
        element.append(footer);
        callback();
    }

function createColumnSearch(element){
  // Setup - add a text input to each footer cell
    $('#'+element + ' tfoot th').each( function () {
        var title = $('#'+element + ' thead th').eq( $(this).index() ).text();
        $(this).html( '<input id="columnSearch_'+element+'_'+String($(this).index())+'" type="text" placeholder="Search '+title+'" />' );
    } );

    var table = $('#'+element).DataTable();

    table.columns().each(function(columnIndexes){
      for(i in columnIndexes){
        $('#columnSearch_'+element+'_'+columnIndexes[i]).on( 'keyup', function (inputdiv) {
          columnIndex = inputdiv.currentTarget.id.split('_')[2];
          table
              .columns( parseInt(columnIndex) )
              .search( this.value.replace(/;/g, "|"), true , false )
              .draw();
          } );
        }
    });

}
