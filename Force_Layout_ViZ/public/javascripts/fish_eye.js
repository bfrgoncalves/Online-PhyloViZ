var fish_eye = function(force, link) {

	var fisheye = d3.fisheye.circular()
	      .radius(120);
	svg.on("mousemove", function() {
	      force.stop();
	      fisheye.focus(d3.mouse(this));
	      d3.selectAll("circle").each(function(d) { d.fisheye = fisheye(d); })
	          .attr("cx", function(d) { return d.fisheye.x; })
	          .attr("cy", function(d) { return d.fisheye.y; })
	          .attr("r", function(d) { return d.fisheye.z * 8; });
	      link.attr("x1", function(d) { return d.source.fisheye.x; })
	          .attr("y1", function(d) { return d.source.fisheye.y; })
	          .attr("x2", function(d) { return d.target.fisheye.x; })
	          .attr("y2", function(d) { return d.target.fisheye.y; });
	    });

}