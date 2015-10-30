
//adjust Node Size
function NodeSize(newSize, max, renderer, graph, graphics){
    graph.nodes.forEach(function(node){
        var nodeUI = graphics.getNodeUI(node.key);

        nodeUI.size = nodeUI.backupSize + (nodeUI.backupSize * 2 * (parseInt(newSize) / parseInt(max)));      
    });
}

//adjust Node Size
function LabelSize(newSize, graph, domLabels, graphics, type){

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

function changeSpringLength(newValue, max, renderer, graphGL, layout, graph){

    graph.links.forEach(function(link){

            var linkUI = graphGL.getLink(link.source, link.target);

            var spring = layout.getSpring(link.source, link.target);
            spring.length = linkUI.data.value + (100 * linkUI.data.value * (newValue/max));

        })

}

function linkThickness(newSize, renderer, graph, graphics){

	graph.links.forEach(function(link){
	        var linkUI = graphics.getLinkUI();
	    })

}

function splitTree(graph, graphics, removedLinks, value, prevValue, linkLabels, tovisualizeLinkLabels, treeLinks) {
    //console.log(linkLabels);
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

    return removedLinks, prevValue;

}


function NLVgraph(graphGL, graph, graphics, value, addedLinks, prevValue, treeLinks) {

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

    return addedLinks, prevValue;

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
  newWin.document.getElementById('info_place').remove();
  newWin.document.getElementById('informationTitle').remove();
  //newWin.document.getElementById('col_info');
  //newWin.document.write('')

  newWin.document.close();

  //setTimeout(function(){newWin.close();},1000);

}