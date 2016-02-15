
//adjust Node Size
function NodeSize(newSize, max, graphObject){

    var renderer = graphObject.renderer;
    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;

    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);

        nodeUI.size = nodeUI.backupSize + (nodeUI.backupSize * 2 * (parseInt(newSize) / parseInt(max))); 
    });

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
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
            else spring.length = linkUI.data.connectionStrength;

        })

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }
}

function changeSpringLength(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    graph.links.forEach(function(link){

            var linkUI = graphGL.getLink(link.source, link.target);

            var spring = layout.getSpring(link.source, link.target);

            if (graphObject.isLogScale) spring.length = Math.log10(1 + linkUI.data.value) + (200 * Math.log10(1 + linkUI.data.value * (newValue/max)));
            else spring.length = linkUI.data.value + (200 * (1 + Math.log10(linkUI.data.value)) * (newValue/max));

        })

    if(graphObject.isLayoutPaused){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }

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

}

function linkThickness(newSize, renderer, graph, graphics){

	graph.links.forEach(function(link){
	        var linkUI = graphics.getLinkUI();
	    })

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

    value = parseInt(value);

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

            for (i=1; i<graph.distanceMatrix[countNodes].length-1; i++){
                if (graph.distanceMatrix[countNodes][i] <= value && graph.distanceMatrix[countNodes][i] != 0){
                    targetIndex = parseInt(countNodes) + parseInt(i);

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

  function runPrint(){


      var divWithLabels=document.getElementById('visual');
      var divWithpieChart = document.getElementById('col_info');
      var divWithtablePercentages = document.getElementById('divtablePercentages');


      var canvas = document.getElementById("canvas");
      var img    = canvas.toDataURL("image/jpeg", 1.0);

      //console.log(divToPrint.innerHTML);

      toAddImage = '<div style="width:'+selectProperties.width+'px;height:'+selectProperties.height+'px; overflow:hidden;">' +
                    '<img src="'+img+'"; style="margin-left:-'+selectProperties.x+ ';margin-top:-'+selectProperties.y+';">' + 
                    '</div>';

      var newWin=window.open('','Print-Window','width="'+graphObject.width+'",height="'+graphObject.height+'"');


      newWin.document.open();

      newWin.document.write('<html><body onload="window.print()"><div style="width:100%;">'+toAddImage+'</div><div style="width:100%;">'+divWithpieChart.innerHTML+'</div><div style="width:100%;"><div style="width:40%;float:left;">'+divWithLabels.innerHTML+'</div><div style="width:40%;float:right;">'+divWithtablePercentages.innerHTML+'</div></div></body></html>');
      newWin.document.getElementById('canvas').remove();


      newWin.document.close();
  }


}









