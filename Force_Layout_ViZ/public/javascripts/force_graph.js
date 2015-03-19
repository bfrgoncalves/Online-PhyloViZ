
var width = $('#col_visual').width(),
    height = $(document).height() - $('#col_toolbar').height();


//Initialize globally to be used in functions from other files
var node; 
var link;
var totalGraph;
var graphRec;
var linkDist = 50, nodeRadius = 5, currentCharge=-120;
//////////////////////////////////////////////////////////////

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(currentCharge)
    .linkDistance(linkDist)
    .size([width, height]);

var svg = d3.select("#visual").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom().on("zoom", rescale))
    .on("dblclick.zoom", null)
    .append("svg:g");


d3.json("./data/miserables1.json", function(error, graph) {
  
  totalGraph=graph;

  graphRec=JSON.parse(JSON.stringify(graph)); //Add this line
  
  colorAttributes(graph); // Get attributes to be used in the possible color assignment. colorAttributes.js

  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  link = svg.selectAll(".link")
  	.data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  node = svg.selectAll(".node")
  	.data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", nodeRadius)
      .attr('name', function(d){ return d.name;})
      .attr('id', function(d){ return d.id;})
      .style("fill", function(d) { return color(d.ST); })
      .call(force.drag)
      //.call(colorAttributes)
      .on('mousedown', removeZoom)
	  .on('mouseup', addZoom)
      .on('dblclick', connectedNodes); // See only neighbour links and nodes. highlight_nodes.js

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });

  //fish_eye(force, link); // Necessary to get the fish eye view
  highlight_nodes(graph); //highlight_nodes.js
  search_nodes(graph); //search_nodes.js
});


$("#visual").on("contextmenu", ".node", function (e) {
  var name = this.getAttribute('name');
  var id = this.getAttribute('id');
  showMenu(name,id);

});
//.on('contextmenu', function(d){ return showMenu(d);})

function rescale() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  svg.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

function removeZoom(){
	d3.select("svg")
	.call(d3.behavior.zoom()
		.on("zoom", null));
}

function addZoom(){
	d3.select("svg")
	.call(d3.behavior.zoom()
		.on("zoom", rescale))
	.on("dblclick.zoom", null);
}

function showMenu(name, id,e){
  $contextMenu=$("#contextMenu");
  $contextMenu[0].innerHTML ='';
  $contextMenu[0].innerText ='';
  var insertdrop = '<ul class="dropdown-menu" role="menu" style="display:block;position:static;margin-bottom:5px;" aria-labelledby="dropdownMenu">';
  insertdrop+='<li><h4 class="dropNameNodes">'+name+'</h4></li><li onclick="showInformation('+id+')"><a>Show Information</a></ul>';
  $contextMenu.append(insertdrop);

  $contextMenu.css({
            display: "block",
            left: e.pageX,
            top: e.pageY
        });
  console.log($contextMenu);

}

function showInformation(id){
  $bodyModal = $("#bodyModal");
  $bodyModal.empty();

  var table = document.createElement('table');
  table.style.width='100%';
  table.setAttribute('border','1');
  header=table.createTHead();
  row=header.insertRow(0);
  console.log(totalGraph.nodes);
  console.log(id);
  for (property in totalGraph.nodes[id]){
    console.log(property);
    if (property != 'px' && property !='py' && property !='x' && property !='y' && property !='index' && property !='weight' && property !='fixed'){
      var td = document.createElement('td');
      td.innerHTML = property;
      row.appendChild(td);

    }
    console.log(property);
  }
  $bodyModal.append(table);
  $('#mainModal').modal('show');
  console.log("AQUI");
}
