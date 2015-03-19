
//adjust threshold
function threshold(thresh) {
    totalGraph.links.splice(0, totalGraph.links.length);
		for (var i = 0; i < graphRec.links.length; i++) {
			if (graphRec.links[i].value > thresh) {totalGraph.links.push(graphRec.links[i]);}
		}
    restart();
}

//adjust Link Distance
function ChangeDistance(newDistance){
	linkDist = newDistance;
	force.linkDistance(linkDist);
	restart();
}

//adjust Node Size
function NodeSize(newSize){
	nodeRadius = newSize;
	d3.selectAll('.node').attr("r",nodeRadius);
	restart();
}


//change Charge of nodes
function ChangeCharge(newCharge){
	currentCharge = newCharge;
	force.charge(currentCharge);
	restart();
}

//Restart the visualisation after any node and link changes
function restart() {
	link = link.data(totalGraph.links);
	link.exit().remove();
	link.enter().insert("line", ".node").attr("class", "link");
	node = node.data(totalGraph.nodes);
	node.enter().insert("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag);
	force.start();
}
