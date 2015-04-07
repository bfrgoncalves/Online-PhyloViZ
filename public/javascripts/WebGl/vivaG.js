
var width = $(document).width(),
    height = $(document).height() - $('#navbarWebgl').height();

function onLoad(){

    $('#visual').css({width:width, height: height, position: "relative"});

    labels = d3.select('#visual').append('svg').attr('id','labels').attr('width',width).attr('height',height);

    // var zoom = d3.behavior.zoom().on("zoom", rescale(labels));

    // labels.call(zoom);


    $('#labels').bind('click', addLabels);

    $('#labels').css({position: "absolute", "z-index": 2, "pointer-events": "none"});

    constructGraph("./data/goeData.json");

}

function constructGraph(data){

    d3.json(data, function(error, graph) {

    	var arrayOfNodesID = [];

    	var graphGL = Viva.Graph.graph();

    	for (i in graph.nodes){
    		graphGL.addNode(i, graph.nodes[i]);
    	}

    	for (j in graph.links){
    		graphGL.addLink(graph.links[j].source,graph.links[j].target);
    	}

    	var nodeColor = 0x009ee8; // hex rrggbb
           DefaultnodeSize = 12;

    	var layout = Viva.Graph.Layout.forceDirected(graphGL, {
    	    springLength : 30,
    	    springCoeff : 0.0003,
    	    dragCoeff : 0.01,
    	    gravity : -10,
    	    theta: 0.8
      	});

        var graphicsOptions = {
            clearColor: true, // we want to avoid rendering artifacts
            clearColorValue: { // use black color to erase background
              r: 0,
              g: 0,
              b: 0,
              a: 1
            }
          };


    	var graphics = Viva.Graph.View.webglGraphics(graphicsOptions);

	// first, tell webgl graphics we want to use custom shader
    // to render nodes:
    var circleNode = buildCircleNodeShader();
    graphics.setNodeProgram(circleNode);

    // second, change the node ui model, which can be understood
    // by the custom shader:
    graphics.node(function (node) {

       return new WebglCircle(DefaultnodeSize+node.data.isolates.length, nodeColor);
    });


  var renderer = Viva.Graph.View.renderer(graphGL,
        {
            container  : document.getElementById( 'visual' ),
            layout : layout,
            graphics : graphics
        });

    renderer.run();

	var events = Viva.Graph.webglInputEvents(graphics, graphGL);

	events.mouseEnter(function (node) {
	     //console.log('Mouse entered node: ' + node.id);
	 }).mouseLeave(function (node) {
	     //console.log('Mouse left node: ' + node.id);
	 })
	events.dblClick(function (node) {
    //
	}).click(function (node, e) {
	    //console.log('Single click on node: ' + node.id);
        //renderer.pause();
        //addLabels(graphics, node);
        changeColor(graphics, node,renderer);
	});

    var multiSelectOverlay;

    document.addEventListener('keydown', function(e) {
    if (e.which === 16 && !multiSelectOverlay) { // shift key
      multiSelectOverlay = startMultiSelect(graphGL, renderer, layout);
    }
    });
      document.addEventListener('keyup', function(e) {
        if (e.which === 16 && multiSelectOverlay) {
          multiSelectOverlay.destroy();
          multiSelectOverlay = null;
        }
      });

    $('#searchForm').submit(function(e) {
                    e.preventDefault();
                    var nodeId = $('#nodeid').val();
                    centerNode(nodeId,graphGL,layout,renderer,graphics)
                });

    $('#pauseLayout').click(function(e) {
                    e.preventDefault();
                    console.log($('#pauseLayout'));
                    if($('#pauseLayout')[0].innerHTML == "Pause Layout"){
                      renderer.pause();
                      $('#pauseLayout')[0].innerHTML = "Resume Layout";
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
                    }
                    else{ 
                      renderer.resume();
                      $('#pauseLayout')[0].innerHTML = "Pause Layout";
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',false);
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',true);
                      
                    }
                    // var nodeId = $('#pauseLayout').val();
                    // centerNode(nodeId,graphGL,layout,renderer,graphics)
                });


    search_nodes(graph);

    });

}

    function changeColor(graphics,node,renderer) {
      var nodeUI = graphics.getNodeUI(node.id);
      //if (isInside(node.id, topLeft, bottomRight)) {
        nodeUI.color = 0xFFA500ff;
        nodeUI.size = 20;
        renderer.rerender();
      // } else {
      //   nodeUI.color = 0x009ee8ff;
      //   nodeUI.size = 10;
      // }
    }

	// graphGL.forEachNode(function (node) {
	//   // layout here is instance of Viva.Graph.Layout.forceDirected or Viva.Graph.Layout.constant:
	//   arrayOfNodesID.push(node.id);
	// });


function addLabels(graphics, node){
    var nodeUI = graphics.getNodeUI(node.id);
    pos = transformGraphToClient(nodeUI.position);

    d3.select('#labels').append('g').attr('class','labels').append('text').text(function(){
             return node.id;
         }).attr('x', pos.x).attr('y', pos.y).attr('fill', 'white');

}


function transformGraphToClient(nodePos) {
            //change graph coordinates to container coordinates
            nodePos.x = width /2 + nodePos.x;
            nodePos.y = height / 2 + nodePos.y;

            return nodePos;
}
