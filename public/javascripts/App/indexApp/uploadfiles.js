
function status(message) {
    $('#status').text(message);
}


function submitTree(){

    event.preventDefault();
    var element = $('#selectDataset');
    var propertyToCheck = element.find(":selected")

    if(propertyToCheck[0].index != 0){
      window.location.replace("/main?datasetName=" + propertyToCheck.text());
    }
    else if($('#uploadProfile').val() == '' || $('#uploadMetadata').val() == '' || $('#datasetName').val() == '') {
      if ($('#datasetName').val() == '') $('#status').text('Dataset name is required.');
      else $('#status').text('At least one file is missing.');
    }
    else{
        $('#inputForm').submit();
    }
}

$('#inputForm').submit(function() {

    var datasetName = $('#datasetName').val()
    checkIfNameExists(datasetName);

    return false;
});


function uploadFiles(){

  status('Uploading files...');

  var img = document.getElementById('GIFimage');
  $("#GIFimage").attr("src", 'images/waitingGIF.gif').attr('width' , '50px').attr('height' , '50px');


  event.preventDefault();

  var form = document.getElementById('inputForm');
  var fileSelectProfile = document.getElementById('uploadProfile');
  var fileSelectMetadata = document.getElementById('uploadMetadata');
  var datasetName = document.getElementById('datasetName');

  
  var fd = new FormData();    
  fd.append( 'fileProfile', fileSelectProfile.files[0] );
  fd.append( 'fileMetadata', fileSelectMetadata.files[0] );
  fd.append( 'datasetName', $('#datasetName').val());
  

  $.ajax({
    url: '/api/db/upload',
    data: fd,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function(datasetName){
      getLinks(datasetName);
      status('Loading links...');
    }

  });
  

}

function getLinks(datasetName){

  $.ajax({
    url: '/api/algorithms/goeBURST',
    data: $.param({name: datasetName, save: true}),
    processData: false,
    contentType: false,
    type: 'GET',
    success: function(data){
      status('Done!');
      window.location.replace("/main?datasetName=" + data.datasetName);
    }

  });

}


function checkIfNameExists(datasetName){
    
    status('Checking if dataset exists...');

    $.ajax({
      url: '/api/db/datasets',
      data: $.param({name: datasetName}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        if(data.length > 0) status('Dataset name already exists!');
        else uploadFiles();
      }

    });
}


