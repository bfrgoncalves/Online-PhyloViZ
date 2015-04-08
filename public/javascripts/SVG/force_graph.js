
$('body').css('background-color','white');


var width = $('#col_visual').width(),
    height = $(document).height() - $('#col_toolbar').height();

  //Initialize globally to be used in functions from other files
  var node; 
  var link;
  var totalGraph;
  var graphRec;
  var linkDist = 50, nodeRadius = 5, currentCharge=-500, maxWeight=null, currentGravity=0.01, currentLinkStrength = 1;
  var currentProperty = 'null', currentLabelSize = 10, currentLinkThickness = 1, times = 10;

  var baseColor = '#868282';

  var GlobalPieProperties;


  var ArrayOfColors = [], NumberOfColors, currentDomain = [];

  var color = d3.scale.ordinal().domain(currentDomain).range(ArrayOfColors);

  var force = d3.layout.force()
      .gravity(currentGravity)
      //.charge(currentCharge)
      //.alpha(0.1) controls the temperature. more stable layouts have lower values
      .linkDistance(linkDist)
      .size([width, height]);

  var typeOfDrag = force.drag;

  var zoom = d3.behavior.zoom();

  var result = $("#myDiv").height();

  var svg = d3.select("#visual")
      .call(zoom)
      .on("dblclick.zoom", null)
      .append("svg").attr('id','graphSVG')
      .attr("width", width)
      .attr("height", height)
      //.on('mousedown', removeZoom)
      .on('dblclick', connectedNodes)
      .append("svg:g").attr('id','globalGraph');

  var svgWidth = $("#graphSVG").width();

  zoom.translate([svgWidth/2,0]).on("zoom", rescale);

  svg.attr('transform', "translate("+svgWidth/2+","+0+")")


function onLoad(){


  $('#globalGraph').css({opacity:0});

  GetGraphData("./data/goeData.json");


  $('#pauseLayout').click(function(e) {
                    e.preventDefault();
                    if($('#pauseLayout')[0].innerHTML == "Pause Layout"){
                      force.stop();
                      $('#pauseLayout')[0].innerHTML = "Resume Layout";
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
                    }
                    else{ 
                      force.resume();
                      $('#pauseLayout')[0].innerHTML = "Pause Layout";
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',false);
                      $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',true);
                      
                    }
                });

  $('#searchForm').submit(function(e) {
                    e.preventDefault();
                    searchNode();
                });
}



function getRandomColor() {
    var color = '#' + Math.random().toString(16).substring(2, 8);
    return color;
}


function GetGraphData(data){

  d3.json(data, function(error, graph) {

    totalGraph=graph;
    ReDoGraph = graph;

    NumberOfColors = graph.nodes.length;

    createGraph(typeOfDrag);

    for (var i=0;i<NumberOfColors;i++){
      ArrayOfColors.push(getRandomColor());
    }

    graphRec=JSON.parse(JSON.stringify(graph)); 

    linksByKey = IDasIndexEdges(totalGraph); //Convert links by index to index by key
    
    colorAttributes(graph); 

    force
        .nodes(totalGraph.nodes)
        .links(linksByKey);

    var arrayOfNodes = [];

    var k = 0;

    force.on("tick", function(d) {

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });


      svg.selectAll(".Gnodes").attr("transform", function (d) {return 'translate(' + d.x + ',' + d.y + ')';});
      //node.each(collide(0.5)); //Added

    });

    $('#globalGraph').css({opacity:1});

    force.linkStrength(currentLinkStrength).start();

    highlight_nodes(graph); //highlight_nodes.js
    search_nodes(graph); //search_nodes.js

  });

}

/////////////////////////////////////////////////////////////////////////////////////////////////

//CREATE GRAPH

function createGraph(typeOfDrag){

  linksByKey = IDasIndexEdges(totalGraph); //Convert links by index to index by key

  $('#numberOfNodes').append('<div style ="text-align:"> Number of nodes: ' + totalGraph.nodes.length + '</div>');

  link = svg.selectAll('.link').remove()
  link = svg.selectAll('.link').data(linksByKey);
  link.exit().remove();

  link.enter().append("line")
    .attr("class", function(d){
       if (maxWeight<d.value) maxWeight=d.value;
       return "link";})
    //.attr('class', function(d){ return 'L' + d.target;})
    .style("stroke-width", function(d) { return Math.sqrt(currentLinkThickness); });

  node = svg.selectAll('g','g').remove();
  node = svg.selectAll(".node").data(totalGraph.nodes);


  //node.exit().remove;
  node.enter().append('g').attr('class','Gnodes').attr('id', function(d){ return ('S'+d.key);})
      .on('mousedown', removeZoom)
      .on('mouseup', addZoom)
      .call(typeOfDrag)
      .on('click', viewInfo)
        //.call(colorAttributes)
      .on('contextmenu', releasenode);

  node.append("circle")
      .attr("class", "node")
      .attr("r", function(d){ return (parseInt(d.isolates.length/2) + parseInt(nodeRadius));})
      .attr('name', function(d){ return d.key;})
      .attr('id', function(d){ return ('C'+d.key);})
      .style("fill", function(d) { return baseColor; });
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

function IDasIndexEdges(graphToUse){
  var edges = [];
  graphToUse.links.forEach(function(e) {
      var sourceNode = graphToUse.nodes.filter(function(n) {
          return n.key === e.source;
      })[0],
          targetNode = graphToUse.nodes.filter(function(n) {
              return n.key === e.target;
          })[0];

      edges.push({
          source: sourceNode,
          target: targetNode,
          value: e.value
      });
  });
  return edges;
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

////////////////////////////////////////////////////////////////////////////////////////

//COLLISION DETECTION

// var padding = 1, // separation between circles
//     radius=5;
// function collide(alpha) {
//   var quadtree = d3.geom.quadtree(totalGraph.nodes);
//   return function(d) {
//     var rb = 2*radius + padding,
//         nx1 = d.x - rb,
//         nx2 = d.x + rb,
//         ny1 = d.y - rb,
//         ny2 = d.y + rb;
//     quadtree.visit(function(quad, x1, y1, x2, y2) {
//       if (quad.point && (quad.point !== d)) {
//         var x = d.x - quad.point.x,
//             y = d.y - quad.point.y,
//             l = Math.sqrt(x * x + y * y);
//           if (l < rb) {
//           l = (l - rb) / l * alpha;
//           d.x -= x *= l;
//           d.y -= y *= l;
//           quad.point.x += x;
//           quad.point.y += y;
//         }
//       }
//       return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
//     });
//   };
// }