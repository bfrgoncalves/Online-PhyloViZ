
function status(message) {
    $('#status').text(message);
}


function submitTree(){

    event.preventDefault();
    var element = $('#selectDataset');
    var propertyToCheck = element.find(":selected");

    if(propertyToCheck[0].index != 0){
      //console.log('AQUI');
      window.location.replace("/main/dataset/" + propertyToCheck.val());
    }
    else if ($('#datasetName').val() == '') $('#status').text('Dataset name is required.');
    else if ($('#possibleInputFormats').find(":selected")[0].index == 1 && $('#uploadProfile').val() == '') $('#status').text('Profile file is required.');
    else if ($('#possibleInputFormats').find(":selected")[0].index == 2 && $('#uploadNewick').val() == '')  $('#status').text('Newick file is required.');
    else $('#inputForm').submit();
    
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
  var fileSelectNewick = document.getElementById('uploadNewick');
  var datasetName = document.getElementById('datasetName');

  countNumberOfFiles = 0;

  if (fileSelectNewick.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectProfile.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectMetadata.files[0] != undefined) countNumberOfFiles += 1;

  
  var fd = new FormData();    
  fd.append( 'fileProfile', fileSelectProfile.files[0] );
  fd.append( 'fileMetadata', fileSelectMetadata.files[0] );
  fd.append( 'fileNewick', fileSelectNewick.files[0] );
  fd.append( 'datasetName', $('#datasetName').val());
  fd.append( 'numberOfFiles', countNumberOfFiles);
  

  $.ajax({
    url: '/api/db/postgres/upload',
    data: fd,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function(datasetID){
      //console.log(datasetName);
      if (fileSelectNewick.files[0] != undefined) window.location.replace("/main/dataset/" + datasetID);
      else getLinks(datasetID);
      status('Loading links...');
    }

  });
  

}

function getLinks(datasetID){

  $.ajax({
    url: '/api/algorithms/goeBURST',
    data: $.param({dataset_id: datasetID, save: true}),
    processData: false,
    contentType: false,
    type: 'GET',
    success: function(data){
      status('Done!');
      window.location.replace("/main/dataset/" + data.datasetID);
    }

  });

}

// function parseNewick(datasetName){

//   $.ajax({
//     url: '/api/utils/newickParser',
//     data: $.param({name: datasetName, save: true}),
//     processData: false,
//     contentType: false,
//     type: 'GET',
//     success: function(data){
//       status('Done!');
//       window.location.replace("/main?datasetName=" + data.datasetName);
//     }

//   });

// }


function checkIfNameExists(datasetName){
    
    status('Checking if dataset exists...');

    $.ajax({
      url: '/api/db/postgres/find/datasets/name',
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


