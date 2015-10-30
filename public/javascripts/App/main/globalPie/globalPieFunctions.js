

function constructPie(dataArray, columnIndex, columnName, pieID, x, y, r){

	gatherPieData(dataArray, function(dataToPie){
		GlobalPie('pie', dataToPie, x, y, r, pieID, columnName);
		//linkToGraph(dataToPie, columnIndex, graph, graphics, renderer);
	});
}

function destroyPie(pieID){
	d3.select('#' + pieID).selectAll('svg').remove();
    d3.select('#legend' + pieID).selectAll('svg').remove();
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


function GlobalPie(classname, data, x, y, r, pieID, columnName)
    { 
        //color could be made a parameter

        var total = data.length;

        var maxStringLength = 0;


       	for(i in data){
       		if (maxStringLength < data[i].label.length) maxStringLength = data[i].label.length;
       	}


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

        $('#legend' + pieID).css('height', x * 2);

        d3.select('#' + pieID).selectAll('svg').remove();
        d3.select('#legend' + pieID).selectAll('svg').remove();

        var pie = d3.select('#' + pieID).append('svg').attr('id', "SV" + pieID).style('width', r*2 + 30).style('height', r*2 + 80)
            .append("svg:g").attr('id', 'P' + pieID).attr("transform", "translate(" + (r + 5) + "," + (r + 5) +")")
                //.data([data.sort(d3.descending)])
                .data([data])
                .attr("class", classname);

        var textIdentifier = pie.append("text")
					    .attr("dy", ".35em")
					    .style("text-anchor", "middle")
					    .attr("class", "textTop")
					    .text( columnName )
					    .attr("y", r + 20);
        
        var textTop = pie.append("text")
					    .attr("dy", ".35em")
					    .style("text-anchor", "middle")
					    .attr("class", "textTop")
					    .text( "TOTAL" )
					    .attr("y", r + 40);
		
		var textBottom = pie.append("text")
		    .attr("dy", ".35em")
		    .style("text-anchor", "middle")
		    .attr("class", "textBottom")
		    .text(total.toFixed(0))
		    .attr("y", r + 60);

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
					                    .attr("y", r + 40);
					                textBottom.text(d3.select(this).datum().data.value.toFixed(0))
					                    .attr("y", r + 60);
					            })
					            .on("mouseout", function(d) {
					                d3.select(this).select("path").transition()
					                    .duration(100)
					                    .attr("d", arc);
					                
					                textTop.text( "TOTAL" )
					                    .attr("y", r + 40);
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

        if(maxStringLength == 1) maxStringLength = 2;

        var legend = d3.select('#legend' + pieID).append("svg")
					    .attr("class", "legend")
					    .style("width", maxStringLength * 20)
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