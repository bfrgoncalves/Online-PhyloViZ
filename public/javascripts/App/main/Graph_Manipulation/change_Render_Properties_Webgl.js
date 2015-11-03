
//adjust Node Size
function NodeSize(newSize, max, graphObject){

    var renderer = graphObject.renderer;
    var graph = graphObject.graphInput;
    var graphics = graphObject.graphics;

    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);

        nodeUI.size = nodeUI.backupSize + (nodeUI.backupSize * 2 * (parseInt(newSize) / parseInt(max)));      
    });

    if($('#pauseLayout')[0].innerHTML == "Resume Layout"){
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

function changeSpringLength(newValue, max, graphObject){

    var renderer = graphObject.renderer;
    var graphGL = graphObject.graphGL;
    var layout = graphObject.layout;
    var graph = graphObject.graphInput;

    graph.links.forEach(function(link){

            var linkUI = graphGL.getLink(link.source, link.target);

            var spring = layout.getSpring(link.source, link.target);

            spring.length = linkUI.data.value + (200 * (1 + Math.log(linkUI.data.value)) * (newValue/max));

        })

    if($('#pauseLayout')[0].innerHTML == "Resume Layout"){
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

    if($('#pauseLayout')[0].innerHTML == "Resume Layout"){
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
                if (graph.distanceMatrix[countNodes][i] == value && graph.distanceMatrix[countNodes][i] != 0){
                    targetIndex = parseInt(countNodes) + parseInt(i);

                    LinkID = graph.nodes[countNodes].key + "👉 " + graph.nodes[targetIndex].key;
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

    if($('#pauseLayout')[0].innerHTML == "Resume Layout"){
        renderer.resume();
        setTimeout(function(){ renderer.pause();}, 50);
    }

    graphObject.addedLinks = addedLinks;
    graphObject.prevNLVvalue = prevValue;

}

function printDiv(width, height) 
{

  var divWithLabels=document.getElementById('visual');
  var divWithpieChart = document.getElementById('col_info');


  var canvas = document.getElementById("canvas");
    var img    = canvas.toDataURL("image/jpeg", 1.0);

  //console.log(divToPrint.innerHTML);

  toAddImage = '<img width="'+width+'" height="'+height+'" src="'+img+'">';


  var newWin=window.open('','Print-Window','width="'+width+'",height="'+height+'"');


  newWin.document.open();

  newWin.document.write('<html><body onload="window.print()">'+toAddImage+divWithpieChart.innerHTML+divWithLabels.innerHTML+'</body></html>');
  newWin.document.getElementById('canvas').remove();


  newWin.document.close();

  //setTimeout(function(){newWin.close();},1000);

}