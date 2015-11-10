

function constructPie(dataArray, columnIndex, columnName, pieID, startWidth, startHeight, r){

	gatherPieData(dataArray, function(dataToPie){
		GlobalPie('pie', dataToPie, startWidth, startHeight, r, pieID, columnName);
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


function GlobalPie(classname, data, startWidth, startHeight, r, pieID, columnName)
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

        var SVheight = $('#col_info').height() - $('#currentpiePlace').height();

        var fontSize = $("#pauseLayout").css('font-size');

        fontSize = fontSize.replace('px', '');
        fontSize1 = parseFloat(fontSize);


        d3.select('#' + pieID).selectAll('svg').remove();
        d3.select('#legend' + pieID).selectAll('svg').remove();

        if( pieID.search('currentpieplace') > -1 ) increment = $('#col_info').width() - r * 2;
        else increment = r;

        var pie = d3.select('#' + pieID).append('svg').attr('id', "SV" + pieID).style('width', r * 2 + increment).style('height', r*2 + fontSize1 * 5)
            .append("svg:g").attr('id', 'P' + pieID).attr("transform", "translate(" + (r * 1.5) + "," + (r + fontSize1) +")")
                //.data([data.sort(d3.descending)])
                .data([data])
                .attr("class", classname);

        var textIdentifier = pie.append("text")
					    .attr("dy", ".35em")
					    .style("text-anchor", "middle")
					    .attr("class", "textTop")
					    .text( columnName )
					    .attr("y", fontSize1 + r);
        
        var textTop = pie.append("text")
					    .attr("dy", ".35em")
					    .style("text-anchor", "middle")
					    .attr("class", "textTop")
					    .text( "TOTAL" )
					    .attr("y", fontSize1*2 + r);
		
		var textBottom = pie.append("text")
		    .attr("dy", ".35em")
		    .style("text-anchor", "middle")
		    .attr("class", "textBottom")
		    .text(total.toFixed(0))
		    .attr("y", fontSize1*3 + r);

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
					                    .attr("y", fontSize1*2 + r);
					                textBottom.text(d3.select(this).datum().data.value.toFixed(0))
					                    .attr("y", fontSize1*3 + r);
					            })
					            .on("mouseout", function(d) {
					                d3.select(this).select("path").transition()
					                    .duration(100)
					                    .attr("d", arc);
					                
					                textTop.text( "TOTAL" )
					                    .attr("y", fontSize1*2 + r);
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

        var fontSize = $('#pauseLayout').css('font-size');

        var legend = d3.select('#legend' + pieID).append("svg")
					    .attr("class", "legend")
					    .style("width", maxStringLength * fontSize)
					    .style("height", total * (startHeight * 1.5))
					    .selectAll("g")
					    .data(data)
					    .enter().append("g")
					    .attr("transform", function(d, i) { return "translate(0," + i * startHeight * 1.5  + ")"; });


		legend.append("rect")
		    .attr("width", startHeight)
		    .attr("height", startHeight)
		    .style("fill", function(d, i) { return color(i); });

		legend.append("text")
		    .attr("x", startHeight)
		    .attr("y", startHeight/2)
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

        var ButtonfontSize = $("#pauseLayout").css('font-size');
        $("text").css('font-size', ButtonfontSize);


        legendHeight = $('#SV' + pieID).height();

        $('#legend' + pieID).css('height', legendHeight);

    }