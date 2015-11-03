
function showInfo(graphics, node, e) {
	var nodeUI = graphics.getNodeUI(node.id);
	rData = nodeUI.rawData;
	pData = nodeUI.data;

	var toShow = '';
	var count = 0;
	toShow = '<br> Key: ' + node.id;
	
	var newPercentageData = [];
	var total = 0;

	for(x in rData) total += rData[x];

	for (i in rData){
		toShow += '<br>' + i + ': ' + rData[i] + ' - ' + String(Math.round(rData[i]/total*100)) + '%';
		count += 1;
	}
	$('#info_place').append('<p>----------------------' + toShow + '</p>');
}

function showInfoLinks(link) {

	var toShow = '';
	toShow = '<br> Link:<br> From:' + link.fromId + '<br> To: ' + link.toId + '<br> Value: ' + link.data.value;
	

	$('#info_place').append('<p>----------------------' + toShow + '</p>');
}


//Information and pie legend manipulation

$('#toggle_col_legend').click(function(){
        if(this.innerHTML.search('Hide') > -1){
          this.innerHTML =  "Show Legend";
          $("#divButtonLegend").animate({
                left: '95%'
                //opacity: 0
            });
        }
        else if (this.innerHTML.search('Show') > -1){
          this.innerHTML = "Hide Legend";
          $("#divButtonLegend").animate({
                left: '82.5%'
                //opacity: 0
            });
        }
        $('#col_info').toggle(1000);
      });

      $('#toggle_col_info').click(function(){
        if(this.innerHTML.search('Hide') > -1){
          this.innerHTML =  "Show Information";
          $("#divButtonInfo").animate({
                top: '97%'
                //opacity: 0
            });
        }
        else if (this.innerHTML.search('Show') > -1){
          this.innerHTML = "Hide Information";
          $("#divButtonInfo").animate({
                top: '76%'
                //opacity: 0
            });
        }
        $('#col_information').toggle(1000);
      });