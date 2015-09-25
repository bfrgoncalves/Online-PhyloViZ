function constructGraph(graph){


      console.log(graph);

      NumberOfColors = graph.nodes.length;

      // for (var i=0;i<NumberOfColors;i++){
      //   ArrayOfColors.push(getRandomColor());
      // }

    	var arrayOfNodesID = [];

    	var graphGL = Viva.Graph.graph();
      var container = document.getElementById( 'visual' );

      var containerPosition = container.getBoundingClientRect();

      console.log(containerPosition);

    	for (i in graph.nodes){
    	 	graphGL.addNode(graph.nodes[i].key, graph.nodes[i]);
    	}

    	for (j in graph.links){
    	 	graphGL.addLink(graph.links[j].source,graph.links[j].target);
    	}

    	var nodeColor = 0x009ee8; // hex rrggbb
           DefaultnodeSize = 30;

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
            r: 255,
            g: 255,
            b: 255,
            a: 1
          }
        };


      // we need to compute layout, but we don't want to freeze the browser
      if (compute) precompute(parseInt(compute), renderGraph);
      else renderGraph();
      

      function precompute(iterations, callback) {
        // let's run 10 iterations per event loop cycle:
        var i = 0;
        while (iterations > 0 && i < 1) {
          layout.step();
          iterations--;
          i++;
        }
        $('#processingElement').children().remove();
        $('#processingElement').append('<div><h3>Layout precompute: ' + iterations+'</h3></div>');
        if (iterations > 0) {
          setTimeout(function () {
              precompute(iterations, callback);
          }, 0); // keep going in next even cycle
        } else {
          // we are done!
          $('#processingElement').children().remove();
          callback();
        }
      }


      function renderGraph(){

          var graphics = Viva.Graph.View.webglGraphics(graphicsOptions);

        // first, tell webgl graphics we want to use custom shader
          // to render nodes:

          var circleNode = buildCircleNodeShader();
          graphics.setNodeProgram(circleNode);

          // second, change the node ui model, which can be understood
          // by the custom shader:


          graphics.node(function (node) {
             return new WebglCircle(DefaultnodeSize+node.data.isolates.length, nodeColor, [1], [nodeColor], null);
          });

          var domLabels = generateDOMLabels(graphGL);
          var tovisualizeLabels = false;

          $('.node-label').css('display','none');

          function generateDOMLabels(graph) {
                  // this will map node id into DOM element
                  var labels = Object.create(null);
                  graph.forEachNode(function(node) {
                    var label = document.createElement('span');
                    label.classList.add('node-label');
                    label.innerText = node.id;
                    labels[node.id] = label;
                    container.appendChild(label);
                  });
                  // NOTE: If your graph changes over time you will need to
                  // monitor graph changes and update DOM elements accordingly
                  return labels;
                }

          graphics.placeNode(function(ui, pos) {
                  // This callback is called by the renderer before it updates
                  // node coordinate. We can use it to update corresponding DOM
                  // label position;

                  // we create a copy of layout position
                  var domPos = {
                      x: pos.x,
                      y: pos.y
                  };
                  // And ask graphics to transform it to DOM coordinates:
                  graphics.transformGraphToClientCoordinates(domPos);

                  // then move corresponding dom label to its own position:
                  var nodeId = ui.node.id;
                  var labelStyle = domLabels[nodeId].style;
                  labelStyle.left = domPos.x + 'px';
                  labelStyle.top = domPos.y  + 'px';
                  labelStyle.position = 'absolute';

                  if (tovisualizeLabels){

                    if (domPos.y + containerPosition.top < containerPosition.top || domPos.y + containerPosition.top > containerPosition.bottom){
                      labelStyle.display = "none";
                    }
                    else if (domPos.x + containerPosition.left < containerPosition.left || domPos.x + containerPosition.left*2 > containerPosition.right){
                      labelStyle.display = "none";
                    }
                    else labelStyle.display = "block";

                  }
                });


        var renderer = Viva.Graph.View.renderer(graphGL,
              {
                  container  : document.getElementById( 'visual' ),
                  layout : layout,
                  graphics : graphics

              });

          renderer.run();



        // Final bit: most likely graph will take more space than available
        // screen. Let's zoom out to fit it into the view:
          var graphRect = layout.getGraphRect();
          var graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1);
          var screenSize = Math.min(document.body.clientWidth, document.body.clientHeight);

          var desiredScale = screenSize / graphSize;
        //  console.log(graphRect);
        zoomOut(desiredScale, 1, renderer);


        var events = Viva.Graph.webglInputEvents(graphics, graphGL);

        events.mouseEnter(function (node) {
             //console.log('Mouse entered node: ' + node.id);
         }).mouseLeave(function (node) {
             //console.log('Mouse left node: ' + node.id);
         })
        events.dblClick(function (node, e) {
          showInfo(graphics, node, e);
          //
        }).click(function (node, e) {

            //console.log('Single click on node: ' + node.id);
              //renderer.pause();
              //addLabels(graphics, node);
              //changeColor(graphics, node,renderer);
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

          $('#numberOfNodes').append(' '+ graph.nodes.length);

          $('#pauseLayout').click(function(e) {
                          e.preventDefault();
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

          $('#NodeSizeSlider').change(function(e){
            NodeSize(this.value, renderer, graph, graphics)
          });

          $('#LabelSizeSlider').change(function(e){
            LabelSize(this.value, graph, domLabels, graphics);
          });

          $('#AddLabels').change(function(e){
            if (this.checked){
              $('.node-label').css('display','block');
              tovisualizeLabels = true;
            } 
            else{
              $('.node-label').css('display','none');
              tovisualizeLabels = false;
            } 
          });


          search_nodes(graph);
          colorAttributes(graph, graphics, renderer); 

          linkTableAndGraph('isolates');
          linkTableAndGraph('profiles');

      }


}