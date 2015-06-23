

function constructPie(dataArray, columnIndex, pieID, x, y, r){

	gatherPieData(dataArray, function(dataToPie){
		GlobalPie('pie', dataToPie, x, y, r, pieID);
		//linkToGraph(dataToPie, columnIndex, graph, graphics, renderer);
	});
}


function gatherPieData(dataArray, callback){
	var gatherData = {};
	var dataToPie = [];
	
	for(i in dataArray){
		//console.log(i);
		if (Number.isInteger(parseInt(i))){
			if (gatherData.hasOwnProperty(dataArray[i])) gatherData[dataArray[i]] += 1;
			else gatherData[dataArray[i]] = 1;
		}
	}

	//console.log(gatherData);

	for(i in gatherData){
	 	dataToPie.push({label: i, value: gatherData[i]});
	}

	callback(dataToPie);
}


function GlobalPie(classname, data, x, y, r, pieID)
    { 
        //color could be made a parameter

        var total = data.length;

        //$('#' + pieID).css({'width': r*3, 'height': r*3});


        var color = d3.scale.category20()
        var arc = d3.svg.arc().outerRadius(r)
        var inner = r - (r/2);
        var donut = d3.layout.pie()
            .value(function(d) {
            return d.value;
        });;

        if (pieID.indexOf('isolates') > -1){
        	arrayColorsIsolates = [];
        	property_IndexIsolates = {};

        	for (i in data){
	    		arrayColorsIsolates.push(color(i).replace('#', '0x'));
	    		property_IndexIsolates[data[i].label] = i;
	    	}
        }
        else if(pieID.indexOf('profiles') > -1){
        	arrayColorsProfiles = [];
        	property_IndexProfiles = {};

        	for (i in data){
	    		arrayColorsProfiles.push(color(i).replace('#', '0x'));
	    		property_IndexProfiles[data[i].label] = i;
	    	}
        }

        d3.select('#' + pieID).selectAll('svg').remove();
        d3.select('#legend' + pieID).selectAll('svg').remove();

        var pie = d3.select('#' + pieID).append('svg').attr('id', "SV" + pieID).style('width', r*2 + 30).style('height', r*2 + 10)
            .append("svg:g").attr('id', 'P' + pieID).attr("transform", "translate(" + (r + 5) + "," + (r + 5) +")")
                //.data([data.sort(d3.descending)])
                .data([data])
                .attr("class", classname);

        var textTop = pie.append("text")
					    .attr("dy", ".35em")
					    .style("text-anchor", "middle")
					    .attr("class", "textTop")
					    .text( "TOTAL" )
					    .attr("y", -10);
		
		var textBottom = pie.append("text")
		    .attr("dy", ".35em")
		    .style("text-anchor", "middle")
		    .attr("class", "textBottom")
		    .text(total.toFixed(0))
		    .attr("y", 10);

		var arc = d3.svg.arc()
				    .innerRadius(inner)
				    .outerRadius(r);

		var arcOver = d3.svg.arc()
				    .innerRadius(inner + 5)
				    .outerRadius(r + 5);

		var arcs = pie.selectAll("g.slice")
					    .data(donut)
					    .enter()
					        .append("svg:g")
					            .attr("class", "slice")
					            .on("mouseover", function(d) {
					                d3.select(this).select("path").transition()
					                    .duration(200)
					                    .attr("d", arcOver)
					                
					                textTop.text(d3.select(this).datum().data.label)
					                    .attr("y", -10);
					                textBottom.text(d3.select(this).datum().data.value.toFixed(0))
					                    .attr("y", 10);
					            })
					            .on("mouseout", function(d) {
					                d3.select(this).select("path").transition()
					                    .duration(100)
					                    .attr("d", arc);
					                
					                textTop.text( "TOTAL" )
					                    .attr("y", -10);
					                textBottom.text(total.toFixed(0));
					            });


        // var arcs = pie.selectAll("g.arc")
        //    .data(donut)
        //  .enter().append("svg:g")
        //    .attr("class", "arc");


        var paths = arcs.append("svg:path")
           .attr("fill", function(d, i) { return color(i); });
        
        var tweenPie = function (b) {
         b.innerRadius = 0;
         var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
         return function(t) {
           return arc(i(t));
         };
        }

        var legend = d3.select('#legend' + pieID).append("svg")
					    .attr("class", "legend")
					    .style("width", r)
					    .style("height", total * 20)
					    .selectAll("g")
					    .data(data)
					    .enter().append("g")
					    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		    .attr("width", 18)
		    .attr("height", 18)
		    .style("fill", function(d, i) { return color(i); });

		legend.append("text")
		    .attr("x", 24)
		    .attr("y", 9)
		    .attr("dy", ".35em")
		    .text(function(d) { return d.label; });

        // var tweenDonut = function (b) {
        //  b.innerRadius = r * .6;
        //  var i = d3.interpolate({innerRadius: 0}, b);
        //  return function(t) {
        //    return arc(i(t));
        //  };
        // }

        paths.transition()
           .ease("bounce")
           .duration(2000)
           .attrTween("d", tweenPie);

        // paths.transition()
        //    .ease("elastic")
        //    .delay(function(d, i) { return 2000 + i * 50; })
        //    .duration(750)
        //    .attrTween("d", tweenDonut);

    }