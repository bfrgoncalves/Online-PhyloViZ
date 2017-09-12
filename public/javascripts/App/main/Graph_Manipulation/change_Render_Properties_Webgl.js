
function setNewProgram(graphObject, newProgram){
     var newCircleNode = newProgram();
     var prevProgram = graphObject.graphics.getNodeProgram();
     var currentContext = graphObject.graphics.getgl();
     var canvasSize = graphObject.graphics.getWidthAndHeight();

     graphObject.graphics.setNodeProgram(newCircleNode);
     graphObject.currentNodeProgram = newProgram.name;
     newCircleNode.load(currentContext, graphObject.graphInput.nodes.length);
     newCircleNode.updateSize(canvasSize[0] / 2, canvasSize[1] / 2);
     graphObject.graphics.transformUniform();
}

//adjust Node Size
function NodeSize(newSize, max, graphObject){

    var renderer = graphObject.renderer;
    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;

    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);

        if (graphObject.isLogScaleNodes) nodeUI.size = (Math.log10(nodeUI.backupSize) * graphObject.DefaultnodeSize) + (nodeUI.backupSize * 2 * (parseInt(newSize) / parseInt(max)));
        else nodeUI.size = nodeUI.backupSize + (nodeUI.backupSize * 2 * (parseInt(newSize) / parseInt(max))); 
    });

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }
    else renderer.resume();
}

function ChangeNodeSizeOption(graphObject, option){

    graphObject.nodeSizeOption = option;
    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;

    $("#NodeSizeSlider").val(1);
    $("#scaleNode").val(1);

     graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);

        if(option == 'isolates'){
            nodeUI.size = graphObject.DefaultnodeSize+(node.isolates.length * graphObject.NodeScaleFactor);
        }
        else if (option == 'profiles'){
            nodeUI.size = graphObject.DefaultnodeSize+(graphObject.graphInput.mergedNodes[node.key].length * graphObject.NodeScaleFactor);
        }


    });

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }
    else renderer.resume();
}

//adjust Node Size
function LabelSize(newSize, graphObject, domLabels, type){

    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;

    if (type == 'node'){
        graph.nodes.forEach(function(node){
            var labelStyle = domLabels[node.key].style;
            labelStyle.fontSize = String(newSize) + 'px';
        });
    }
    else if (type == 'link'){
        graph.links.forEach(function(link){
            ID = link.source + "👉 " + link.target;
            var labelStyle = domLabels[ID].style;
            labelStyle.fontSize = String(newSize) + 'px';
        });
    }
    
    
}

function changeLogScale(graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    if(!graphObject.isLogScale) $("#SpringLengthSlider").val(1);

    if(graphObject.isLogScale) $('#isLogScaleOn').text('On');
    if(!graphObject.isLogScale) $('#isLogScaleOn').text('Off');

    graphGL.forEachLink(function(link){
            
            var linkUI = graphGL.getLink(link.fromId, link.toId);

            var spring = layout.getSpring(link.fromId, link.toId);

            if (graphObject.isLogScale && spring.length > 1) spring.length = Math.log10(spring.length);
            else if(graphObject.isLogScale) spring.length = spring.length;
            else spring.length = graphObject.defaultLayoutParams.springLength * linkUI.data.connectionStrength;

        })
}

function changeLogScaleNodes(graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    if(!graphObject.isLogScaleNodes){
        $("#NodeSizeSlider").val(1);
        $("#scaleNode").val(1);
    }

    if(graphObject.isLogScaleNodes) $('#isLogScaleNodesOn').text('On');
    if(!graphObject.isLogScaleNodes) $('#isLogScaleNodesOn').text('Off');

    graphGL.forEachNode(function(node){

            var nodeUI = graphObject.graphics.getNodeUI(node.id);

            if (graphObject.isLogScaleNodes) nodeUI.size = Math.log10(nodeUI.backupSize) * graphObject.DefaultnodeSize;
            else{
                nodeUI.backupSize = graphObject.DefaultnodeSize + (node.data.isolates.length * graphObject.NodeScaleFactor);
                nodeUI.size = nodeUI.backupSize;
            }


    });

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }
}

function changeSpringLength(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    graphGL.forEachLink(function(link){

            var linkUI = graphGL.getLink(link.fromId, link.toId);

            var spring = layout.getSpring(link.fromId, link.toId);

            if (graphObject.isLogScale && spring.length > 1) spring.length = graphObject.defaultLayoutParams.springLength * (Math.log10(1 + linkUI.data.value) + (20 * Math.log10(1 + linkUI.data.value * (newValue/max))));
            else if(graphObject.isLogScale) spring.length = spring.length;
            else spring.length = graphObject.defaultLayoutParams.springLength * (linkUI.data.value + (20 * (1 + Math.log10(linkUI.data.value)) * (newValue/max)));

    })


}

function changeDragCoefficient(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.dragCoeff(parseInt(newValue) * 0.001);

}

function changeSpringCoefficient(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.springCoeff(parseInt(newValue) * 0.0001);


}

function changeGravity(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.gravity(parseInt(newValue));

}

function changeTheta(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.theta(parseInt(newValue) * 0.1);

}

function changeMass(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;


    graphObject.graphGL.forEachNode(function(node){
        if(parseInt(newValue) == 1) graphObject.layout.getBody(node.id).mass = graphObject.layout.getBody(node.id).defaultMass;
        else graphObject.layout.getBody(node.id).mass = graphObject.layout.getBody(node.id).defaultMass * ((graphObject.layout.getBody(node.id).defaultMass / parseFloat(newValue)));
    });

}

function linkThickness(newSize, renderer, graph, graphics){

	graph.links.forEach(function(link){
	        var linkUI = graphics.getLinkUI();
	    })

}

function scaleLink(newScale, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    if(newScale < 1) newScale = 1;

    var prevScale = graphObject.defaultLayoutParams.springLength;

    graphObject.defaultLayoutParams.springLength = newScale;

    graph.links.forEach(function(link){

            var linkUI = graphGL.getLink(link.source, link.target);
            var spring = layout.getSpring(link.source, link.target);
            prevValue = spring.length;
            spring.length = graphObject.defaultLayoutParams.springLength * (spring.length / prevScale);

        })

}

function scaleNodes(newNodeScaleFactor, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    graphObject.NodeScaleFactor = newNodeScaleFactor * 0.5;
    $("#NodeSizeSlider").val(1);

    graphGL.forEachNode(function(node){
            var nodeUI = graphObject.graphics.getNodeUI(node.id);
            if(graphObject.nodeSizeOption == 'isolates') valueToUse = node.data.isolates.length;
            else if(graphObject.nodeSizeOption == 'profiles') valueToUse = graph.mergedNodes[node.data.key].length;
            if (graphObject.isLogScaleNodes) nodeUI.backupSize = Math.log10(nodeUI.backupSize) * graphObject.DefaultnodeSize + (valueToUse * graphObject.NodeScaleFactor);
            else nodeUI.backupSize = graphObject.DefaultnodeSize + (valueToUse * graphObject.NodeScaleFactor);
            nodeUI.size = nodeUI.backupSize;

    });

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }

}

function splitTree(graphObject, value) {
    //console.log(linkLabels);
    var graph = graphObject.graphGL;
    var graphics = graphObject.graphics;
    var removedLinks = graphObject.removedLinks;
    var prevValue = graphObject.prevSplitTreeValue;
    var linkLabels = graphObject.linkLabels;
    var tovisualizeLinkLabels = graphObject.tovisualizeLinkLabels;
    var treeLinks = graphObject.treeLinks;
    var renderer = graphObject.renderer;

    value = parseInt(value);
    if (value < prevValue){
        graph.forEachNode(function(node){
            graph.forEachLinkedNode(node.id, function(linkedNode, link) { 
                if (link.data.value >= value){
                    if (treeLinks.hasOwnProperty(link.id)){
                        var labelStyle = linkLabels[link.id].style;
                        labelStyle.display = "none";
                        removedLinks[link.id] = link;
                        graph.removeLink(link);
                    }
                }
             });
        });

    }
    else{
        for (i in removedLinks){
            if (removedLinks[i].data.value < value) {
                graph.addLink(removedLinks[i].fromId, removedLinks[i].toId, removedLinks[i].data);
                if (tovisualizeLinkLabels){
                    var labelStyle = linkLabels[removedLinks[i].id].style;
                    labelStyle.display = "block";
                }
                delete removedLinks[i];
            }    
        }
    }
    prevValue = value;

    if(graphObject.isLayoutPaused){
        renderer.rerender();
        //setTimeout(function(){ renderer.pause();}, 50);
    }

    graphObject.removedLinks = removedLinks;
    graphObject.prevSplitTreeValue = prevValue;
    changeLogScale(graphObject);

}

function changeColorToOuterRing(graphObject){

     if(graphObject.hasMultipleFields) graphObject.multipleOnOuterRing = true;
     else graphObject.multipleOnOuterRing = false;

     graphObject.graphInput.nodes.forEach(function(node){
        var nodeUI = graphObject.graphics.getNodeUI(node.key);
        
        nodeUI.outercolorIndexes = nodeUI.colorIndexes;
        nodeUI.outerdata = nodeUI.data;
        

        nodeUI.colorIndexes = nodeUI.colorIndexes.map(function(d){
            return d.map(function(){
                return graphObject.nodeColor;
            });
        });
    });

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }



    $( "#cloneLegendPie" ).empty();
    $( "#legendcurrentpiePlace" ).clone().appendTo( "#cloneLegendPie" );
    
}


function NLVgraph(graphObject, value) {

    var graphGL = graphObject.graphGL;
    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;
    var addedLinks = graphObject.addedLinks;
    var prevValue = graphObject.prevNLVvalue;
    var treeLinks = graphObject.treeLinks;
    var renderer = graphObject.renderer;

    value = parseFloat(value);

    if (value < prevValue){
        for (i in addedLinks){
            if (addedLinks[i].data.value > value) {
                graphGL.removeLink(addedLinks[i]);
                delete addedLinks[i];
            }    
        }
    }
    else{

        countNodes = 0;
        nodesLength = graph.nodes.length;

        graphGL.forEachNode(function(node){
            //console.log(countNodes);

            if(node.id.indexOf('TransitionNode') < 0) {
                for (i=1; i<graph.distanceMatrix[countNodes].length; i++){
                    if (graph.distanceMatrix[countNodes][i] <= value && graph.distanceMatrix[countNodes][i] != 0){

                        targetIndex = parseInt(countNodes) + parseInt(i);
                        
                        /*sourceKey = graph.original_position_to_id[String(countNodes)] == undefined ? graph.nodes[countNodes].key : graph.original_position_to_id[String(countNodes)];
                        targetKey = graph.original_position_to_id[String(targetIndex)] == undefined ? graph.nodes[targetIndex].key : graph.original_position_to_id[String(targetIndex)]
                        
                        sourceKey = graph.sameNodeHas[sourceKey];
                        targetKey = graph.sameNodeHas[targetKey];*/

                        console.log(countNodes, targetIndex);

                        sourceKey = graph.nodes[countNodes].key;
                        targetKey = graph.nodes[targetIndex].key;

                        //console.log(countNodes, i, targetIndex, sourceKey, targetKey, graph.original_position_to_id);
                        if(targetKey.indexOf('TransitionNode') < 0){

                            LinkID = sourceKey + "👉 " + targetKey;
                            LinkID_reverse = targetKey + "👉 " + sourceKey;

                            if (addedLinks.hasOwnProperty(LinkID)){
                                continue;
                            }
                            if (!treeLinks.hasOwnProperty(LinkID) && !treeLinks.hasOwnProperty(LinkID_reverse)){
                                graphGL.addLink(sourceKey, targetKey, { connectionStrength: graph.distanceMatrix[countNodes][i] , value: graph.distanceMatrix[countNodes][i], color: "#00ff00"});
                                var link = graphGL.getLink(sourceKey, targetKey);

                                addedLinks[LinkID] = link;
                            }

                        }
                    }
                }
            }

            if (nodesLength > countNodes+2) countNodes += 1;
        });
    }
    prevValue = value;

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }

    graphObject.addedLinks = addedLinks;
    graphObject.prevNLVvalue = prevValue;
    changeLogScale(graphObject);

}

function NLVcollapse(graphObject, value) {

    var graphGL = graphObject.graphGL;
    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;
    var addedLinks = graphObject.addedLinks;
    var prevValue = graphObject.prevNLVCollapsevalue;
    var treeLinks = graphObject.treeLinks;
    var renderer = graphObject.renderer;


    var nodes_at_distance = graphObject.nodes_at_distance == undefined ? {} : graphObject.nodes_at_distance;
    var links_at_distance = graphObject.links_at_distance == undefined ? {} : graphObject.links_at_distance;
    var merged_at_distance = graphObject.merged_at_distance == undefined ? {} : graphObject.merged_at_distance;

    var nodes_to_remove = [];
    var links_to_remove = [];
    var links_to_add = [];
    var to_same_node_as = [];
    var already_merged = {};

    value = parseFloat(value);

    console.log(nodes_at_distance, links_at_distance, prevValue);

    if (value < prevValue && nodes_at_distance[prevValue] != undefined && links_at_distance[prevValue] != undefined){
        
        for (i in links_at_distance[prevValue]["remove"]){
            var link = graphGL.getLink(links_at_distance[prevValue]["remove"][i][0], links_at_distance[prevValue]["remove"][i][1]);
            graphGL.removeLink(link); 
        }
        console.log(nodes_at_distance[prevValue]);
        for(k in nodes_at_distance[prevValue]){
            graph.sameNodeHas[nodes_at_distance[prevValue][k][1].id] = nodes_at_distance[prevValue][k][2];
            var node_to_change = graphGL.getNode(nodes_at_distance[prevValue][k][0].id);
            graphGL.addNode(nodes_at_distance[prevValue][k][1].id, nodes_at_distance[prevValue][k][1].data)
            node_to_change.data.isolates = nodes_at_distance[prevValue][k][0].data.isolates;
            graph.mergedNodes[graph.sameNodeHas[nodes_at_distance[prevValue][k][1].id]] = nodes_at_distance[prevValue][k][3];
            graph.mergedNodes[graph.sameNodeHas[nodes_at_distance[prevValue][k][0].id]] = nodes_at_distance[prevValue][k][4];
        }
        for (j in links_at_distance[prevValue]["add"]){
            graphGL.addLink(links_at_distance[prevValue]["add"][j].fromId, links_at_distance[prevValue]["add"][j].toId, links_at_distance[prevValue]["add"][j].data);
        }
    }
    else{

        countNodes = 0;
        nodesLength = graph.nodes.length;

        graphGL.forEachNode(function(node){

            if(node != undefined && node.id.indexOf('TransitionNode') < 0) {
                //id_to_use = graph.sameNodeHas[node.id];
                id_to_use = node.id;
                //to_same_node_as = [];

                graphGL.forEachLinkedNode(id_to_use, function(linkedNode, link){
                  if(link.data.connectionStrength === value){

                    if(nodes_to_remove.indexOf(linkedNode.id) < 0 && already_merged[linkedNode.id] === undefined){
                        nodes_to_remove.push(linkedNode.id);
                        to_same_node_as.push([linkedNode.id, id_to_use]);
                        already_merged[id_to_use] = true;
                        
                        graphGL.forEachLinkedNode(linkedNode.id, function(linkedNode2, link2){
                            if(nodes_to_remove.indexOf(linkedNode2.id) < 0 && id_to_use !== linkedNode2.id){
                                LinkID = id_to_use + "👉 " + linkedNode2.id;
                                links_to_add.push([id_to_use, linkedNode2.id, { connectionStrength: link2.data.connectionStrength , value: link2.data.connectionStrength, color: "#00ff00"}, LinkID]);
                            }
                        });
                        links_to_remove.push(link);
                    }
                  }
                });


                
            }
        });

        //To get the status of links at each level
        nodes_at_distance[value] = [];
        merged_at_distance[value] = {};

        for(p in to_same_node_as){
            prev_sameNode_has = graph.sameNodeHas[to_same_node_as[p][0]];
            node_to_change = graphGL.getNode(graph.sameNodeHas[to_same_node_as[p][1]]);
            node_to_merge = graphGL.getNode(graph.sameNodeHas[to_same_node_as[p][0]]);
            
            slice_merge = graph.mergedNodes[graph.sameNodeHas[to_same_node_as[p][0]]].slice(0);
            slice_change = graph.mergedNodes[graph.sameNodeHas[to_same_node_as[p][1]]].slice(0);

            if(merged_at_distance[value][node_to_change.id] == undefined) merged_at_distance[value][node_to_change.id] = slice_change;

            console.log("change", slice_change);
            console.log("merge", slice_merge);
            //To get the status of nodes at each level
            nodes_at_distance[value].push([node_to_change, node_to_merge, prev_sameNode_has, slice_merge, merged_at_distance[value][node_to_change.id]]);
            
            node_to_change.data.isolates = node_to_change.data.isolates.concat(node_to_merge.data.isolates);
            
            graph.sameNodeHas[to_same_node_as[p][0]] = graph.sameNodeHas[to_same_node_as[p][1]];
            graph.mergedNodes[graph.sameNodeHas[to_same_node_as[p][1]]] = graph.mergedNodes[graph.sameNodeHas[to_same_node_as[p][1]]].concat(node_to_merge.data);
        }

        for(k in links_to_add){
            links_to_add[k][0] = graph.sameNodeHas[links_to_add[k][0]];
            links_to_add[k][1] = graph.sameNodeHas[links_to_add[k][1]];
            graphGL.addLink(links_to_add[k][0], links_to_add[k][1], links_to_add[k][2])
        }

        links_at_distance[value] = {"add": links_to_remove, "remove": links_to_add};

        for(n in nodes_to_remove){
            graphGL.forEachLinkedNode(nodes_to_remove[n], function(linkedNode, link){
                links_at_distance[value]["add"].push(link);
            });
            graphGL.removeNode(nodes_to_remove[n]);
        }
    }
    prevValue = value;

    if(graphObject.isLayoutPaused){
        renderer.rerender();
    }

    //graphObject.addedLinks = addedLinks;
    
    graphObject.links_at_distance = links_at_distance;
    graphObject.nodes_at_distance = nodes_at_distance;
    graphObject.merged_at_distance = merged_at_distance;

    graphObject.prevNLVCollapsevalue = prevValue;
    changeLogScale(graphObject);

    setNewProgram(graphObject, buildCircleNodeShader);

    if(graphObject.linkMethod === 'profiles'){
        changeColorsOfNodes_Schema(graph, schemeFilter);
    }
    else if(graphObject.linkMethod === 'isolates'){
        changeColorsOfNodes_Metadata(graphObject, metadataFilter);
    }

}

function printDiv(graphObject) 
{

  var width = graphObject.width;
  var height = graphObject.height;

  if(graphObject.multiSelectOverlay && graphObject.multiSelectOverlay.bottomRight){
    selectProperties = graphObject.multiSelectOverlay.selectedArea();
    //copyCanvasPart(selectProperties, "canvas");

    for (i in graphObject.selectedNodes){
        var nodeToUse = graphObject.graphics.getNodeUI(graphObject.selectedNodes[i].id);
        nodeToUse.colorIndexes = nodeToUse.backupColor;
      } 
    graphObject.selectedNodes = [];

    setTimeout(runPrint, 500);
  }
  else{
    selectProperties = {
        x: 0,
        y: 0,
        width:width,
        height:height
    }
    setTimeout(runPrint, 500);
  }


  function convertImage(imageID, callback){

    html2canvas($('#' + imageID), {
          onrendered: function(canvasLabels) {
            var labelsImage = Canvas2Image.convertToImage(canvasLabels, width, height);
            callback(labelsImage);
          }
      });
  }

  function runPrint(){

      var width = $(window).width() - $(window).width() * 0.02,
      height = $(window).height() - $('#tabs').height() - $(window).width() * 0.02;
    
      //$('#visual').css({width: width, height: height, position: "relative"});
      $('#labelsDiv').css({width: width, height: height, position: "absolute"});

      var labelsViz = '';
      var canvasViz = '';

      convertImage('labelsDiv', function(labelsCan){
        labelsViz = labelsCan;
        labelsViz.setAttribute('width', '100%');
        labelsViz.setAttribute('height', 'auto');
        canvasViz = Canvas2Image.convertToImage(document.getElementById("canvas"), width, height);
        canvasViz.setAttribute('width', '100%');
        canvasViz.setAttribute('height', 'auto');
        continuePrinting();
      });

      /*
      html2canvas($('#labelsDiv'), {
          onrendered: function(canvasLabels) {
            console.log(canvasLabels);
            labelsImage = Canvas2Image.convertToImage(canvasLabels, width, height);
            continuePrinting();
            console.log(labelsCanvas);
            labelsImage.setAttribute('width', '100%');
            labelsImage.setAttribute('height', 'auto');
            //document.body.appendChild(canvasLabels);
          }
      });*/

      function continuePrinting(){

          //var divWithLabels=document.getElementById('labels');
          var divWithpieChart = document.getElementById('col_info');
          var divWithtablePercentages = document.getElementById('divtablePercentages');

          //var canvas = document.getElementById("canvas");
          //var canvaswidth = $("#canvas").width();
          //var canvasheight = $("#canvas").height();
          //var img    = canvasViz.toDataURL("image/jpeg", 1.0);
          //console.log(divToPrint.innerHTML);

          toAddImage = '<div id="divViz" style="width:75%;display:inline-block;">' +
                        '</div>';
          toAddLabels = '<div id="divLabel" style="width:75%;display:inline-block;">' +
                        '</div>';

          var newWin=window.open('','Print-Window','width=21cm','height=29.7cm');

          if (newWin == null || typeof(newWin)=='undefined')
            alert("Please disable your pop-up blocker.\n\nTo save the image, a new window must be created.");

          newWin.document.open();
          //console.log('AQUI');

          newWin.document.write('<html><body style="width:100%;height:100%;"><div style="width:100%;height:100%;"><div id="canvasImage" style="width:100%;height:auto;position:absolute;top:0;text-align:center;">'+toAddImage+'</div><div style="width:100%; height:auto;position:absolute;top:0;text-align:center;">'+toAddLabels+'</div></div><div style="width:100%;">'+divWithpieChart.innerHTML+'</div><div style="width:50%;float:right;">'+divWithtablePercentages.innerHTML+'</div></body></html>');
          newWin.document.getElementById('divViz').appendChild(canvasViz);
          newWin.document.getElementById('divLabel').appendChild(labelsViz);

          $(newWin.document).contents().find('#Choosecategories').remove();

          setTimeout(function(){ 
            newWin.window.print();
            newWin.close();}, 100);
          //newWin.document.getElementById('canvas').remove();

      }

      //console.log(divWithpieChart);

  }


}









