
var width = $(document).width(),
    height = $(document).height() - $('#navbarWebgl').height();

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

	var nodeColor = 0x009ee8; // hex rrggbb
       DefaultnodeSize = 12;

	var layout = Viva.Graph.Layout.forceDirected(graphGL, {
	    springLength : 30,
	    springCoeff : 0.0003,
	    dragCoeff : 0.01,
	    gravity : -10,
	    theta: 0.8
  	});


	var graphics = Viva.Graph.View.webglGraphics();

	// first, tell webgl graphics we want to use custom shader
    // to render nodes:
    var circleNode = buildCircleNodeShader();
    graphics.setNodeProgram(circleNode);

    // second, change the node ui model, which can be understood
    // by the custom shader:
    graphics.node(function (node) {
       return new WebglCircle(DefaultnodeSize+node.data.isolates.length, nodeColor);
    });

    // Lets start from the easiest part - model object for node ui in webgl
        function WebglCircle(size, color) {
            this.size = size;
            this.color = color;
        }

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


function buildCircleNodeShader() {
            // For each primitive we need 4 attributes: x, y, color and size.
            var ATTRIBUTES_PER_PRIMITIVE = 4,
                nodesFS = [
                'precision mediump float;',
                'varying vec4 color;',

                'void main(void) {',
                '   if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25) {',
                '     gl_FragColor = color;',
                '   } else {',
                '     gl_FragColor = vec4(0);',
                '   }',
                '}'].join('\n'),
                nodesVS = [
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute vec2 a_customAttributes;',
                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',
                'varying vec4 color;',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
                '   float c = a_customAttributes[0];',
                '   color.b = mod(c, 256.0); c = floor(c/256.0);',
                '   color.g = mod(c, 256.0); c = floor(c/256.0);',
                '   color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;',
                '   color.a = 1.0;',
                '}'].join('\n');

            var program,
                gl,
                buffer,
                locations,
                utils,
                nodes = new Float32Array(64),
                nodesCount = 0,
                canvasWidth, canvasHeight, transform,
                isCanvasDirty;

            return {
                /**
                 * Called by webgl renderer to load the shader into gl context.
                 */
                load : function (glContext) {
                    gl = glContext;
                    webglUtils = Viva.Graph.webgl(glContext);

                    program = webglUtils.createProgram(nodesVS, nodesFS);
                    gl.useProgram(program);
                    locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes', 'u_screenSize', 'u_transform']);

                    gl.enableVertexAttribArray(locations.vertexPos);
                    gl.enableVertexAttribArray(locations.customAttributes);

                    buffer = gl.createBuffer();
                },

                /**
                 * Called by webgl renderer to update node position in the buffer array
                 *
                 * @param nodeUI - data model for the rendered node (WebGLCircle in this case)
                 * @param pos - {x, y} coordinates of the node.
                 */
                position : function (nodeUI, pos) {
                    var idx = nodeUI.id;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.color;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = nodeUI.size;
                },

                /**
                 * Request from webgl renderer to actually draw our stuff into the
                 * gl context. This is the core of our shader.
                 */
                render : function() {
                    gl.useProgram(program);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                    }

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);

                    gl.drawArrays(gl.POINTS, 0, nodesCount);
                },

                /**
                 * Called by webgl renderer when user scales/pans the canvas with nodes.
                 */
                updateTransform : function (newTransform) {
                    transform = newTransform;
                    isCanvasDirty = true;
                },

                /**
                 * Called by webgl renderer when user resizes the canvas with nodes.
                 */
                updateSize : function (newCanvasWidth, newCanvasHeight) {
                    canvasWidth = newCanvasWidth;
                    canvasHeight = newCanvasHeight;
                    isCanvasDirty = true;
                },

                /**
                 * Called by webgl renderer to notify us that the new node was created in the graph
                 */
                createNode : function (node) {
                    nodes = webglUtils.extendArray(nodes, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
                    nodesCount += 1;
                },

                /**
                 * Called by webgl renderer to notify us that the node was removed from the graph
                 */
                removeNode : function (node) {
                    if (nodesCount > 0) { nodesCount -=1; }

                    if (node.id < nodesCount && nodesCount > 0) {
                        // we do not really delete anything from the buffer.
                        // Instead we swap deleted node with the "last" node in the
                        // buffer and decrease marker of the "last" node. Gives nice O(1)
                        // performance, but make code slightly harder than it could be:
                        webglUtils.copyArrayPart(nodes, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
                    }
                },

                /**
                 * This method is called by webgl renderer when it changes parts of its
                 * buffers. We don't use it here, but it's needed by API (see the comment
                 * in the removeNode() method)
                 */
                replaceProperties : function(replacedNode, newNode) {},
            };
        }