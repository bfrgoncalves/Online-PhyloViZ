
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

	toUpdate = ["datasets", "profiles", "links", "newick", "isolates", "positions"];

	for (i in toUpdate){
		urlToUse = '/api/db/postgres/update/'+toUpdate[i]+'/is_public';
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


}

function createLinkPlace(data){
	$('#publiclinkLocation').text(data.url);
}