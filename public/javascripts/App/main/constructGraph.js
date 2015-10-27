function constructGraph(graph, datasetID){


      console.log(graph);

      NumberOfColors = graph.nodes.length;

      // for (var i=0;i<NumberOfColors;i++){
      //   ArrayOfColors.push(getRandomColor());
      // }

    	var arrayOfNodesID = [], 
          prevSplitTreeValue = 0,
          removedLinks = {},
          prevNLVvalue = 0,
          addedLinks = {},
          metadataFilter = {},
          schemeFilter = {};

    	var graphGL = Viva.Graph.graph();
      //var allGraph = Viva.Graph.graph();

      var container = document.getElementById( 'visual' );


      var containerPosition = container.getBoundingClientRect();
      var countAddedNodes = 0;
    	for (i in graph.nodes){
        //console.log(graph.nodes[i]);
        graph.nodes[i].idGL = countAddedNodes;
    	 	//allGraph.addNode(graph.nodes[i].key, graph.nodes[i]);
        graphGL.addNode(graph.nodes[i].key, graph.nodes[i]);
        countAddedNodes++;
    	}

      var maxLinkValue = 0;

    	for (j in graph.links){
        if (maxLinkValue < graph.links[j].value) maxLinkValue = graph.links[j].value;
    	 	//allGraph.addLink(graph.links[j].source, graph.links[j].target, { connectionStrength: graph.links[j].value , value: graph.links[j].value});
        graphGL.addLink(graph.links[j].source, graph.links[j].target, { connectionStrength: graph.links[j].value , value: graph.links[j].value, color: "#000"});
    	}

      maxLinkValue += 1;

      $("#SplitTreeSlider").attr({
         "max" : maxLinkValue,
         "value" : maxLinkValue 
      });

      $("#NLVnumber").attr({
         "max" : maxLinkValue,
         "value" : 0
      });

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
          springTransform: function (link, spring) {
            spring.length = idealSpringLength * link.data.connectionStrength;
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
            //console.log(node);
             if (node.id.search('TransitionNode') > -1) sizeToUse = 5;
             else sizeToUse = DefaultnodeSize+node.data.isolates.length;
             return new WebglCircle(sizeToUse, nodeColor, [1], [nodeColor], null);
          });

          graphics.link(function(link) {
             return Viva.Graph.View.webglLine(link.data.color, link.id);
         });


          var domLabels = generateDOMLabels(graphGL);

          var nodeLabels = domLabels[0];
          var linkLabels = domLabels[1];
          var treeLinks = domLabels[2];
          var tovisualizeLabels = false;
          var tovisualizeLinkLabels = false;

          $('.node-label').css('display','none');
          $('.link-label').css('display','none');


          function generateDOMLabels(graph) {
                  // this will map node id into DOM element
                  var nodeLabels = Object.create(null);
                  graph.forEachNode(function(node) {
                    if (node.id.search('TransitionNode') < 0){
                      var label = document.createElement('span');
                      label.classList.add('node-label');
                      label.innerText = node.id;
                      nodeLabels[node.id] = label;
                      container.appendChild(label);
                    }
                    
                  });

                  var countLinks = 0;

                  var treeLinks = {};

                  var linkLabels = Object.create(null);
                  graph.forEachLink(function(link) {
                      //console.log(link.id);
                      var label = document.createElement('span');
                      label.classList.add('link-label');
                      label.innerText = parseFloat(link.data.connectionStrength.toFixed(4));
                      treeLinks[link.id] = true;
                      linkLabels[link.id] = label;
                      container.appendChild(label);
                      countLinks += 1;
                    
                    
                  });
                  // NOTE: If your graph changes over time you will need to
                  // monitor graph changes and update DOM elements accordingly
                  return [nodeLabels, linkLabels, treeLinks];
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
                  if (nodeLabels[nodeId] != undefined){
                    var labelStyle = nodeLabels[nodeId].style;
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
                  }
                });

          graphics.placeLink(function(ui, pos) {
                  // This callback is called by the renderer before it updates
                  // node coordinate. We can use it to update corresponding DOM
                  // label position;
                  newX = (ui.pos.from.x + ui.pos.to.x) / 2;
                  newY = (ui.pos.from.y + ui.pos.to.y) / 2;

                  // we create a copy of layout position

                  var domPos = {
                      x: newX,
                      y: newY,
                  };
                  // And ask graphics to transform it to DOM coordinates:
                  graphics.transformGraphToClientCoordinates(domPos);

                  // then move corresponding dom label to its own position:
                  var linkId = ui.idGL;
                  //console.log(ui);

                  if (linkLabels[linkId] != undefined){
                    var labelStyle = linkLabels[linkId].style;
                    labelStyle.left = domPos.x + 'px';
                    labelStyle.top = domPos.y  + 'px';
                    labelStyle.position = 'absolute';
                    labelStyle.color = 'red';
                    //console.log(labelStyle);

                    if (tovisualizeLinkLabels){

                      if (domPos.y + containerPosition.top < containerPosition.top || domPos.y + containerPosition.top > containerPosition.bottom){
                        labelStyle.display = "none";
                      }
                      else if (domPos.x + containerPosition.left < containerPosition.left || domPos.x + containerPosition.left*2 > containerPosition.right){
                        labelStyle.display = "none";
                      }
                      else labelStyle.display = "block";

                    }
                  }
                });


        var renderer = Viva.Graph.View.renderer(graphGL,
              {
                  container  : document.getElementById( 'visual' ),
                  layout : layout,
                  graphics : graphics

              });

        renderer.run();

      //loopGraph(allGraph, graphGL, graph);

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

        var ctrlDown = false, altDown = false, remakeSelection = false, multipleselection = false, selectedNodes = [], nodesToCheckLinks = [], toRemove = "";

        events.mouseEnter(function (node) {
             //console.log('Mouse entered node: ' + node.id);
         }).mouseLeave(function (node) {
             //console.log('Mouse left node: ' + node.id);
         })
        events.dblClick(function (node, e) {
          showInfo(graphics, node, e);
          //
        }).click(function (node, e) {

            //console.log(e.which);

            if (altDown){
              nodesToCheckLinks, toRemove = getLinks(nodesToCheckLinks, node, graphics, graphGL, toRemove);
            }

            else if (ctrlDown) { // ctrl key
              selectedNodes = SelectNodes(selectedNodes, node, graphics);
            }
        });

          var multiSelectOverlay;

          document.addEventListener('keydown', function(e) {

            if (e.which == 18) altDown = true;
          
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

            if (e.which == 18){
              altDown = false;
              nodesToCheckLinks, toRemove = restoreLinkSearch(nodesToCheckLinks, graphics, toRemove);
              nodesToCheckLinks = [];
              toRemove = "";

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

          $('#NodeLabelSizeSlider').change(function(e){
            LabelSize(this.value, graph, nodeLabels, graphics, 'node');
          });
          $('#LinkLabelSizeSlider').change(function(e){
            LabelSize(this.value, graph, linkLabels, graphics, 'link');
          });

          $('#SplitTreeSlider').change(function(e){
            removedLinks, prevSplitTreeValue = splitTree(graphGL, graphics, removedLinks, this.value, prevSplitTreeValue, linkLabels, tovisualizeLinkLabels, treeLinks);
          });

          $('#NLVnumber').change(function(e){
            addedLinks, prevNLVvalue = NLVgraph(graphGL, graph, graphics, this.value, addedLinks, prevNLVvalue, treeLinks);
          });

          
          $('#distanceButton').click(function(e){
            if (selectedNodes.length < 2) alert('To compute distances, first you need to select more than one node.');
            else checkLociDifferences(selectedNodes);
          });

          $('#savePositionsButton').click(function(e){
            saveTreePositions(graphGL, layout, datasetID)
          });

          $('#generatePublicLinkButton').click(function(e){
            generatePublicLink(datasetID);
          });

          $('#saveImageButton').click(function(e){
            var canvas = document.getElementById("canvas");
            var img    = canvas.toDataURL("image/png");

            $('#imageDownloadLocation').attr('href', img);
            document.getElementById("imageDownloadLocation").click();

            //console.log($('#imageLocation'));
            //$('#imageLocation').append("<img src="+img+" />")
            //console.log(img);
            //document.write('<img src="'+img+'"/>');
          });

          $('#saveImageButton1').click(function(e){
            printDiv(width, height);
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
          $('#AddLinkLabels').change(function(e){
            if (this.checked){
              $('.link-label').css('display','block');
              for (i in removedLinks){
                var labelStyle = linkLabels[removedLinks[i].id].style;
                labelStyle.display = "none";
              }
              tovisualizeLinkLabels = true;
            } 
            else{
              $('.link-label').css('display','none');
              tovisualizeLinkLabels = false;
            } 
          });


          search_nodes(graph);
          colorAttributes(graph, graphics, renderer); 

          linkTableAndGraph('isolates', graph.key);
          linkTableAndGraph('profiles', graph.key);

          //createDistanceTable(graph);

      }


}