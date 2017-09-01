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

var global_object = {};
//var lauchEventsFunction = '';
////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){

    new Clipboard('.btn-clip');

    $('#visual').css({width:width, height: height, position: "relative"});

    if(navigator.userAgent.toLowerCase().indexOf('chrome') < 0 && navigator.userAgent.toLowerCase().indexOf('safari') < 0 && navigator.userAgent.toLowerCase().indexOf('firefox') < 0)
    {
        var toAdd = 'We Apologize, but currently only Google Chrome, Safari and Firefox web browsers are <b>fully  supported</b>. Performance is higher if you use Chrome.<br>' +
                 '<br>We are hoping (and working) to increase browser support soon.<br>' +
                  'In the meantime you can <b>Download Chrome</b> <a href="//www.google.com/chrome/browser/desktop/index.html">here</a>.<br>' +
                    '<br>You can use other web-browsers but be aware of known issues.<br>';
         
         $('#firefoxversionInfo').empty();
         $('#firefoxversionInfo').append('<div>'+toAdd+'</div>');
         $('#firefoxversionInfo').dialog({
              height: $(window).height() * 0.2,
              width: $(window).width() * 0.2,
              modal: true,
              resizable: true,
              dialogClass: 'no-close success-dialog'
          });

    }

    var dataToGraph = {};

    var img = document.getElementById('GIFimage');
    $("#GIFimage").attr("src", '/images/waitingGIF.gif');
    $(".waitingImage").css({'width': '20%'});
    $(".tab-pane").css({'opacity': '0'});

    status('Loading input data...');
    
    createInput(datasetID, function(graph){
      console.log(graph);
      if(graph.not_ready == true) return;
      
      checkInput(graph, function(graph){
          console.log(graph.positions);

          if(graph.data_type != 'fasta'){
            $("#FASTATab").css('display', 'none');
            $("#FASTAContent").css('display', 'none');
            $("#viewSequences").css('display', 'none');
            
          }

          graph.increment = 499;
          graph.maxColumns = 500;
          graph.minColumns = 1;

          if(graph.increment+1 > graph.nodes[0].profile.length){
            graph.increment = graph.nodes.length - 1;
            graph.maxColumns = graph.nodes.length;
          }
          if(graph.metadata.length > graph.maxColumns){
            graph.increment = graph.metadata.length - 1;
            graph.maxColumns = graph.metadata.length;
          }

          graph.firstshownColumn = graph.minColumns;

          if(graph.nodes.length < 3000){
            //$('#profilec').css({'display':'none'});
            
            //create_subset_profile(graph, function(graph){
              if(!graph.hasOwnProperty('distanceMatrix') || graph.distanceMatrix.length == 0){
                calculateDistanceMatrix(graph, function(graph){});
              }
              /*
              calculateDistanceMatrix(graph, function(graph){
              */
                status('Loading tables...');
                createTable(graph, datasetID, 'isolates', function(){

                  if (graph.data_type == 'fasta' || graph.data_type == 'newick'){
                    status('Loading tree...');
                    getPublicInfo(graph, datasetID, function(graph){
                      constructGraph(graph, datasetID);
                    });
                  }
                  else{
                    if(graph.nodes[0].profile.length < 8000){
                      createTable(graph, datasetID, 'profiles', function(){
                        status('Loading tree...');
                        getPublicInfo(graph, datasetID, function(graph){
                          constructGraph(graph, datasetID);
                        });
                      });
                    }
                    else{
                      $('#profilec').css({'display':'none'});
                      $('#noProfiles').append('<p>Due to the large large profile length or number of profiles, table visualization is not available.</p>');
                      status('Loading tree...');
                      getPublicInfo(graph, datasetID, function(graph){
                        constructGraph(graph, datasetID);
                      });
                    }
                  }
                });

              //});
            //})
          }
          else {
              status('Loading tables...');
              $('#profilec').css({'display':'none'});
              $('#noProfiles').append('<p>Due to the large large profile length or number of profiles, table visualization is not available.</p>');

              createTable(graph, datasetID, 'isolates', function(){

                if (graph.data_type == 'fasta'){
                  status('Loading tree...');
                  getPublicInfo(graph, datasetID, function(graph){
                    constructGraph(graph, datasetID);
                  });
                }
                else{
                  status('Loading tree...');
                  getPublicInfo(graph, datasetID, function(graph){
                    constructGraph(graph, datasetID);
                  });
                }
              });
          }

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
    //alert('There was an error uploading the dataset. Possible input format error.');
    eraseDataset();
  }
  else{
    callback(graph);
  }
}


function createInput(datasetID, callback) {

  var input = {};

  function getInputPart(part, callback){
      
      $.ajax({
        url: '/api/utils/phylovizInput/' + part,
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
        },
        error: function(error){
          console.log(error);
        }
      });
  }

  function getStream(part, callback){

    var NodeStream = new EventSource('/api/utils/phylovizInput/' + part + '?dataset_id=' + datasetID);
    
    NodeStream.onopen = function(e){
      console.log(e);
    }

    /*
    NodeStream.addEventListener('message', function(data){
      console.log(data);
    });
    */

    var prevMessage = '';
    var count = 1;
    var partTS = '';

    NodeStream.onmessage = function(e){
      var toShow = '';


      if(!e){
        console.log('End of Connection');
        NodeStream.close();
        //callback('bah');
      }
      else{
        try{
          var data = JSON.parse(e.data);
          //console.log('parsed');
          var messageKey = Object.keys(data);
          
          if (prevMessage != messageKey[0]){
            partTS = messageKey[0];
            count = 1;
          }

          count += 1;
          if(data.hasOwnProperty('size')) totalSize = data.size;

          if (messageKey[0] == 'mergedNodes' || messageKey[0] == 'sameNodeHas' || messageKey[0] == 'usedLoci' || messageKey[0] == 'indexesToRemove'){
            status('Loading aditional data ' + String(count)+ ' of ' + totalSize + '...');
          }
          else status('Loading ' + partTS + ' ' + String(count)+ ' of ' + totalSize + '...');
          
          if(messageKey[0] == 'nodes' || messageKey[0] == 'subsetProfiles' || messageKey[0] == 'links' || messageKey[0] == 'distanceMatrix'){
            //console.log(messageKey[0]);
            if(input.hasOwnProperty(messageKey[0])) input[messageKey[0]].push(data[messageKey[0]][0]);
            else{
              input[messageKey[0]] = [];
              input[messageKey[0]].push(data[messageKey[0]][0]);
            }
          }
          else if (messageKey[0] == 'mergedNodes' || messageKey[0] == 'sameNodeHas' || messageKey[0] == 'usedLoci' || messageKey[0] == 'indexesToRemove'){
            
            //console.log(messageKey[0]);
            if(!input.hasOwnProperty(messageKey[0])) input[messageKey[0]] = {};
            var obkey = Object.keys(data[messageKey[0]])[0];
            input[messageKey[0]][obkey] = data[messageKey[0]][obkey];
          }
          else if(messageKey[0] != 'schemeGenes'){
            input[messageKey[0]] = data[messageKey[0]];
          }
          prevMessage = messageKey[0];
        }
        
        catch(err){
          console.log(data);
        }
        //console.log(data);
      }
    }
    
    NodeStream.onerror = function(e){
      NodeStream.close();
      console.log(e);
      callback();
    }
  }
  
  console.log('Aux');
  getInputPart('aux', function(data){
        input.key = data.key;
        input.data_type = data.data_type;
        input.dataset_name = data.dataset_name;
        input.schemeGenes = data.schemeGenes;

        if(input.data_type == 'newick'){
          getInputPart('newick', function(data){
            input.links = data.links;
            input.nodes = data.nodes;
            input.JSONnewick = data.JSONnewick;
            input.positions = data.positions;
            input.metadata = data.metadata;
            callback(input);
          });
        }
        else{
          console.log('Nodes');
          getStream('nodes', function(){

            if(input.hasOwnProperty('links')){
                console.log('Positions');
                getInputPart('positions', function(data){
                  input.positions = data.positions;
                  console.log('Metadata');
                  getInputPart('metadata', function(data){
                    if(data[0].metadata.length == 0) input.metadata = [];
                    else input.metadata = data[0].metadata;

                    callback(input);
                  });

                });
            }
            else{
              console.log('Links');
              getStream('links', function(){
                //input.links = data.links;
                console.log('Positions');
                getInputPart('positions', function(data){
                  input.positions = data.positions;
                  console.log('Metadata');
                  getInputPart('metadata', function(data){
                    if(data[0].metadata.length == 0) input.metadata = [];
                    else input.metadata = data[0].metadata;

                    callback(input);
                  });

                });
              
              });
            }

          });

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



