

$('#global').css({opacity:0});

var width = $('#col_visual').width(),
    height = $(document).height() - $('#col_toolbar').height();


//Initialize globally to be used in functions from other files
var node; 
var link;
var totalGraph;
var graphRec;
var linkDist = 50, nodeRadius = 5, currentCharge=-800, maxWeight=null, currentGravity=0.1, currentLinkStrength = 10;
var currentProperty = 'null', currentLabelSize = 10, currentLinkThickness = 1;

var ArrayOfColors = [], NumberOfColors, currentDomain = [];

function getRandomColor() {
  var color = '#' + Math.random().toString(16).substring(2, 8);
  return color;
}

//////////////////////////////////////////////////////////////

var color = d3.scale.ordinal().domain(currentDomain).range(ArrayOfColors);

var force = d3.layout.force()
    .gravity(currentGravity)
    .charge(currentCharge)
    //.alpha(0.1) controls the temperature. more stable layouts have lower values
    .linkDistance(linkDist)
    .size([width, height]);

var typeOfDrag = force.drag;

var zoom = d3.behavior.zoom().on("zoom", rescale);

var svg = d3.select("#visual")
    .call(zoom)
    .on("dblclick.zoom", null)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    //.on('mousedown', removeZoom)
    .on('dblclick', connectedNodes)
    .append("svg:g");


d3.json("./data/goeData.json", function(error, graph) {
  
  totalGraph=graph;
  console.log(graph);

  NumberOfColors = graph.nodes.length;

  for (var i=0;i<NumberOfColors;i++){
    ArrayOfColors.push(getRandomColor());
  }

  graphRec=JSON.parse(JSON.stringify(graph)); //Add this line
  
  colorAttributes(graph); // Get attributes to be used in the possible color assignment. colorAttributes.js

  force
      .nodes(graph.nodes)
      .links(graph.links);

  createGraph(typeOfDrag);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    svg.selectAll(".Gnodes").attr("transform", function (d) { return 'translate(' + d.x + ',' + d.y + ')';});
                          //.attr("y", function (d) { return d.y;});

    // d3.selectAll("text").attr("x", function (d) { return d.x;})
    //                     .attr("y", function (d) { return d.y;});

    node.each(collide(0.5)); //Added
  });

  force.linkStrength(currentLinkStrength).start();

  //fish_eye(force, link); // Necessary to get the fish eye view
  highlight_nodes(graph); //highlight_nodes.js
  search_nodes(graph); //search_nodes.js
});


$('#global').css({opacity:1});


// $("#visual").on("contextmenu", ".node", function (e) {
//   var name = this.getAttribute('name');
//   var id = this.getAttribute('id');
//   showMenu(name,id);

// });
//.on('contextmenu', function(d){ return showMenu(d);})

/////////////////////////////////////////////////////////////////////////////////////////////////

//CREATE GRAPH

function createGraph(typeOfDrag){

  //console.log(totalGraph.nodes);

  link = svg.selectAll('.link').remove()
  link = svg.selectAll('.link').data(totalGraph.links);
  link.exit().remove();

  link.enter().append("line")
    .attr("class", function(d){
       if (maxWeight<d.value) maxWeight=d.value;
       return "link";})
    .style("stroke-width", function(d) { return Math.sqrt(currentLinkThickness); });

  node = svg.selectAll('g','g').remove();
  node = svg.selectAll(".node").data(totalGraph.nodes);


  node.exit().remove;
  node.enter().append('g').attr('class','Gnodes').attr('id', function(d){ return ('S'+d.key);})
      .on('mousedown', removeZoom)
      .on('mouseup', addZoom)
      .call(typeOfDrag)
      .on('click', viewInfo)
        //.call(colorAttributes)
      .on('contextmenu', releasenode);

  node.append("circle")
      .attr("class", "node")
      .attr("r", function(d){ return (parseInt(d.isolates.length) + parseInt(nodeRadius));})
      .attr('name', function(d){ return d.key;})
      .attr('id', function(d){ return ('C'+d.key);})
      .style("fill", function(d) { return color(d[currentProperty]); });
       // See only neighbour links and nodes. highlight_nodes.js

  // node.append("title")
  //     .text(function(d) { return d.name; });

  node.append("text")
      .attr("dx", 10)
      .attr("dy", ".35em")
      .text(function(d) { return d.key })
      .style("font-size", currentLabelSize)
      .style("stroke", "black");
      
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function rescale() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  svg.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

function removeZoom(){
  zoom = d3.behavior.zoom().on("zoom", null);
  d3.select("#visual").call(zoom);
}

function addZoom(){
	zoom = d3.behavior.zoom().on("zoom", rescale);
  d3.select("#visual").call(zoom);
}


// function setLinkStrength(link){
//   return link.value/maxWeight;
// }


////////////////////////////////////////////////////////////////////////////////////////

//COLLISION DETECTION

var padding = 1, // separation between circles
    radius=8;
function collide(alpha) {
  var quadtree = d3.geom.quadtree(totalGraph.nodes);
  return function(d) {
    var rb = 2*radius + padding,
        nx1 = d.x - rb,
        nx2 = d.x + rb,
        ny1 = d.y - rb,
        ny2 = d.y + rb;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
          l = (l - rb) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}