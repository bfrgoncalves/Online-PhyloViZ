Math.seedrandom(1);


var width = $(document).width() - 20,
    height = $(document).height() - $('.phylovizNavbar').height() - 85;


var prevNodeProgram = null;

var thisrgb = {
      r : 255,
      g : 0,
      b : 0
}


//global variables to transfer color information from the global pies to the graph
var arrayColorsIsolates = []; 
var property_IndexIsolates = {};
var arrayColorsProfiles = []; 
var property_IndexProfiles = {};
var changeFromTable = false;
////////////////////////////////////////////////////////////////////////////////////

function onLoad(){

    $('#visual').css({width:width, height: height, position: "relative"});

    var dataToGraph = {};

    var img = document.getElementById('GIFimage');
    $("#GIFimage").attr("src", '../../images/waitingGIF.gif').attr('width' , '100px').attr('height' , '100px');

    status('Loading input data...');
    
    createInput(datasetID, function(graph){
      //console.log(graph);
      checkInput(graph, function(graph){

          status('Loading tables...');
          createTable(datasetID, 'isolates', function(){
            createTable(datasetID, 'profiles', function(){
              
              status('Loading tree...');

              constructGraph(graph, datasetID);
            });
          });
      });
    });

}

function checkTablesDone(graph, datasetID){
  countTables += 1;
  console.log(countTables);
  if (countTables == 2){
    constructGraph(graph, datasetID);
  }
}

function checkInput(graph, callback){
  if (graph.key == 'undefined' || graph.nodes.length == 0){

    $.ajax({
      url: '/api/db/postgres/delete',
      data: {dataset_id: datasetID},
      type: 'DELETE',
      success: function(data){
        alert('There was an error uploading the dataset. Possible input format error.');
        window.location.replace("/index");
      }

    });
  }
  else{
    callback(graph);
  }
}


function createInput(datasetID, callback) {

  $.ajax({
      url: '/api/utils/phylovizInput',
      data: $.param({dataset_id: datasetID}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        callback(data);
      }

    });
}


function getRandomColor() {
    var color = (0x1000000+(Math.random())*0xffffff);
    return color;
}

function transformGraphToClient(nodePos) {
            //change graph coordinates to container coordinates
            nodePos.x = width /2 + nodePos.x;
            nodePos.y = height / 2 + nodePos.y + 400;

            return nodePos;
}


$('[data-toggle="mainTab"]').click(function(e) {
    
    var $this = $(this);
    $this.tab('show');
    return false;

});

function status(message) {
    $('#statusMain').text(message);
}



