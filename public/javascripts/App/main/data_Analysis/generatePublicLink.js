
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
      launchDialog('Here is the link to the dataset!\n\n', window.location.href);
}

function launchDialog(message, url){

      $('#dialog').empty();
      var message = '<p>' + message + '</p>';
      var buttonToAdd = '';
      if (url != null){
            var buttonToAdd = '<button class="btn-clip" data-clipboard-text="'+url+'">Copy to clipboard</button>';
            $('#dialog').append('<div style="width:100%;text-align:center;">' + message + '<textarea style="width:80%;height:40%;resize:none;">'+url+'</textarea><br>' + buttonToAdd + '</div>');
      }
      else $('#dialog').append('<div style="width:100%;text-align:center;">' + message + '</div>');
      $('#dialog').dialog({
              height: $(window).height() * 0.20,
              width: $(window).width() * 0.20,
              modal: true,
              resizable: true,
              dialogClass: 'no-close success-dialog'
        });

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
            launchDialog('Here is the public link to your dataset! \n\n', data.url);
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
            launchDialog('Your dataset is no longer shareable.', null);
      }
      });
}