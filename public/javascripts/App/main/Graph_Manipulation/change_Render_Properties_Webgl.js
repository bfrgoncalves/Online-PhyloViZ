
function setNewProgram(graphObject, newProgram){
     //graphObject.graphics.release();
     var newCircleNode = newProgram();
     var prevProgram = graphObject.graphics.getNodeProgram();
     //prevProgram.releaseResources();
     var currentContext = graphObject.graphics.getgl();
     var canvasSize = graphObject.graphics.getWidthAndHeight();

     graphObject.graphics.setNodeProgram(newCircleNode);
     graphObject.currentNodeProgram = newProgram.name;
     newCircleNode.load(currentContext, graphObject.graphInput.nodes.length);
     newCircleNode.updateSize(canvasSize[0] / 2, canvasSize[1] / 2);
     graphObject.graphics.transformUniform();
     //graphObject.graphics.updateSize();
     //graphObject.renderer.initDom();
     //graphObject.renderer.updateCenter();
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
        //setTimeout(function(){ renderer.pause();}, 50);
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
            //if (node.id.search('TransitionNode') > -1) sizeToUse = 5;
            nodeUI.size = graphObject.DefaultnodeSize+(node.isolates.length * graphObject.NodeScaleFactor);
        }
        else if (option == 'profiles'){
            //if (node.id.search('TransitionNode') > -1) sizeToUse = 5;
            nodeUI.size = graphObject.DefaultnodeSize+(graphObject.graphInput.mergedNodes[node.key].length * graphObject.NodeScaleFactor);
        }


    });

    if(graphObject.isLayoutPaused){
        renderer.rerender();
        //setTimeout(function(){ renderer.pause();}, 50);
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
            //console.log(labelStyle);
            console.log(String(newSize) + 'px');
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

    /*
    if(!graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();
    */
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
        //setTimeout(function(){ renderer.pause();}, 50);
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
        //setTimeout(function(){ renderer.pause();}, 50);
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

                for (i=0; i<graph.distanceMatrix[countNodes].length; i++){
                    if (graph.distanceMatrix[countNodes][i] <= value && graph.distanceMatrix[countNodes][i] != 0){

                        targetIndex = parseInt(countNodes) + parseInt(i);
                        sourceKey = graph.original_position_to_id[String(countNodes)] == undefined ? graph.nodes[countNodes].key : graph.original_position_to_id[String(countNodes)];
                        targetKey = graph.original_position_to_id[String(targetIndex)] == undefined ? graph.nodes[targetIndex].key : graph.original_position_to_id[String(targetIndex)]
                        
                        sourceKey = graph.sameNodeHas[sourceKey];
                        targetKey = graph.sameNodeHas[targetKey];

                        console.log(countNodes, i, targetIndex, sourceKey, targetKey, graph.original_position_to_id);
                        console.log(targetKey);
                        if(targetKey.indexOf('TransitionNode') < 0){

                            LinkID = sourceKey + "👉 " + targetKey;
                            LinkID_reverse = targetKey + "👉 " + sourceKey;
                            console.log("PASSOU");

                            if (addedLinks.hasOwnProperty(LinkID)){
                                console.log("BAH")
                                continue;
                            }
                            if (!treeLinks.hasOwnProperty(LinkID) && !treeLinks.hasOwnProperty(LinkID_reverse)){
                                console.log("AQUI");
                                graphGL.addLink(sourceKey, targetKey, { connectionStrength: graph.distanceMatrix[countNodes][i] , value: graph.distanceMatrix[countNodes][i], color: "#00ff00"});
                                var link = graphGL.getLink(sourceKey, targetKey);

                                addedLinks[LinkID] = link;
                            }

                        }
                    }
                }
            }

            if (nodesLength > countNodes) countNodes += 1;
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









