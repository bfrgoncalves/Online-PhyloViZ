
function loadGraphFunctions(){

	return {
		init: function(graphObject){

			var graph = graphObject.graphInput;
			var graphGL = graphObject.graphGL;
			var already_source = {};
			var maxLinkValue = 0;
			var countAddedNodes = 0;
			var maxNodeValue = 0;
			
			console.log(graph.nodes);
			for (i in graph.nodes){
				//console.log(graph.nodes[i]);
		        graph.nodes[i].idGL = countAddedNodes;
		        if (maxNodeValue < graph.nodes[i].isolates.length){
		        	maxNodeValue = graph.nodes[i].isolates.length;
		        }
		        graphGL.addNode(graph.nodes[i].key, graph.nodes[i]);
		        countAddedNodes++;
		    }

		    for (j in graph.links){
		    	if(graph.links[j].source == undefined || graph.links[j].target == undefined) continue;
		    	//console.log(graph.links[j].source, graph.links[j].target);
		        if (maxLinkValue < graph.links[j].value) maxLinkValue = graph.links[j].value;
		        var toBoot = graph.data_type == 'newick'? graph.links[j].bootstrap : "";
		        
		        if(already_source[graph.links[j].target] != true){
		        	graphGL.addLink(graph.links[j].source, graph.links[j].target, { connectionStrength: graph.links[j].value , value: graph.links[j].value, color: "#000", bootstrap: toBoot});
		        	already_source[graph.links[j].target] = true;
		        }
		        else{
		        	graphGL.addLink(graph.links[j].target, graph.links[j].source, { connectionStrength: graph.links[j].value , value: graph.links[j].value, color: "#000", bootstrap: toBoot});
		        	already_source[graph.links[j].source] = true;
		        }
		    }

		    maxLinkValue += 1;

		    graphObject.maxLinkValue = maxLinkValue;
		    graphObject.maxNodeValue = maxNodeValue;
		    graphObject.NodeScaleFactor = 1;

		},

		initLayout: function(graphObject){

			var idealSpringLength = 7;
			var graphGL = graphObject.graphGL;
			var graph = graphObject.graphInput;

			var maxLinked = 0;
    		var TopNode = '';
			
			graphObject.defaultLayoutParams = {
				springLength : idealSpringLength,
			    springCoeff : '1',
				dragCoeff : '1',
				gravity : '-10',
				theta: '8',
				massratio: '1',
				labelSize: '10',
				idealSpringLength: idealSpringLength
			}

			graphObject.layout = Viva.Graph.Layout.forceDirected(graphGL, {
						    	    springLength : idealSpringLength,
						    	    springCoeff : 0.0001,
						    	    dragCoeff : 0.001,
						    	    gravity : -10,
						    	    theta: 0.8,

							          // This is the main part of this example. We are telling force directed
							          // layout, that we want to change length of each physical spring
							          // by overriding `springTransform` method:
							          springTransform: function (link, spring) {
							            spring.length = graphObject.defaultLayoutParams.idealSpringLength * link.data.connectionStrength;
							          }
						      	});

			graphObject.graphGL.forEachNode(function(node){
		    		if(maxLinked < node.links.length){
		    			maxLinked = node.links.length;
		    			TopNode = node;
		    		}
				});

			graphObject.TopNode = TopNode;


			if (Object.keys(graph.positions).length == 0){

				graphObject.layout.setNodePosition(graphObject.graphInput.nodes[0].key, 20, -20);
		    	
		    	graphObject.layout.setNodePosition(graphObject.TopNode.id, 0, 0);
		    	graphObject.layout.pinNode(TopNode, true);
		    }
		    else{
		    	graphObject.layout.pinNode(TopNode, true);
		    }


		},

		initGraphics: function(graphObject){

			var graphicsOptions = {
	          clearColor: true, // we want to avoid rendering artifacts
	          clearColorValue: { // use black color to erase background
	            r: 255,
	            g: 255,
	            b: 255,
	            a: 1
	          }
	        };

			graphObject.graphics = Viva.Graph.View.webglGraphics(graphicsOptions);
			var graphics = graphObject.graphics;

			//var circleNode = buildCircleNodeShader();
			var circleNode = buildSimpleCircleNodeShader();
	        graphics.setNodeProgram(circleNode);
	        graphObject.currentNodeProgram = 'buildSimpleCircleNodeShader';

	        var DefaultnodeSize = graphObject.DefaultnodeSize;
	        var nodeColor = graphObject.nodeColor;

	        graphObject.nodeSizeOption = 'isolates';


	        graphics.node(function (node) {
	          //console.log(node);
	          //Check what causes
	          if(node.data == undefined){
	          	node.data = [];
	          	node.data.key = node.id;
	          	node.data.isolates = [];
	          }
	          if (node.id.search('TransitionNode') > -1) sizeToUse = 5;
	          else sizeToUse = DefaultnodeSize+(node.data.isolates.length * graphObject.NodeScaleFactor);
	          return new WebglCircle(sizeToUse, nodeColor, [1], [nodeColor], null);
	        });

	        graphics.link(function(link) {
	          return Viva.Graph.View.webglLine(link.data.color, link.id);
	        });

		},

		initRenderer: function(graphObject){

			var graphGL = graphObject.graphGL;

			graphObject.renderer = Viva.Graph.View.renderer(graphGL,
              {
                  container  : document.getElementById( 'visual' ),
                  layout : graphObject.layout,
                  graphics : graphObject.graphics

              });

        	graphObject.renderer.run();

		},

		setPositions: function(graphObject){

			var graph = graphObject.graphInput;
			var layout = graphObject.layout;

			//var graphSpace = graphObject.layout.getGraphRect();

			//var cx = (graphSpace.x2 + graphSpace.x1) / 2;
    		//var cy = (graphSpace.y2 + graphSpace.y1) / 2;

    		var maxLinked = 0;
    		//var TopNode = '';

			if (Object.keys(graph.positions).length > 0){
		        for (nodeLocation in graph.positions.nodes[0]){
		          var nodeX = graph.positions.nodes[0][nodeLocation][0].x;
		          var nodeY = graph.positions.nodes[0][nodeLocation][0].y;

		          layout.setNodePosition(nodeLocation, nodeX, nodeY);
		        }
		    }

		    nodePosition=graphObject.layout.getNodePosition(graphObject.TopNode.id);
			//graphObject.layout.setNodePosition(graphObject.TopNode.id, 0, 0);
			graphObject.renderer.moveTo(nodePosition.x,nodePosition.y);
			graphObject.graphFunctions.adjustScale(graphObject);
		},

		precompute: function myself(graphObject, iterations, callback) { //define name inside function to be able to call it from inside

			var layout = graphObject.layout;
	        // let's run 10 iterations per event loop cycle:
	        var i = 0;
	        //while (iterations > 0 && i < 1) {
	        layout.step();
	        iterations--;
	          //i++;
	        //}
	        //$('#processingElement').children().remove();
	        //$('#processingElement').append('<div><h3>Layout precompute: ' + iterations+'</h3></div>');
	        status('Layout precompute: ' + iterations); 
	        if (iterations > 0) {
	          setTimeout(function () {
	              myself(graphObject,iterations, callback);
	          }, 0); // keep going in next even cycle
	        } else {
	          // we are done!
	          //$('#processingElement').children().remove();
	          $("#waitingGifMain").css('display', 'none');
      		  $(".tab-pane").css({'opacity': '1'});
      		  status("");

    		  layout.simulator.dragCoeff(30 * 0.0001);
	          
	          callback();
	        }
        }, 



		generateDOMLabels: function(graphObject){

			var graphGL = graphObject.graphGL;
			var graphics = graphObject.graphics;
			var container = graphObject.container;

			var containerPosition = container.getBoundingClientRect();
			var header_height = $(".tabs_headers").height() + 5;

			var labelsContainer = document.createElement('div');
			labelsContainer.setAttribute("id", "labelsDiv");
			labelsContainer.setAttribute("position", "absolute");
			container.appendChild(labelsContainer);

			var nodeLabels = Object.create(null);
                  graphGL.forEachNode(function(node) {
                    if (node.id.search('TransitionNode') < 0){
                      var label = document.createElement('span');
                      label.classList.add('node-label');
                      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) label.textContent = node.id;
                      else label.innerText = node.id;
                      var labelStyle = label.style;
            		  labelStyle.fontSize = graphObject.defaultLayoutParams.labelSize + 'px';
                      nodeLabels[node.id] = label;
                      labelsContainer.appendChild(label);
                    }
                    
                  });

                  var countLinks = 0;
                  var treeLinks = {};

                  var linkLabels = Object.create(null);
                  graphGL.forEachLink(function(link) {
                      //console.log(link.id);
                      var label = document.createElement('span');
                      label.classList.add('link-label');
                      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) label.textContent = parseFloat(link.data.connectionStrength.toFixed(4));
                      else label.innerText = parseFloat(link.data.connectionStrength.toFixed(4));
                      var labelStyle = label.style;
            		  labelStyle.fontSize = graphObject.defaultLayoutParams.labelSize + 'px';
                      treeLinks[link.id] = true;
                      linkLabels[link.id] = label;
                      linkLabels[link.id + 'default'] = parseFloat(link.data.connectionStrength.toFixed(4));
                      labelsContainer.appendChild(label);
                      countLinks += 1;
                    
                    
                  });

                  graphObject.nodeLabels = nodeLabels;
                  graphObject.linkLabels = linkLabels;
                  graphObject.treeLinks = treeLinks;
                  // NOTE: If your graph changes over time you will need to
                  // monitor graph changes and update DOM elements accordingly
                  //return [nodeLabels, linkLabels, treeLinks];

                  graphObject.tovisualizeLabels = false;
		          graphObject.tovisualizeLinkLabels = false;

		          $('.node-label').css('display','none');
		          $('.link-label').css('display','none');


		          	graphics.placeNode(function(ui, pos) {
                  	  if (graphObject.tovisualizeLabels == false) return false;
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
	                  //console.log(ui);
	                  var nodeId = ui.node.id;
	                  if (nodeLabels[nodeId] != undefined){
	                  	var display = '', top= '', left='';
	                    //var labelStyle = nodeLabels[nodeId].style;
	                    left = (domPos.x + 0.01 * domPos.x)+ 'px';
	                    top = (domPos.y  +header_height)  + 'px';
	                    //labelStyle.position = 'absolute';


	                      if (domPos.y + containerPosition.top < containerPosition.top || domPos.y + containerPosition.top > containerPosition.bottom){
	                        display = "none";
	                      }
	                      else if (domPos.x + containerPosition.left < containerPosition.left || domPos.x + containerPosition.left*2 > containerPosition.right){
	                        display = "none";
	                      }
	                      else display = "block";

	                      var newStyle ="display: " + display + ";top: " + top + ";left: " + left + ";color:black;position:fixed;font-size:" + nodeLabels[nodeId].style.fontSize + ";";
	                      nodeLabels[nodeId].setAttribute('style', newStyle);
	                  }
                	});
					
		          	graphics.placeLink(function(ui, pos) {
		          		  if (graphObject.tovisualizeLinkLabels == false) return false;
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

		                  
		                  if (linkLabels[linkId] != undefined){
		                  	var display = '', top= '', left='';
		                    //var labelStyle = linkLabels[linkId].style;
		                    left = (domPos.x + 0.01 * domPos.x) + 'px';
		                    top = (domPos.y  +header_height)+ 'px';
		                    //labelStyle.position = 'absolute';
		                    //labelStyle.color = 'red';
		                    //console.log(labelStyle);
		                      if (domPos.y + containerPosition.top < containerPosition.top || domPos.y + containerPosition.top > containerPosition.bottom){
		                        display = "none";
		                      }
		                      else if (domPos.x + containerPosition.left < containerPosition.left || domPos.x + containerPosition.left*2 > containerPosition.right){
		                        display = "none";
		                      }
		                      else display = "block";

		                    var newStyle ="display: " + display + ";top: " + top + ";left: " + left + ";color:red;position:fixed;font-size:" + linkLabels[linkId].style.fontSize + ";";

							linkLabels[linkId].setAttribute('style', newStyle);
		                  }
		            });
		         
				
				function adjustLabelPositions(){
					containerPosition = container.getBoundingClientRect();
					header_height = $(".tabs_headers").height() + 5;
				}

				graphObject.adjustLabelPositions = adjustLabelPositions;
		},

		adjustScale: function(graphObject){

			var layout = graphObject.layout;
			var renderer = graphObject.renderer;

			var graphRect = layout.getGraphRect();
	        var graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1);
	        var screenSize = Math.min(document.body.clientWidth, document.body.clientHeight);

	        var desiredScale = screenSize / graphSize;
	        graphObject.renderer.pause();

	        zoomOut(desiredScale, 1, graphObject);
		},

		searchNodeByID: function(graphObject, inputID){

			var graph = graphObject.graphInput;

			for (var i = 0; i < graph.nodes.length - 1; i++) {
			    optArray.push(String(graph.nodes[i].key));
			    graphObject.graphInput.mergedNodes[graph.nodes[i].key].forEach(function(mergedNode){
					optArray.push(String(mergedNode.key));
				})
			}
			optArray = optArray.sort();
			

			$(function () {
			    $(inputID).autocomplete({
			       source: optArray
			    });
			});
		},

		mergedNode_positions_to_ids: function(graphObject, callback){

			mergedNodes = graphObject.graphInput.mergedNodes;
			original_position_to_id = {};

			for (x in mergedNodes){
				for(y in mergedNodes[x]) original_position_to_id[mergedNodes[x][y].position] = mergedNodes[x][y].key;
			}

			graphObject.graphInput.original_position_to_id = original_position_to_id;

			callback();
		},

		process_distance_matrix: function(graphObject){

			distanceMatrix = graphObject.graphInput.distanceMatrix;
			original_position_to_id = graphObject.graphInput.original_position_to_id;
			
			array_of_keys = Object.keys(original_position_to_id);

			array_of_keys = array_of_keys.sort(function(a, b){return b-a});

			console.log(array_of_keys);

			for(x in array_of_keys){
				distanceMatrix.splice(parseInt(array_of_keys[x]), 1);
			}
			/*for(x in original_position_to_id){
				distanceMatrix.splice(parseInt(x), 1);
			}*/
			count_lines = 0;

			for(y in distanceMatrix){
				for(z in array_of_keys){
					index_to_remove = parseInt(array_of_keys[z])-count_lines;
					if(index_to_remove > 0) distanceMatrix[y].splice(index_to_remove, 1);
				}
				count_lines += 1;
			}

			graphObject.graphInput.distanceMatrix = distanceMatrix;
		},

		launchGraphEvents: function(graphObject){

			var graphGL = graphObject.graphGL;
			var graphics = graphObject.graphics;
			var layout = graphObject.layout;
			var renderer = graphObject.renderer;

			var events = Viva.Graph.webglInputEvents(graphics, graphGL);

			graphObject.selectedNodes = [],
			graphObject.nodesToCheckLinks = [], 
			graphObject.toRemove = "";
			graphObject.multiSelectOverlay;


	        var shiftDown = false, altDown = false, remakeSelection = false, multipleselection = false, sdown = false;

	        events.mouseEnter(function (node, e) {
	        	var header_height = $(".tabs_headers").height() + 5;

	        	nodeUI_1 = graphics.getNodeUI(node.id);

	        	var domPos = {
                  x: nodeUI_1.position.x,
                  y: nodeUI_1.position.y
              };
              // And ask graphics to transform it to DOM coordinates:
              graphics.transformGraphToClientCoordinates(domPos);

              domPos.x = (domPos.x + nodeUI_1.size) + 'px';
		      domPos.y = (domPos.y  +header_height - 30)+ 'px';
	        	$('#popup_description').empty();
	        	$('#popup_description').append(showInfo(graphObject.graphInput.mergedNodes, graphics, node, e));
	        	$('#popup_description').css({'padding': '10px 10px 10px 10px', 'border':'1px solid grey', 'border-radius': '10px', 'background-color':'white','display':'block', 'left':domPos.x, 'top':domPos.y, 'position':'fixed', 'z-index':2});
	             //console.log('Mouse entered node: ' + node.id);
	         }).mouseLeave(function (node) {
	         	$('#popup_description').css({'display':'none'});
	             //console.log('Mouse left node: ' + node.id);
	         })
	        events.dblClick(function (node, e) {
	          //showInfo(graphics, node, e);
	          //
	        }).click(function (node, e) {

	            //if (altDown) getLinks(node, graphObject);
	            if (shiftDown) SelectNodes(node, graphObject);
	        });

	        //var multiSelectOverlay;

	          document.addEventListener('mouseup', function(e){

	         	if(graphics.hasOwnProperty('draggedNode')){
	         		if(graphObject.TopNode.data.key != graphics.draggedNode.data.key)
	          			layout.pinNode(graphics.draggedNode, false);
	         	}
	          });

	          document.addEventListener('keydown', function(e) {

	          	if(!graphObject.freezeSelection){

	          		if(e.which ==  16 && !shiftDown) graphObject.multiSelectOverlay = null;

		            if (e.which == 18) altDown = true;
		            if (e.which == 16) shiftDown = true;
		            
		            
		            if (shiftDown && e.which != 83) {
		              multipleselection = false;
		              for (i in graphObject.selectedNodes){
		                var nodeToUse = graphics.getNodeUI(graphObject.selectedNodes[i].id);
		                nodeToUse.colorIndexes = nodeToUse.backupColor;
		              } 
		              graphObject.selectedNodes = [];

		              if(graphObject.isLayoutPaused){
				        renderer.rerender();
				        //setTimeout(function(){ renderer.pause();}, 2);
				      }
		            }
		          
		            if (e.which === 83 && shiftDown && (!graphObject.multiSelectOverlay || !sdown)) { // shift key
		              multipleselection = false;
		              /*
		              for (i in graphObject.selectedNodes){
		                var nodeToUse = graphics.getNodeUI(graphObject.selectedNodes[i].id);
		                nodeToUse.colorIndexes = nodeToUse.backupColor;
		              } 

		              graphObject.selectedNodes = [];
		              */
		              /*
		              if(graphObject.isLayoutPaused){
				        renderer.resume();
				        setTimeout(function(){ renderer.pause();}, 5);
				      }
				      */
				      graphObject.sdown = true;
		              
		              graphObject.multiSelectOverlay = startMultiSelect(graphObject);
		            }
		            else graphObject.sdown = false;

		            if (e.which == 83) sdown = true;
		            

		            if (e.which === 16 && !sdown){
		              shiftDown = true;
		              if (!multipleselection ){
		                for (i in graphObject.selectedNodes){
		                  var nodeToUse = graphics.getNodeUI(graphObject.selectedNodes[i].id);
		                  nodeToUse.colorIndexes = nodeToUse.backupColor;
		                  //nodeToUse.size = nodeToUse.backupSize;
		                } 
		                remakeSelection = false;
		                graphObject.selectedNodes = [];

		                /*
		                if(graphObject.isLayoutPaused){
					        renderer.resume();
					        setTimeout(function(){ renderer.pause();}, 5);
					      }
					    */
		              }
		            }
		            if (e.which === 87){
		            	if (!graphObject.isLayoutPaused){
			            	renderer.pause();
			                graphObject.isLayoutPaused = true;
			                $('#pauseLayout')[0].innerHTML = "Resume Layout";
			                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
			                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
			            }
			            else{
			            	renderer.resume();
			                graphObject.isLayoutPaused = false;
			                $('#pauseLayout')[0].innerHTML = "Pause Layout";
			                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',false);
			                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',true);
			            }
		            }
		        }
	          });
	          document.addEventListener('keyup', function(e) {

	          	if(!graphObject.freezeSelection){

		            if (shiftDown) {
		              if(graphObject.multiSelectOverlay) graphObject.multiSelectOverlay.destroy();
		              //graphObject.multiSelectOverlay = null;
		              graphObject.selectedNodes = [];

		              if(graphObject.multiSelectOverlay) selectProperties = graphObject.multiSelectOverlay.selectedArea();

		              graphGL.forEachNode(function(node){
		                var currentNodeUI = graphics.getNodeUI(node.id);
		                if (currentNodeUI.colorIndexes[0][0] == 0xFFA500ff && node.id.indexOf('TransitionNode') < 0) graphObject.selectedNodes.push(node);
		              });
		              multipleselection = true;

		            }

		            if (e.which == 16){
		              shiftDown = false;
		            } 

		            if (e.which == 83){
		            	sdown = false;
		            }

		            if (e.which == 18){

		              altDown = false;
		              restoreLinkSearch(graphObject);
		              graphObject.nodesToCheckLinks = [];
		              toRemove = "";

		            }
		        }
	            
	          });
		}
	}
}