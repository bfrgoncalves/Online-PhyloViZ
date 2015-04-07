var viewInfo = function(node){
	//console.log(node);
	var parent = $('#InfoArea');
	parent.children().remove()
	var key = node.key;
	var profile = node.profile.toString();
	var numberIsolates = node.isolates.length;

	toWrite = 'Key : ' + key + '<br> profile : ' + profile + '<br>Number of Isolates : ' + numberIsolates;
	if (numberIsolates > 0) toWrite += '<button class = "btn btn-link" onclick(' + key + ')> View Isolates </button>' ;

	parent.append('<div>' + toWrite + '</div>');

}

var viewInfoIsolates = function(isolate){
	//console.log(isolate);
}