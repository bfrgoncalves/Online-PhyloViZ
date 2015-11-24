$('#buttonPublicDatasets').on('click', function(){
		createPubMLSTcheckBoxes();
		if(onButtons.userdatasets){
			$('#useDataset').toggle();
			onButtons.userdatasets = false;
		} 
		else if(onButtons.uploaddatasets){
			$('#uploadDiv').toggle();
			onButtons.uploaddatasets = false;
		} 
		$('#publicDataset').toggle();
		onButtons.publicdatasets = true;

	});




function createPubMLSTcheckBoxes(){

	isolateRef = 'http://rest.pubmlst.org/';

	urlParts = isolateRef.split('/');
	urlParts = urlParts.slice(3, urlParts.length);
	console.log(urlParts);

	$.ajax({
	      url: '/api/pubmlst/',
	      data: $.param({forwardLink: JSON.stringify(urlParts)}),
	      processData: false,
	      contentType: false,
	      type: 'GET',
	      success: function(data){
	        createDatabaseBox(data);
	      }

	});
}

function createDatabaseBox(data){

	var databaseDiv = $('#publicdatabasesLocation');
	databaseDiv.append('<ul id="databaseList"></ul>');
	var databaseList = $('#databaseList'); 
	for(i in data){
		databaseList.append('<li ref="' + data[i].databases[0].href + '">' + data[i].description + '</li>');
	}
	//databaseList.css({'height': '30%', 'overflow-x': 'auto'});
	databaseDiv.css({'width': '30%', 'height': '200px', 'overflow-y': 'auto'});

	$('#databaseList li').on("click", function (){
		$('#publicisolatesLocation').empty();
		console.log($(this).attr("ref") + '/isolates');
		getpublicIsolates($(this).attr("ref") + '/isolates');
	})
}


function getpublicIsolates(isolateRef){
	console.log(isolateRef);
	urlParts = isolateRef.split('/');
	urlParts = urlParts.slice(3, urlParts.length);
	console.log(urlParts);
	$.ajax({
	      url: '/api/pubmlst/',
	      data: $.param({forwardLink: JSON.stringify(urlParts)}),
	      processData: false,
	      contentType: false,
	      type: 'GET',
	      success: function(data){
	        console.log(data);
	      }

	});
}