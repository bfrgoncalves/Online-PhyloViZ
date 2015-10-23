
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