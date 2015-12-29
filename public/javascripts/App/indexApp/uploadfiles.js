
function status(message) {
    $('#status').text(message);
}


function submitTree(NameToID){

    var tablepublic = $('#tablepublic').DataTable();
    var publicselectedrow = tablepublic.rows('.selected').data();

    var tableuser = $('#tableuser').DataTable();
    var userselectedrow = tableuser.rows('.selected').data();

    if(publicselectedrow[0] != undefined){
      window.location.replace("/main/dataset/public/" + NameToID["public"][0][publicselectedrow[0][0]]);
    }
    else if(userselectedrow[0] != undefined){
      window.location.replace("/main/dataset/" + NameToID["user"][0][userselectedrow[0][0]]);
    }
    else if ($('#datasetName').val() == '') $('#status').text('Dataset name is required.');
    else if ($('#possibleInputFormats').find(":selected")[0].index == 1 && $('#uploadProfile').val() == '') $('#status').text('Profile file is required.');
    else if ($('#possibleInputFormats').find(":selected")[0].index == 2 && $('#uploadNewick').val() == '')  $('#status').text('Newick file is required.');
    else $('#inputForm').submit();
    
}

$('#inputForm').submit(function() {

    var datasetName = $('#datasetName').val();
    checkIfNameExists(datasetName, function(){
      uploadFiles();
    });

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
  var fileSelectFasta = document.getElementById('uploadFasta');
  var datasetName = document.getElementById('datasetName');
  var makePublic = document.getElementById('makepublic').checked;

  countNumberOfFiles = 0;

  if (fileSelectNewick.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectProfile.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectMetadata.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectFasta.files[0] != undefined) countNumberOfFiles += 1;

  
  var fd = new FormData();    
  fd.append( 'fileProfile', fileSelectProfile.files[0] );
  fd.append( 'fileMetadata', fileSelectMetadata.files[0] );
  fd.append( 'fileNewick', fileSelectNewick.files[0] );
  fd.append( 'fileFasta', fileSelectFasta.files[0] );
  fd.append( 'datasetName', $('#datasetName').val());
  fd.append( 'dataset_description', $('#dataset_description').val());
  fd.append( 'numberOfFiles', countNumberOfFiles);
  fd.append( 'makePublic', makePublic);
  

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
      status('Computing links...');
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


function checkIfNameExists(datasetName, callback){
    
    status('Checking if dataset exists...');

    $.ajax({
      url: '/api/db/postgres/find/datasets/name',
      data: $.param({name: datasetName}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        if(isUser && data.userdatasets.length > 0 || !isUser && data.publicdatasets.length > 0) status('Dataset name already exists!');
        else callback();
      }

    });
}


