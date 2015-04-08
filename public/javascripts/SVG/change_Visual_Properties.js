
//adjust threshold
function threshold(thresh) {
    totalGraph.links.splice(0, totalGraph.links.length);
		for (var i = 0; i < graphRec.links.length; i++) {
			if (graphRec.links[i].value > thresh) {totalGraph.links.push(graphRec.links[i]);}
		}
    createGraph(typeOfDrag);
    force.start();
}

//adjust Link Distance
function ChangeDistance(newDistance){
	linkDist = newDistance;
    force.linkDistance(linkDist);
	//createGraph(typeOfDrag);
    force.start();
}

//adjust Node Size
function NodeSize(newSize){
	nodeRadius = newSize;
	svg.selectAll('.Gnodes').selectAll('circle').attr("r", function(d){ return (parseInt(d.isolates.length) + parseInt(nodeRadius));});

    var ch = $('#colorAttributesMetadata').children();
    haspie = false;
    for (var i=0; i<ch.length;i++){
        if(ch[i].firstChild.checked){
            haspie=true;
            break;
        }
    }

    if (haspie) createNodePie(currentProperty);
    force.start();
}


//change Charge of nodes
function ChangeCharge(newCharge){
	currentCharge = newCharge;
	force.charge(currentCharge);
	createGraph(typeOfDrag);
    force.start();
}

function ChangeGravity(newGravity){
	currentGravity = newGravity;
	force.gravity(currentGravity);
	createGraph(typeOfDrag);
    force.start();
}

function ChangeTextOpacity(checkboxElement){
    if (checkboxElement.checked) newOpacity = 1;
    else newOpacity = 0;
    svg.selectAll('text').style('opacity',newOpacity);
    force.start();
}

function ChangeLinkStrength(newLinkStrength){
    currentLinkStrength = newLinkStrength;
    force.linkStrength(currentLinkStrength);
    force.start();
}

function ChangeLinkThickness(newThickness){
    currentLinkThickness = newThickness;
    svg.selectAll('line').style('stroke-width', Math.sqrt(currentLinkThickness));
    force.start();
}

function ChangeLabelSize(newLabelSize){
    currentLabelSize = newLabelSize;
    svg.selectAll('text').style("font-size", currentLabelSize);
    force.start();
}


var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
    	if(d3.event.sourceEvent.button ==0) force.stop(); // stops the force auto positioning before you start dragging

    }
    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
    }
    function dragend(d, i) {
    	if(d3.event.sourceEvent.button ==0){
	        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
	        force.resume();
    	}
    }
    function releasenode(d) {
        d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }

function changeDragEvent(d){
	if (d.checked){
		typeOfDrag = node_drag;
		createGraph(typeOfDrag);
		force.start();
	}
	else{
		typeOfDrag = force.drag;
		createGraph(typeOfDrag);
		force.start();
	}

}
