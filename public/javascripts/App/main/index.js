Math.seedrandom(1);


var width = $(document).width() - 20,
    height = $(document).height() - $('.phylovizNavbar').height() - 85;

console.log($('.phylovizNavbar').height());

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

    createTable(datasetName, 'isolates');
    createTable(datasetName, 'profiles');
    
    createInput(datasetName, function(graph){
      constructGraph(graph);
    });

}


function createInput(datasetName, callback) {

  $.ajax({
      url: '/api/utils/phylovizInput',
      data: $.param({name: datasetName}),
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
            console.log(nodePos);
            nodePos.x = width /2 + nodePos.x;
            nodePos.y = height / 2 + nodePos.y + 400;

            return nodePos;
}


$('[data-toggle="mainTab"]').click(function(e) {
    
    var $this = $(this);
    $this.tab('show');
    return false;

});


