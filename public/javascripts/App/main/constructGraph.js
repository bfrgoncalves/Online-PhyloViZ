function constructGraph(graph, datasetID){

    var graphObject = {

          graphInput: graph,
          graphGL: Viva.Graph.graph(),
          nodeColor: 0x009ee8, // hex rrggbb
          DefaultnodeSize: 25,
          datasetID: datasetID,
          width: width,
          height: height,
          prevSplitTreeValue: 0,
          prevNLVvalue: 0,
          addedLinks: {},
          removedLinks: {},
    
    } 

    	var arrayOfNodesID = [], 
          metadataFilter = {},
          schemeFilter = {};

      graphObject.container = document.getElementById( 'visual' );

      var graphFunctions = loadGraphFunctions();

      graphFunctions.init(graphObject);
      graphFunctions.initLayout(graphObject);
      graphFunctions.initGraphics(graphObject);
      graphFunctions.setPositions(graphObject);
      graphFunctions.generateDOMLabels(graphObject);
      graphFunctions.initRenderer(graphObject);
      graphFunctions.adjustScale(graphObject);
      graphFunctions.searchNodeByID(graphObject, '#nodeid');

      graphFunctions.launchGraphEvents(graphObject);

      var buttonFunctions = loadButtonFunctions();

      buttonFunctions.numberOfNodes(graphObject);
      buttonFunctions.pauseButton(graphObject);
      buttonFunctions.graphicButtons(graphObject);
      buttonFunctions.operationsButtons(graphObject);
      buttonFunctions.searchButton(graphObject);

      colorAttributes(graphObject.graphInput, graphObject.graphics, graphObject.renderer); 

      linkTableAndGraph('isolates', graphObject.graphInput.key);
      linkTableAndGraph('profiles', graphObject.graphInput.key);


      $("#GIFimage").css('display', 'none');
      $("#waitingGifMain").css('display', 'none');
      status("");



}