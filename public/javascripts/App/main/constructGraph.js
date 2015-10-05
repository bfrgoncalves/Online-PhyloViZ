function constructGraph(graph, datasetName){


      console.log(graph);

      NumberOfColors = graph.nodes.length;

      // for (var i=0;i<NumberOfColors;i++){
      //   ArrayOfColors.push(getRandomColor());
      // }

    	var arrayOfNodesID = [];

    	var graphGL = Viva.Graph.graph();
      var container = document.getElementById( 'visual' );

      console.log(idealSpringLength);

      var containerPosition = container.getBoundingClientRect();

    	for (i in graph.nodes){
    	 	graphGL.addNode(graph.nodes[i].key, graph.nodes[i]);
    	}

    	for (j in graph.links){
    	 	graphGL.addLink(graph.links[j].source,graph.links[j].target, { connectionStrength: idealSpringLength * graph.links[j].value });
    	}

    	var nodeColor = 0x009ee8, // hex rrggbb
           DefaultnodeSize = 25;


    	var layout = Viva.Graph.Layout.forceDirected(graphGL, {
    	    springLength : idealSpringLength,
    	    springCoeff : 0.0003,
    	    dragCoeff : 0.01,
    	    gravity : -10,
    	    theta: 0.8,

          // This is the main part of this example. We are telling force directed
          // layout, that we want to change length of each physical spring
          // by overriding `springTransform` method:
          springTransform: function (link, spring, idealSpringLength) {
            spring.length = link.data.connectionStrength;
          }
      	});


      if (Object.keys(graph.positions).length > 0){
        for (nodeLocation in graph.positions.nodes[0]){
          var nodeX = graph.positions.nodes[0][nodeLocation][0].x;
          var nodeY = graph.positions.nodes[0][nodeLocation][0].y;
          layout.setNodePosition(nodeLocation, nodeX, nodeY);
        }
      }

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
             if (node.id.search('TransitionNode') > -1) sizeToUse = 5;
             else sizeToUse = DefaultnodeSize+node.data.isolates.length;
             return new WebglCircle(sizeToUse, nodeColor, [1], [nodeColor], null);
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

      if (Object.keys(graph.positions).length > 0){
        renderer.pause();
        $('#pauseLayout')[0].innerHTML = "Resume Layout";
        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
      }



        // Final bit: most likely graph will take more space than available
        // screen. Let's zoom out to fit it into the view:
          var graphRect = layout.getGraphRect();
          var graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1);
          var screenSize = Math.min(document.body.clientWidth, document.body.clientHeight);

          var desiredScale = screenSize / graphSize;
        //  console.log(graphRect);
        zoomOut(desiredScale, 1, renderer);


        var events = Viva.Graph.webglInputEvents(graphics, graphGL);

        var ctrlDown = false, remakeSelection = false, multipleselection = false, selectedNodes = [];

        events.mouseEnter(function (node) {
             //console.log('Mouse entered node: ' + node.id);
         }).mouseLeave(function (node) {
             //console.log('Mouse left node: ' + node.id);
         })
        events.dblClick(function (node, e) {
          showInfo(graphics, node, e);
          //
        }).click(function (node, e) {

            if (ctrlDown) { // ctrl key
              selectedNodes = SelectNodes(selectedNodes, node, graphics);
            }
        });

          var multiSelectOverlay;

          document.addEventListener('keydown', function(e) {
          
            if (e.which === 16 && !multiSelectOverlay) { // shift key
              multipleselection = false;
              for (i in selectedNodes){
                var nodeToUse = graphics.getNodeUI(selectedNodes[i].id);
                nodeToUse.colorIndexes = nodeToUse.backupColor;
                nodeToUse.size = nodeToUse.backupSize;
              } 
              selectedNodes = [];
              
              multiSelectOverlay = startMultiSelect(graphGL, renderer, layout, selectedNodes);
            }

            if (e.which === 17){
              ctrlDown = true;
              if (!multipleselection ){
                for (i in selectedNodes){
                  var nodeToUse = graphics.getNodeUI(selectedNodes[i].id);
                  nodeToUse.colorIndexes = nodeToUse.backupColor;
                  nodeToUse.size = nodeToUse.backupSize;
                } 
                remakeSelection = false;
                selectedNodes = [];
              }
            }
          });
          document.addEventListener('keyup', function(e) {

            if (e.which === 16 && multiSelectOverlay) {
              multiSelectOverlay.destroy();
              multiSelectOverlay = null;

              graphGL.forEachNode(function(node){
                var currentNodeUI = graphics.getNodeUI(node.id);
                if (currentNodeUI.colorIndexes[0][0] == 0xFFA500ff) selectedNodes.push(node);
              });
              multipleselection = true;

            }

            if (e.which === 17){
              ctrlDown = false;
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
                      });

          $('#NodeSizeSlider').change(function(e){
            NodeSize(this.value, renderer, graph, graphics)
          });

          $('#LabelSizeSlider').change(function(e){
            LabelSize(this.value, graph, domLabels, graphics);
          });

          
          $('#distanceButton').click(function(e){
            if (selectedNodes.length < 2) alert('To compute distances, first you need to select more than one node.');
            else checkLociDifferences(selectedNodes);
          });

          $('#savePositionsButton').click(function(e){
            saveTreePositions(graphGL, layout, datasetName)
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