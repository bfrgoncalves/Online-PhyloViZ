
function createTable(graph, dataset, datasetParameter, callback){

	getTableData(dataset, datasetParameter, function(tableData){
    if (tableData.data.length != 0) constructTable(graph, tableData, datasetParameter, function(){
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

frombutton=false;
function constructTable(graph, tableData, datasetParameter, callback){

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


  var toShowColumns = [columns[0]];
  var toShowData = [];
  var currentrow = [];

  if (columns.length > graph.maxColumns){
    toShowColumns= toShowColumns.concat(columns.slice(graph.minColumns, graph.maxColumns));
    for (i=0; i<tableData.data.length; i++){
      currentrow = [tableData.data[i][0]];
      currentrow = currentrow.concat(tableData.data[i].slice(graph.minColumns, graph.maxColumns));
      toShowData.push(currentrow);
    } 
  }
  else{
    toShowColumns = columns;
    toShowData = tableData.data;
  }

  function cT(tableToCheck, toShowData, toShowColumns){

    var table = $('#' + tableToCheck).DataTable( {

        "data": toShowData,
        "deferRender": true,
        "columns": toShowColumns,
        "bSort" : false,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', //'print', //'pdf'
            {
                extend: 'selectAll',
                text: 'Select All Rows',
                action: function ( e, dt, node, config ) {
                    table.$('tr', {search:'applied'}).toggleClass('selected');

                }
            },
            {
                extend: 'selectNone',
                text: 'Deselect All Rows',
                action: function ( e, dt, node, config ) {
                    table.$('tr').removeClass('selected');

                }
            },
            {
                text: 'Show previous '+graph.increment+' columns',
                className: 'prev10'+datasetParameter,
                action: function () {
                  frombutton=true;

                  graph.maxColumns-=graph.increment;
                  graph.minColumns-=graph.increment;
                  if (graph.minColumns < 2){
                    graph.maxColumns = graph.increment + 1;
                    graph.minColumns = 1;
                  }
                  graph.firstshownColumn = graph.minColumns;
                  global_object.LoadOptions();
                  toShowData = [];
                  toShowColumns = [columns[0]];
                  toShowColumns= toShowColumns.concat(columns.slice(graph.minColumns, graph.maxColumns));
                  for (i=0; i<tableData.data.length; i++){
                    currentrow = [tableData.data[i][0]];
                    currentrow = currentrow.concat(tableData.data[i].slice(graph.minColumns, graph.maxColumns));
                    toShowData.push(currentrow);
                  } 

                  table.destroy();
                  $('#' + tableToCheck).empty();
                  //$('#' + tableToCheck + ' tfoot').remove();

                  cT(tableToCheck, toShowData, toShowColumns);

                }
            },
            {
                text: 'Show next '+graph.increment+' columns',
                className: 'next10'+datasetParameter,
                action: function () {
                  frombutton=true;
                  if (columns.length > graph.maxColumns){
                    if(graph.maxColumns + graph.increment > columns.length){
                      graph.maxColumns+=columns.length-graph.maxColumns;
                      graph.minColumns+=graph.increment;
                    }
                    else{
                      graph.maxColumns+=graph.increment;
                      graph.minColumns+=graph.increment;
                    }
                    graph.firstshownColumn = graph.minColumns;
                    global_object.LoadOptions();
                    toShowData = [];
                    toShowColumns = [columns[0]];
                    toShowColumns= toShowColumns.concat(columns.slice(graph.minColumns, graph.maxColumns));
                    
                    for (i=0; i<tableData.data.length; i++){
                      currentrow = [tableData.data[i][0]];
                      currentrow = currentrow.concat(tableData.data[i].slice(graph.minColumns, graph.maxColumns));
                      toShowData.push(currentrow);
                    } 

                  }
                  table.clear().draw();
                  table.destroy();
                  //$('#' + tableToCheck).empty();
                  $('#' + tableToCheck + ' thead').remove();
                  $('#' + tableToCheck + ' tfoot').remove();

                  cT(tableToCheck, toShowData, toShowColumns);

                }
            },
            //'selectRows',
            //'selectColumns'
            //'selectCells'
        ],
        select: true,
        columnDefs: [
          { className: "dt-center", targets: ["_all"]}
        ],

        "fnInitComplete": function(oSettings, json) {

          createFooter('#' + tableToCheck, toShowColumns, function(){
            createColumnSearch(tableToCheck);
            addToDiv(tableToCheck);
            //$(divToCheck).css('overflow-x','auto');
          });

          exportButtons = $('#' + tableToCheck + '_wrapper .buttons-html5');
          buttonPrint = $('#' + tableToCheck + '_wrapper .buttons-print');
          $('#export'+datasetParameter).append(exportButtons);
          $('#export'+datasetParameter).append(buttonPrint);

          $('table thead tr th').addClass('doHover');
          $(".next10" + datasetParameter).css({"background": '#008CBA'});
          $(".prev10" + datasetParameter).css({"background": '#7d9c6a'});
          $("table").css({"overflow-x": 'auto'});
          
          if(!frombutton) callback();
          else{
            linkTableAndGraph('isolates', global_object); //link between operations from the tables and the graph tab
            linkTableAndGraph('profiles', global_object);
          }
          if (toShowColumns[toShowColumns.length-1].title == tableData.headers[tableData.headers.length-1]){
            $(".next10"+datasetParameter).css({"display": 'none'});
            //$(".prev10" + datasetParameter).css({"display": 'none'});
          }
          if (graph.minColumns == 1){
            $(".prev10"+datasetParameter).css({"display": 'none'});
          }

          $('#table'+datasetParameter+'_wrapper .dt-buttons showColInfo'+datasetParameter).remove();
          if(graph.maxColumns < columns.length) $('#table'+datasetParameter+'_wrapper .dt-buttons').append('<spawn class="showColInfo'+datasetParameter+'">Showing from '+ graph.minColumns + ' to '+ graph.maxColumns+' of ' +columns.length+' columns.</spawn>');
          else $('#table'+datasetParameter+'_wrapper .dt-buttons').append('<spawn class="showColInfo'+datasetParameter+'">Showing from '+ graph.minColumns + ' to '+ columns.length +' of ' +columns.length+' columns.</spawn>');

        }
    } );

  }

  cT(tableToCheck, toShowData, toShowColumns);

	



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
