
var width = $('#col_visual').width(),
    height = $(document).height() - $('#col_toolbar').height();

$('#visual').css({width:width, height: height});

var colors = [
0x1f77b4ff, 0xaec7e8ff,
0xff7f0eff, 0xffbb78ff,
0x2ca02cff, 0x98df8aff,
0xd62728ff, 0xff9896ff,
0x9467bdff, 0xc5b0d5ff,
0x8c564bff, 0xc49c94ff,
0xe377c2ff, 0xf7b6d2ff,
0x7f7f7fff, 0xc7c7c7ff,
0xbcbd22ff, 0xdbdb8dff,
0x17becfff, 0x9edae5ff
                        ];


d3.json("./data/goeData.json", function(error, graph) {

	var arrayOfNodesID = [];

	var graphGL = Viva.Graph.graph();

	for (i in graph.nodes){
		graphGL.addNode(i, graph.nodes[i]);
	}

	for (j in graph.links){
		graphGL.addLink(graph.links[j].source,graph.links[j].target);
	}


	var layout = Viva.Graph.Layout.forceDirected(graphGL, {
	    springLength : 30,
	    springCoeff : 0.0003,
	    dragCoeff : 0.01,
	    gravity : -10,
	    theta: 0.8
  	});


	var graphics = Viva.Graph.View.webglGraphics();

	//var graphics = Viva.Graph.View.svgGraphics();

	// graphics.node(function(node) {
	 //	console.log(node);
 //       // The function is called every time renderer needs a ui to display node
 //       return Viva.Graph.svg('circle')
 //             .attr('width', 24)
 //             .attr('height', 24)
 //             // .link(node.data.url); // node.data holds custom object passed to graph.addNode();
    // });
    // .placeNode(function(nodeUI, pos){
    //     // Shift image to let links go to the center:
    //     nodeUI.attr('x', pos.x - 12).attr('y', pos.y - 12);
    // });

	 // graphics.node(function(node){
  //                      return Viva.Graph.View.webglSquare(1 + Math.random() * 10, colors[(Math.random() * colors.length) << 0]);
  //                  })

	//console.log(Viva.Graph.View);

	var events = Viva.Graph.webglInputEvents(graphics, graphGL);

	// events.mouseEnter(function (node) {
	//     console.log('Mouse entered node: ' + node.id);
	// }).mouseLeave(function (node) {
	//     console.log('Mouse left node: ' + node.id);
	// })
	events.dblClick(function (node) {
	    console.log('Double click on node: ' + node.id);
	}).click(function (node) {
	    console.log('Single click on node: ' + node.id);
	});

	graphGL.forEachNode(function (node) {
	  // layout here is instance of Viva.Graph.Layout.forceDirected or Viva.Graph.Layout.constant:
	  console.log(node);
	  arrayOfNodesID.push(node.id);
	});

	var renderer = Viva.Graph.View.renderer(graphGL,
	    {
	    	container  : document.getElementById( 'visual' ),
	    	layout : layout,
	        graphics : graphics
	    });

	renderer.run();


});