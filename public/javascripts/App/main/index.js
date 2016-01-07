Math.seedrandom(1);


var width = $(document).width() - $(document).width() * 0.02,
    height = $(document).height() - $('#tabs').height() - $(document).width() * 0.02;


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
var loaded = false;
////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){

    $('#visual').css({width:width, height: height, position: "relative"});

    var dataToGraph = {};

    var img = document.getElementById('GIFimage');
    $("#GIFimage").attr("src", '/images/waitingGIF.gif');
    $(".waitingImage").css({'width': '20%'});
    $(".tab-pane").css({'opacity': '0'});

    status('Loading input data...');
    
    createInput(datasetID, function(graph){
      //console.log(graph);
      checkInput(graph, function(graph){

          console.log(graph);

          status('Loading tables...');
          createTable(datasetID, 'isolates', function(){

            if (graph.data_type == 'fasta'){
              status('Loading tree...');
              getPublicInfo(graph, datasetID, function(graph){
                constructGraph(graph, datasetID);
              });
            }
            else{
              createTable(datasetID, 'profiles', function(){
                status('Loading tree...');
                getPublicInfo(graph, datasetID, function(graph){
                  constructGraph(graph, datasetID);
                });
              });
            }
          });
      });
    });

});

function getPublicInfo(graph, datasetID, callback){
  
  $.ajax({
      url: '/api/db/postgres/find/datasets/is_public',
      data: {dataset_id: datasetID},
      type: 'GET',
      success: function(data){
        graph.isPublic = data.userdatasets[0];
        callback(graph);
      }

  });
}


function eraseDataset(){

  $.ajax({
      url: '/api/db/postgres/delete',
      data: {dataset_id: datasetID},
      type: 'DELETE',
      success: function(data){
        window.location.replace("/index");
      }

    });
}

function checkInput(graph, callback){
  if (graph.nodes.length == 0){
    alert('There was an error uploading the dataset. Possible input format error.');
    eraseDataset();
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
        if (data.error){
          alert(data.error);
          eraseDataset();
        }
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



