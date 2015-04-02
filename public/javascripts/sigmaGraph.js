var i,
    s,
    o,
    N = 1000,
    E = 5000,
    C = 5,
    d = 0.5,
    cs = [],
    g = {
      nodes: [],
      edges: []
    };

// Generate the graph:
var width = $('#col_visual').width(),
    height = $(document).height() - $('#col_toolbar').height();

$('#graph-container').css({width: width, height: height});

d3.json("./data/goeData.json", function(error, graph) {


for (i = 0; i < C; i++)
   cs.push({
     id: String(i),
     nodes: [],
     color: '#' + (
       Math.floor(Math.random() * 16777215).toString(16) + '000000'
     ).substr(0, 6)
   });

// g.nodes.push(graph.nodes);
// g.edges.push(graph.links);

for (i = 0; i < graph.nodes.length; i++) {
   o = cs[(Math.random() * C) | 0];
   g.nodes.push({
     id: String(i),
     label: graph.nodes[i].key,
     x: Math.cos(2 * i * Math.PI / N),
     y: Math.sin(2 * i * Math.PI / N),
     size: 5,
     color: o.color
     //color: o.color
  });
  o.nodes.push('n' + i);
 }

 for (i = 0; i < graph.links.length; i++) {
//   if (Math.random() < 1 - d)
	//console.log(graph.links[i].source);
     g.edges.push({
       id: 'e' + i,
       source: String(graph.links[i].source),
       target: String(graph.links[i].target)
     });
//   else {
//     o = cs[(Math.random() * C) | 0]
//     g.edges.push({
//       id: 'e' + i,
//       source: o.nodes[(Math.random() * o.nodes.length) | 0],
//       target: o.nodes[(Math.random() * o.nodes.length) | 0]
 //    });
//   }
 }

s = new sigma({
  graph: g,
  container: 'graph-container',
  settings: {
     drawEdges: true
 }
});

// Start the ForceAtlas2 algorithm:
s.startForceAtlas2();

});