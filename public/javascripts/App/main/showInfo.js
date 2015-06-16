
function showInfo(graphics, node, e) {
	var nodeUI = graphics.getNodeUI(node.id);
	rData = nodeUI.rawData;
	pData = nodeUI.data;
	var toShow = '';
	var count = 0;
	toShow = '<br> Key: ' + node.id;
	for (i in rData){
		toShow += '<br>' + i + ': ' + rData[i] + ' - ' + String(Math.round((pData[count] / 360) * 100)) + '%';
		count += 1;
	}
	$('#col_info').append('<p>----------------------' + toShow + '</p>');
}