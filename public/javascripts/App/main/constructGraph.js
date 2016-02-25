function constructGraph(graph, datasetID){

    var graphObject = {

          graphInput: graph, //phyloviz input format
          graphGL: Viva.Graph.graph(), //graph format used by Vivagraph
          nodeColor: 0x009ee8, //default nodeColor for the application
          DefaultnodeSize: 25, //default node size for the application
          datasetID: datasetID, //id of the dataset
          width: width, //canvas width
          height: height, //canvas height
          prevSplitTreeValue: 0, //prev value used in splitTree method
          prevNLVvalue: 0, //prev value used in NLV graph method
          addedLinks: {}, //links added when we use NLV graph
          removedLinks: {} //links removed when we use SplitTree

    
    } 

    	var arrayOfNodesID = [], 
          metadataFilter = {},
          schemeFilter = {};

      graphObject.container = document.getElementById( 'visual' );

      var graphFunctions = loadGraphFunctions();  //Functions to be applied to the graphObject object. graphFunctions.js

      graphObject.graphFunctions = graphFunctions;

      graphFunctions.init(graphObject);
      graphFunctions.initLayout(graphObject);

      var iterations = graphObject.graphInput.nodes.length;

      if (Object.keys(graphObject.graphInput.positions).length == 0){
        graphFunctions.precompute(graphObject, iterations, function(){
          afterPrecompute();
        });
      }
      else afterPrecompute();

      

      function afterPrecompute(){

        graphFunctions.initGraphics(graphObject);
        graphFunctions.setPositions(graphObject);
        graphFunctions.generateDOMLabels(graphObject);
        graphFunctions.initRenderer(graphObject);
        graphFunctions.adjustScale(graphObject);
        graphFunctions.searchNodeByID(graphObject, '#nodeid');

        graphFunctions.launchGraphEvents(graphObject);

        var buttonFunctions = loadButtonFunctions(); //Functions to be applied to the graphObject object. buttonsFunctions.js

        buttonFunctions.numberOfNodes(graphObject);
        buttonFunctions.datasetName(graphObject);
        buttonFunctions.pauseButton(graphObject);
        buttonFunctions.graphicButtons(graphObject);
        buttonFunctions.operationsButtons(graphObject);
        buttonFunctions.resetPositionButton(graphObject);
        buttonFunctions.searchButton(graphObject);

        graphObject.graphGL.forEachNode(function(node){
          graphObject.layout.getBody(node.id).defaultMass = graphObject.layout.getBody(node.id).mass;
        });

        colorAttributes(graphObject); //function which links the colors of the pieCharts to the data
        //graphObject.layout.simulator.gravity(-1000)
        console.log(graphObject);
        linkTableAndGraph('isolates', graphObject); //link between operations from the tables and the graph tab
        linkTableAndGraph('profiles', graphObject);

        if (graphObject.graphInput.schemeGenes.length == 1 && graphObject.graphInput.schemeGenes[0] == 'undefined'){
          $("#TreeOperations").css('display', 'none');
          $("#computeDistances").css('display', 'none');
        }

        else buttonFunctions.profileLength(graphObject);

        if (graphObject.graphInput.data_type == 'newick') $("#logScaleDiv").css('display', 'none');

        tocheckTableIsolatesHeight = true;
        tocheckTableProfilesHeight = true;

        loaded = true;

        $('#buttonHelp').click(function(){
          $('#col_tutorial_main').toggle();
        });

        var tutorialFunctions = tutorial('col_tutorial_main');
        tutorialFunctions.tree();

        $('#assignc').on('click', function(){
          $('#GraphicsProperties').collapse("hide");
          $('#collapseOperations').collapse("hide");
        });

         $('#profilec').on('click', function(){
          $('#MetadataColor').collapse("hide");
        });

          $('#auxc').on('click', function(){
          $('#SchemeColor').collapse("hide");
        });

        $('#graphicp').on('click', function(){
          $('#collapseColor').collapse("hide");
          $('#collapseOperations').collapse("hide");
        });

        $('#treeop').on('click', function(){
          $('#collapseColor').collapse("hide");
          $('#GraphicsProperties').collapse("hide");
        });

        $('#nodesc').on('click', function(){
          $('#LayoutGraphics').collapse("hide");
          $('#LinksGraphics').collapse("hide");
        });

        $('#linksc').on('click', function(){
          $('#NodesGraphics').collapse("hide");
          $('#LayoutGraphics').collapse("hide");
        });

        $('#layoutc').on('click', function(){
          $('#NodesGraphics').collapse("hide");
          $('#LinksGraphics').collapse("hide");
        });

        $('#tabs li a').on('click', function(d){

          if($(d.target).text() == 'Auxiliary Data'){
            var tableToUse = $('#tableisolates').DataTable();
            tableToUse.columns.adjust().draw();
            tutorialFunctions.auxiliary();
          }else if($(d.target).text() == 'Profiles'){
            var tableToUse = $('#tableprofiles').DataTable();
            tableToUse.columns.adjust().draw();
            tutorialFunctions.profiles();
          }else if($(d.target).text() == 'Tree'){
            tutorialFunctions.tree();
          }else if($(d.target).text() == 'Distances'){
            tutorialFunctions.distances();
          }

          if(loaded && tocheckTableIsolatesHeight && $(d.target).text() == 'Auxiliary Data') {
            graphObject.tableIsolatesHeight = $("#tableisolates_wrapper").height();
            tocheckTableIsolatesHeight = false;
          }
          else if(loaded && tocheckTableProfilesHeight && $(d.target).text() == 'Profiles'){
            graphObject.tableProfilesHeight = $("#tableprofiles_wrapper").height();
            tocheckTableProfilesHeight = false;
          }

          if(graphObject.selectedNodes.length < 1 && $(d.target).text() == "Distances" && $('#divdistances').is(':empty')){
            if(graphObject.graphInput.data_type == "newick"){
              $('#noDistances').empty();
              $('#noDistances').append('<p>Distance Matrix is <b>NOT</b> available for <b>Newick</b> format input files.</p>')
            } 
            $('#noDistances').css({"display": "block"});
          }
          else $('#noDistances').css({"display": "none"});

          if(graphObject.graphInput.metadata.length < 1 && $(d.target).text() == "Auxiliary Data"){
            $('#noIsolates').css({"display": "block"});
          }
          else $('#noIsolates').css({"display": "none"});

          if((graphObject.graphInput.schemeGenes.length < 1 || graphObject.graphInput.schemeGenes[0] =="undefined") && $(d.target).text() == "Profiles"){
            $('#noProfiles').css({"display": "block"});
            $('#countProfileSize').css({"display": "none"});
            
          }
          else $('#noProfiles').css({"display": "none"});

        })

        $("#waitingGifMain").css('display', 'none');
        $(".tab-pane").css({'opacity': '1'});
        status("");

        //var map = new Datamap({
        //  element: document.getElementById('mapLocation'),
        //  width: graphObject.width,
        //  height: graphObject.height
        //});

        runColorPicker(graphObject);



      }



}