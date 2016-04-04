
function PublicLink(graphObject){

      var datasetID = graphObject.datasetID;
      var isPublic = graphObject.graphInput.isPublic;

      if (isPublic == true){
            revokeLink(datasetID);
            graphObject.graphInput.isPublic = false;
            $('#generatePublicLinkButton').html('Generate Data Set Link');
      } 
      else {
            generateLink(datasetID);
            graphObject.graphInput.isPublic = true;
            $('#generatePublicLinkButton').html('Revoke Data Set Link');
      }
}

function getLink(graphObject){

      var datasetID = graphObject.datasetID;
      var isPublic = graphObject.graphInput.isPublic;

      alert('Here is the link to your dataset! It will work for 24 hours past upload time. \n\n' + window.location.href);
}

function generateLink(datasetID){

      $.ajax({
      url: '/api/utils/publiclink',
      type: 'GET',
      data: {
                  dataset_id: datasetID
            },
      dataType: "json",
      success: function(data){
            alert('Here is the public link to your dataset! \n\n' + data.url);
            //createLinkPlace(data);
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
      }
      });

}

function revokeLink(){
      
      urlToUse = '/api/db/postgres/update/all/is_public';
      $.ajax({
      url: urlToUse,
      type: 'PUT',
      data: {
                  dataset_id: datasetID,
                  change: false,
            },
      dataType: "json",
      success: function(data){
            alert('Your dataset is no longer shareable.');
      }
      });
}