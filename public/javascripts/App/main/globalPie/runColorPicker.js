function runColorPicker(graphObject){

	var currentpicker = '';
	var arrayOfcol = [];

	$('#currentpiePlace').bind('DOMNodeInserted', function(event){

		if(event.currentTarget.id == 'pieisolates'){
				$('#pieprofiles').empty();
				$('#legendpieprofiles').empty();
				$('#divbuttonlinkpieprofiles').empty();
			}
		else if(event.currentTarget.id == 'pieprofiles'){
			$('#pieisolates').empty();
			$('#legendpieisolates').empty();
			$('#divbuttonlinkpieisolates').empty();
		}

			setTimeout(function(){

				$('.Colorpick').ColorPicker({
			      onSubmit: function(hsb, hex, rgb, el) {
			        indexOnArray = parseInt(d3.select(currentpicker).attr('indexColor'));
			        d3.select(currentpicker).attr('value', '#' + hex);
			        d3.selectAll('.legendrect' + indexOnArray).style('fill', '#' + hex);
			        d3.selectAll('.piearc' + indexOnArray).style('fill', '#' + hex);
			        if(!$('divisolates').is(':empty')){
			          arrayColorsIsolates[indexOnArray] = '0x' + hex;
			          arrayOfcol = arrayColorsIsolates;
			        }
			        else if(!$('divisolates').is(':empty')){
			          arrayColorsProfiles[indexOnArray] = '0x' + hex;
			          arrayOfcol = arrayColorsProfiles;
			        } 
			        changeNodeUIData(graphObject.objectOfType, graphics, graphObject.property_index, arrayOfcol, renderer);
			        $(el).val(hex);
			        $(el).ColorPickerHide();
			      },
			      onBeforeShow: function () {
			        currentpicker = this;
			        rectColor = d3.select(this).attr("value");
			        rectColor = rectColor.substring(1, rectColor.length);
			        $(this).ColorPickerSetColor(rectColor);
			      }
		    	});

			}, 500);

	});

	$('#distanceMatrix').bind('DOMNodeInserted', function(event){


			setTimeout(function(){

				$('.ColorpickerMatrix').ColorPicker({
			      onSubmit: function(hsb, hex, rgb, el) {
			        indexOnArray = parseInt(d3.select(currentpicker).attr('indexColor'));
			        d3.select(currentpicker).attr('value', '#' + hex);
			        graphObject.matrixColors[indexOnArray] = '#' + hex;
			        graphObject.matrixcolorScale = d3.scale.quantile()
					    .domain([0, graphObject.maxdistanceMatrix]) //d3.max(nodes, function (d) { return d.value; })
					    .range(graphObject.matrixColors);
			        d3.selectAll('.cell').style("fill", function(d) { return graphObject.matrixcolorScale(graphObject.currentdistanceMatrix[graphObject.selectedNodes[d.y].id][0][graphObject.selectedNodes[d.x].id]); })
			        d3.selectAll('.legendmatrix' + indexOnArray).style('fill', '#' + hex);

			        //$(el).val(hex);
			        $(el).ColorPickerHide();
			      },
			      onBeforeShow: function () {
			        currentpicker = this;
			        rectColor = d3.select(this).attr("value");
			        rectColor = rectColor.substring(1, rectColor.length);
			        $(this).ColorPickerSetColor(rectColor);
			      }
		    	});

			}, 500);

	});
        
	
}