function createDistanceTable(graph){

	d3.select("#divdistances svg").remove();

	var margin = {top: 80, right: 0, bottom: 10, left: 80},
    width = 720,
    height = 720;

  var x = d3.scale.ordinal().rangeBands([0, width]),
      z = d3.scale.linear().domain([0, 4]).clamp(true),
      c = d3.scale.category10().domain(d3.range(10));

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", -margin.left + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  loadJson(graph); //from matrix.js at the dependencies folder



}
