
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
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
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

    graph.links.forEach(function(link){

            var linkUI = graphGL.getLink(link.source, link.target);

            var spring = layout.getSpring(link.source, link.target);

            if (graphObject.isLogScale) spring.length = Math.log10(spring.length);
            else spring.length = graphObject.defaultLayoutParams.springLength * linkUI.data.connectionStrength;

        })

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();
}

function changeLogScaleNodes(graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    if(!graphObject.isLogScaleNodes) $("#NodeSizeSlider").val(1);

    graph.nodes.forEach(function(node){

            var nodeUI = graphObject.graphics.getNodeUI(node.key);
            if (graphObject.isLogScaleNodes) nodeUI.size = Math.log10(nodeUI.backupSize) * graphObject.DefaultnodeSize;
            else nodeUI.size = nodeUI.backupSize;


    });

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();
}

function changeSpringLength(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    graph.links.forEach(function(link){

            var linkUI = graphGL.getLink(link.source, link.target);

            var spring = layout.getSpring(link.source, link.target);

            if (graphObject.isLogScale) spring.length = graphObject.defaultLayoutParams.springLength * (Math.log10(1 + linkUI.data.value) + (20 * Math.log10(1 + linkUI.data.value * (newValue/max))));
            else spring.length = graphObject.defaultLayoutParams.springLength * (linkUI.data.value + (20 * (1 + Math.log10(linkUI.data.value)) * (newValue/max)));

        })

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

}

function changeDragCoefficient(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.dragCoeff(parseInt(newValue) * 0.001);

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

}

function changeSpringCoefficient(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.springCoeff(parseInt(newValue) * 0.0001);

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

}

function changeGravity(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.gravity(parseInt(newValue));

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

}

function changeTheta(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    layout.simulator.theta(parseInt(newValue) * 0.1);

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

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

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

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

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
    else renderer.resume();

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
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }

    graphObject.removedLinks = removedLinks;
    graphObject.prevSplitTreeValue = prevValue;

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

                for (i=1; i<graph.distanceMatrix[countNodes].length-1; i++){
                    if (graph.distanceMatrix[countNodes][i] <= value && graph.distanceMatrix[countNodes][i] != 0){
                        //console.log(graph.distanceMatrix[countNodes][i]);
                        targetIndex = parseInt(countNodes) + parseInt(i);

                        if(graph.nodes[targetIndex].key.indexOf('TransitionNode') < 0){

                            LinkID = graph.nodes[countNodes].key + "👉 " + graph.nodes[targetIndex].key;
                            if (addedLinks.hasOwnProperty(LinkID)){
                                continue;
                            }
                            if (!treeLinks.hasOwnProperty(LinkID)){

                                graphGL.addLink(graph.nodes[countNodes].key, graph.nodes[targetIndex].key, { connectionStrength: graph.distanceMatrix[countNodes][i] , value: graph.distanceMatrix[countNodes][i], color: "#00ff00"});
                                var link = graphGL.getLink(graph.nodes[countNodes].key, graph.nodes[targetIndex].key);

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
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }

    graphObject.addedLinks = addedLinks;
    graphObject.prevNLVvalue = prevValue;

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

          newWin.document.open();

          newWin.document.write('<html><body style="width:100%;height:100%;"><div style="width:100%;height:100%;"><div id="canvasImage" style="width:100%;height:auto;position:absolute;top:0;text-align:center;">'+toAddImage+'</div><div style="width:100%; height:auto;position:absolute;top:0;text-align:center;">'+toAddLabels+'</div></div><div style="width:100%;">'+divWithpieChart.innerHTML+'</div><div style="width:50%;float:right;">'+divWithtablePercentages.innerHTML+'</div></body></html>');
          newWin.document.getElementById('divViz').appendChild(canvasViz);
          newWin.document.getElementById('divLabel').appendChild(labelsViz);

          $(newWin.document).contents().find('#Choosecategories').remove();

          setTimeout(function(){ newWin.window.print();}, 100);
          //newWin.document.getElementById('canvas').remove();

      }

      //console.log(divWithpieChart);

  }


}









