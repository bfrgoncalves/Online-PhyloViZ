function createDistanceTable(graph){

	d3.select("#divdistances svg").remove();

	var margin = {top: 80, right: 0, bottom: 10, left: 80},
    width = 720,
    height = 720;

	var x = d3.scale.ordinal().rangeBands([0, width]),
	    z = d3.scale.linear().domain([0, 4]).clamp(true),
	    c = d3.scale.category10().domain(d3.range(10));

	var svg = d3.select("#divdistances").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .style("margin-left", -margin.left + "px")
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var matrix = [],
		nodeKeys = {};
      nodes = graph.nodes,
      n = nodes.length;

      console.log(nodes.length);

    // Compute index per node.
	  nodes.forEach(function(node, i) {
	    node.index = i;
	    node.count = 0;
	    nodeKeys[node.key] = i;
	    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
	  });

	  //console.log(matrix);

	// Convert links to matrix; count character occurrences.
	  graph.links.forEach(function(link) {
	  	//console.log(link);
	  	//console.log(matrix[link.source][link.target]);
	  	//console.log(link.source);
	    matrix[nodeKeys[link.source]][nodeKeys[link.target]].z += link.value;
	    //matrix[nodeKeys[link.source]][nodeKeys[link.target]].z += 1;
	    //matrix[nodeKeys[link.source]][nodeKeys[link.target]].z += 1;
	    //matrix[nodeKeys[link.source]][nodeKeys[link.target]].z += 1;
	    //nodes[nodeKeys[link.source]].count += link.value;
	    nodes[nodeKeys[link.source]].count += 1;
	  });

	// Precompute the orders.
	  var orders = {
	    name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].key, nodes[b].key); }),
	    count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
	    //group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
	  };

	// The default sort order.
  		x.domain(orders.name);


  	svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].key; });

  var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].key; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row) //row.filter(function(d) { return d.z; })
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand())
        .attr("height", x.rangeBand())
        .style("fill-opacity", function(d) { return z(d.z); })
        .style("fill", function(d) { return d.z == 0 ? "white" : c(d.z); })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
  }

  function mouseover(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
  }

  function mouseout() {
    d3.selectAll("text").classed("active", false);
  }

  d3.select("#order").on("change", function() {
    clearTimeout(timeout);
    order(this.value);
  });

  function order(value) {
    x.domain(orders[value]);

    var t = svg.transition().duration(2500);

    t.selectAll(".row")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .selectAll(".cell")
        .delay(function(d) { return x(d.x) * 4; })
        .attr("x", function(d) { return x(d.x); });

    t.selectAll(".column")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
  }

  var timeout = setTimeout(function() {
    order("group");
    d3.select("#order").property("selectedIndex", 2).node().focus();
  }, 5000);

  $("#order").change(function(e){
    order(this.value);
  });



}
