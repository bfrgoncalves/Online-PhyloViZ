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
    
    createInput(datasetID, function(graph){
      createTable(datasetID, 'isolates');
      createTable(datasetID, 'profiles');
      setTimeout(function(){
        constructGraph(graph, datasetID);
      }, 100);
    });

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



