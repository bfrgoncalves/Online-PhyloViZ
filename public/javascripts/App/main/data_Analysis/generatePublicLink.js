
function generatePublicLink(datasetID){

	$.ajax({
      url: '/api/utils/publiclink',
      type: 'GET',
      data: {
      		dataset_id: datasetID
      	},
      dataType: "json",
      success: function(data){
      	createLinkPlace(data);
        //console.log('done');
    	}
	});

	urlToUse = '/api/db/postgres/update/all/is_public';
	$.ajax({
      url: urlToUse,
      type: 'PUT',
      data: {
      		dataset_id: datasetID,
      		change: true,
      	},
      dataType: "json",
      success: function(data){
        //console.log('done');
      }
	});
}

function createLinkPlace(data){
	console.log(data);
	$('#publiclinkLocation').text(data.url);
}