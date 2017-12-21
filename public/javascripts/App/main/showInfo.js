
function showInfo(mergedNodes, sameNodeHas, graphics, node, e) {
	var nodeUI = graphics.getNodeUI(node.id);
	rData = nodeUI.rawData;
	pData = nodeUI.data;

	var toShow = '';
	var count = 0;
	toShow = '<b>Key</b>: ' + node.id;

  keyToShow = '';

  mergedNodes[node.id].forEach(function(mergedNode){
    keyToShow += ' and ' + mergedNode.key
  });

  keyToShow.substring(0, keyToShow.length - 6);

  toShow += ' ' + keyToShow;
	
	var newPercentageData = [];
	var total = 0;

	for(x in rData) total += rData[x];

	for (i in rData){
		toShow += '<hr style="padding:0px;margin:0px;border-top: 2px solid #ccc;"><br><b>Value</b>: ' + i + '<br><b>Frequency</b>: ' + rData[i] + '<br><b>Percentage</b>: ' + String(Math.round(rData[i]/total*100)) + '%';
		count += 1;
	}
	//$('#info_place').append('<p>' + toShow + '</p>');

  //var objDiv = document.getElementById("info_place");
  //objDiv.scrollTop = objDiv.scrollHeight;

  return toShow;
}

function showInfoLinks(link) {

	var toShow = '';
	toShow = '<br> Link:<br> From:' + link.fromId + '<br> To: ' + link.toId + '<br> Value: ' + link.data.value;
	

	$('#info_place').append('<p>' + toShow + '</p>');

  var objDiv = document.getElementById("info_place");
  objDiv.scrollTop = objDiv.scrollHeight;
}


//Information and pie legend manipulation

$('#clear_info').click(function(){
  $('#info_place').empty();
});

$('#toggle_col_legend').click(function(){
  if(this.innerHTML.search('Hide') > -1){
    this.innerHTML =  "Show Legend";

    $("#divButtonLegend").animate({
          right: '0%'
    });
    //$("#divButtonLegend").animate({deg: 90}, {
    //      step: function(now) {
                // in the step-callback (that is fired each step of the animation),
                // you can use the `now` paramter which contains the current
                // animation-position (`0` up to `angle`)
    //            $("#divButtonLegend").css({
    //                transform: 'rotate(-' + now + 'deg)',
    //            });

    //      }
    //  });

    $('#col_info').toggle(1000);

    if($("#outerColorLegendDiv").css("display") === "block"){
      $('#outerColorLegendDiv').toggle(1000);
    }
  }
  else if (this.innerHTML.search('Show') > -1){
    this.innerHTML = "Hide Legend";
    $("#divButtonLegend").animate({
          right: '10.5%'
          //opacity: 0
      });

    //$("#divButtonLegend").animate({deg: 0}, {
    //      step: function(now) {
                // in the step-callback (that is fired each step of the animation),
                // you can use the `now` paramter which contains the current
                // animation-position (`0` up to `angle`)
    //            $("#divButtonLegend").css({
    //                transform: 'rotate(-' + now + 'deg)',
    //            });

    //      }
    //  });

    $('#col_info').toggle(1000);

    if($("#outerColorLegendDiv").css("display") === "none"){
      $('#outerColorLegendDiv').toggle(1000);
    }
  }
  
});

$('#toggle_col_info').click(function(){
  if(this.innerHTML.search('Hide') > -1){
    setTimeout(function(){
      $("#divButtonInfoOutside").css({ bottom: '0%', display: 'block', left: '17.5%'});
    }, 900);
  }
  $('#col_information').animate({
      top: '100%',
      height: 'toggle',
      width: 'toggle'
    },
    {
      duration: 1000
    });
});

$("#toggle_col_in").click(function(){
  $('#col_information').animate({
      top: '78.5%',
      height: 'toggle',
      width: 'toggle'
    },
    {
      duration: 1000
    });
  $("#divButtonInfoOutside").css({ display: 'none'});
});

//Start hidden

$('#toggle_col_info').trigger('click');