

function constructPie(dataArray, columnIndex, columnName, pieID, startWidth, startHeight, r, graphObject){

	gatherPieData(dataArray, function(dataToPie, totalCounts){
		GlobalPie('pie', dataToPie, startWidth, startHeight, r, pieID, columnName, graphObject);
		if(String(pieID) == 'currentpiePlace') percentageTable(dataToPie, totalCounts);
		//else if(pieID=='pieisolates') console.log(pieID);
	});
}

function destroyPie(pieID){
	d3.select('#' + pieID).selectAll('svg').remove();
    d3.select('#legend' + pieID).selectAll('svg').remove();
}


function gatherPieData(dataArray, callback){
	var gatherData = {};
	var dataToPie = [];

	var totalCounts = 0;
	
	for(i in dataArray){
		//console.log(i);
		if (Number.isInteger(parseInt(i))){
			if (gatherData.hasOwnProperty(dataArray[i])) gatherData[dataArray[i]] += 1;
			else gatherData[dataArray[i]] = 1;
		}
	}

	//console.log(gatherData);

	for(i in gatherData){
		totalCounts += parseInt(gatherData[i]);
	 	dataToPie.push({label: i, value: gatherData[i]});
	}

	callback(dataToPie, totalCounts);
}

function percentageTable(dataToPie, totalCounts){

	var toAppendBody = "";
	var toAppendHead = '<tr><td style="border: 1px solid black;padding: 10px;">Name</td><td style="border: 1px solid black;padding: 10px;">Absolute Counts</td><td style="border: 1px solid black;padding: 10px;">Relative Counts</td>';

	for(i=0; i<dataToPie.length; i++){
		toAppendBody += '<tr><td style="border: 1px solid black;padding: 10px;">' + dataToPie[i].label + '</td><td style="border: 1px solid black;padding: 10px;">' + dataToPie[i].value + '</td><td style="border: 1px solid black;padding: 10px;">' + (dataToPie[i].value/totalCounts).toFixed(2) + '</tr>';
	}

	$('#tablePercentages tbody').empty();
	$('#tablePercentages thead').empty();
	$('#tablePercentages tbody').append(toAppendBody);
	$('#tablePercentages thead').append(toAppendHead);
}


function GlobalPie(classname, data, startWidth, startHeight, r, pieID, columnName, graphObject)
    { 
        //color could be made a parameter

        var maxStringLength = 0;
        var dataNormalized = [];
        var countData = 0;
        var dataInOthers = [];
        var countOthers = 0;

        if (data.length > 19 && graphObject.modalMaxCategories == false){
        	$('#dialog').empty();
        	var toAppenddialog = '<div style="font-size:150%;text-align:center;">By default, only the top 20 results are displayed when assigning colours to the Tree Visualization. All the others are classified as <b><i>Others</i></b>.'+
        	'<br>To selected which categories you want to visualize, filter them by <i>performing queries on Tables</i> or by choosing categories using the <b><i>Choose categories</i></b> button located in the right side of the screen, in the Pie Chart legend.</div>';
        	$('#dialog').append(toAppenddialog);
        	$('#dialog').dialog({
		      height: $(window).height() * 0.3,
		      width: $(window).width() * 0.3,
		      modal: true,
		      resizable: true,
		      dialogClass: 'no-close success-dialog'
			});
        	graphObject.modalMaxCategories = true;

        }

        for(i in data){
        	if(countData > 18 && graphObject.changeFromFilterCategories != true){
        		//newObject.label = 'Others';
        		dataInOthers.push(data[i]);
        		countOthers++;
        	}
        	else if (graphObject.changeFromFilterCategories == true && graphObject.arrayOfCurrentCategories.indexOf(data[i].label) > -1){
        		dataNormalized.push(data[i]);
        	}
        	else if (graphObject.changeFromFilterCategories == true && graphObject.arrayOfCurrentCategories.indexOf(data[i].label) < 0){
        		dataInOthers.push(data[i]);
        		countOthers++;
        	}
        	else if(graphObject.changeFromFilterCategories != true){
        		dataNormalized.push(data[i]);
        	}
        	countData++;
        }

        if(dataInOthers.length > 0){
        	dataNormalized.push({label: 'Others', value: countOthers, data: dataInOthers});
        }

        var total = dataNormalized.length;

        graphObject.categoriesThatCanBeAdded = dataInOthers;
        if(dataNormalized[dataNormalized.length -1].label == 'Others'){
        	var addedCategories = dataNormalized.slice(0, dataNormalized.length -1);
        }
        else var addedCategories = dataNormalized;
        
        graphObject.categoriesAdded = addedCategories;


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
        	for (i in dataNormalized){
	    		arrayColorsIsolates.push(color(i).replace('#', '0x'));
	    		if(dataNormalized[i].label =='Others'){
	    			for(j in dataNormalized[i].data){
	    				property_IndexIsolates[dataNormalized[i].data[j].label] = i;
	    			}
	    		}
	    		else property_IndexIsolates[dataNormalized[i].label] = i;
	    	}
        }
        else if(pieID.indexOf('profiles') > -1){
        	arrayColorsProfiles = [];
        	property_IndexProfiles = {};

        	for (i in dataNormalized){
	    		arrayColorsProfiles.push(color(i).replace('#', '0x'));
	    		if(dataNormalized[i].label =='Others'){
	    			for(j in dataNormalized[i].data){
	    				property_IndexProfiles[dataNormalized[i].data[j].label] = i;
	    			}
	    		}
	    		else property_IndexProfiles[dataNormalized[i].label] = i;
	    	}

        }

        var SVheight = $('#col_info').height() - $('#currentpiePlace').height();

        var fontSize = $("#pauseLayout").css('font-size');

        fontSize = fontSize.replace('px', '');
        fontSize1 = parseFloat(fontSize);


        d3.select('#' + pieID).selectAll('svg').remove();
        d3.select('#legend' + pieID).selectAll('svg').remove();

        if( pieID.search('currentpieplace') > -1 ){
			increment = $('#col_info').width() - r * 2;
        } 
        else increment = r;

        var pie = d3.select('#' + pieID).append('svg').attr('id', "SV" + pieID).style('width', String(r * 2 + increment) + 'px').style('height', String(r*2 + fontSize1 * 5) + 'px')
            .append("svg:g").attr('id', 'P' + pieID).attr("transform", "translate(" + (r * 1.5) + "," + (r + fontSize1) +")")
                //.data([data.sort(d3.descending)])
                .data([dataNormalized])
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
					    .text( "TOTAL Categories" )
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
					                
					                textTop.text('Category: ' + d3.select(this).datum().data.label)
					                    .attr("y", fontSize1*2 + r);
					                textBottom.text('Counts: ' + d3.select(this).datum().data.value.toFixed(0))
					                    .attr("y", fontSize1*3 + r);
					            })
					            .on("mouseout", function(d) {
					                d3.select(this).select("path").transition()
					                    .duration(100)
					                    .attr("d", arc);
					                
					                textTop.text( "TOTAL Categories" )
					                    .attr("y", fontSize1*2 + r);
					                textBottom.text(total.toFixed(0));
					            });


        // var arcs = pie.selectAll("g.arc")
        //    .data(donut)
        //  .enter().append("svg:g")
        //    .attr("class", "arc");


        var paths = arcs.append("svg:path")
           .attr("class", function(d,i){ return 'piearc' + String(i); })
           .attr("fill", function(d, i) { return color(i); });
        
        var tweenPie = function (b) {
         b.innerRadius = 0;
         var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
         return function(t) {
           return arc(i(t));
         };
        }

        if(maxStringLength == 1) maxStringLength = 2;

        //var fontSize = $('#pauseLayout').css('font-size');


        var legend = d3.select('#legend' + pieID).append("svg")
        				.style("width", String(maxStringLength * fontSize1) + 'px')
					    .style("height", String(total * (startHeight * 1.5)) + 'px')
					    .attr("class", "legend")
					    .selectAll("g")
					    .data(dataNormalized)
					    .enter().append("g")
					    .attr("transform", function(d, i) { return "translate(0," + i * startHeight * 1.5  + ")"; });


		legend.append("rect")
		    .attr("width", String(startHeight) + 'px')
		    .attr("height", String(startHeight) + 'px')
		    .attr("class", function(d,i){ 
		    	if(pieID.search('currentpiePlace') > -1) return 'Colorpick legendrect' + String(i); 
		    	else return 'legendrect' + String(i); 
		    })
		    .attr("indexColor", function(d, i){ return i; })
		    .attr("value", function(d, i) { return color(i); })
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

         $('#legend' + pieID).css('height', String(legendHeight - (fontSize1 * 3)) + 'px');
        //$('#legendcurrentpiePlace').css({'height': legendHeight, "overflow-y": "auto"});

    }