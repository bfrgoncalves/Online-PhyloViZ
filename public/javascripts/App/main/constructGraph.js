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

      graphFunctions.init(graphObject);
      graphFunctions.initLayout(graphObject);
      graphFunctions.initGraphics(graphObject);
      graphFunctions.setPositions(graphObject);
      graphFunctions.generateDOMLabels(graphObject);
      graphFunctions.initRenderer(graphObject);
      graphFunctions.adjustScale(graphObject);
      graphFunctions.searchNodeByID(graphObject, '#nodeid');

      graphFunctions.launchGraphEvents(graphObject); 

      var buttonFunctions = loadButtonFunctions(); //Functions to be applied to the graphObject object. buttonsFunctions.js

      buttonFunctions.numberOfNodes(graphObject);
      buttonFunctions.pauseButton(graphObject);
      buttonFunctions.graphicButtons(graphObject);
      buttonFunctions.operationsButtons(graphObject);
      buttonFunctions.searchButton(graphObject);

      colorAttributes(graphObject.graphInput, graphObject.graphics, graphObject.renderer); //function which links the colors of the pieCharts to the data

      linkTableAndGraph('isolates', graphObject.graphInput.key); //link between operations from the tables and the graph tab
      linkTableAndGraph('profiles', graphObject.graphInput.key);


      $("#GIFimage").css('display', 'none');
      $("#waitingGifMain").css('display', 'none');
      status("");



}