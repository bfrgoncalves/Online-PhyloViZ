function createPie(currentProperty){
	var indexToCheck;
	
	for (var i = 0; i< totalGraph.metadata.length; i++){
			if (currentProperty == totalGraph.metadata[i]){
				indexToCheck = i;
				//console.log(indexToCheck);
				break
			}
	}
	svg.selectAll('.Gnodes').each(function(d){
		var isolateCounts = 0;
		var ObjectOfvalues = {};
		var provisory = {};
		for (var isolatesIndex = 0; isolatesIndex <d.isolates.length;isolatesIndex++){
			//console.log(d.isolates);
			isolateCounts += 1;
			isolate = d.isolates[isolatesIndex];
			if (provisory[isolate[indexToCheck]] == null) provisory[isolate[indexToCheck]] = 0;
			provisory[isolate[indexToCheck]] += 1;
		}


		ObjectOfvalues = [];
		//console.log(d.x);

		for (var i in provisory){
			//var Topass = { label: i , value: provisory[i]};
			var Topass = provisory[i];
			ObjectOfvalues.push(Topass);
		}
		//ObjectOfvalues.totalIsolates = isolateCounts;
		//ObjectOfvalues.currentProperty = currentProperty;
		var data = d3.range(10).map(Math.random)
    	//console.log(d);
    	//console.log(ObjectOfvalues);
    	r = parseInt(d.isolates.length) + parseInt(nodeRadius)-1;
    	//console.log(r);
    	bakepie("pie", ObjectOfvalues, d.x, d.y, r,d.key);
		//createPie(currentProperty,ObjectOfvalues,d.key);
		//ObjectOfvalues = {};
		//currentDomain.push(String(d[currentProperty]));
	})
}

function bakepie(classname, data, x, y, r, circleID)
    { 
        //color could be made a parameter
        var color = d3.scale.category20()
        var arc = d3.svg.arc().outerRadius(r)
        var donut = d3.layout.pie();

        d3.select('#S' + circleID).selectAll('g').remove();

        var pie = d3.select('#S' + circleID)
            .append("svg:g").attr('id', 'P' + circleID)//.attr("transform", "translate(" + x + "," + y + ")")
                .data([data.sort(d3.descending)])
                .attr("class", classname);

        var arcs = pie.selectAll("g.arc")
           .data(donut)
         .enter().append("svg:g")
           .attr("class", "arc");


        var paths = arcs.append("svg:path")
           .attr("fill", function(d, i) { return color(i); });
        
        var tweenPie = function (b) {
         b.innerRadius = 0;
         var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
         return function(t) {
           return arc(i(t));
         };
        }

        var tweenDonut = function (b) {
         b.innerRadius = r * .6;
         var i = d3.interpolate({innerRadius: 0}, b);
         return function(t) {
           return arc(i(t));
         };
        }

        paths.transition()
           .ease("bounce")
           .duration(2000)
           .attrTween("d", tweenPie);

        paths.transition()
           .ease("elastic")
           .delay(function(d, i) { return 2000 + i * 50; })
           .duration(750)
           .attrTween("d", tweenDonut);


       	force.start();

    }
