
function updateMetadata(graphObject){

	var toAppend = '';

	toAppend += '<div id="updatemetadataButton">' +
				'<label style="font-size:120%;">Choose a file to update your auxiliary data:</label>'+
				'<p style="font-size:120%;">Previous auxiliary data will be detached from the tree.<br>The first column of the tree must be the <b>'+graphObject.graphInput.key+'</b> identifiers so that link is possible.</p>'+
				'<div class="input-group input-sm">' +
				'<input class="form-control" id ="textupdateMetadata" type="text" placeholder="Upload Auxiliary Data" aria-describedby="sizing-addon1" readonly="true"/>' +
				'<span class="input-group-addon" id="updateMetadata" onclick="getFile(this.id)">Browse</span>' +
				'</div>' +
				'</div>';

	toAppend += '<div style="height:0px;width:0px;overflow:hidden;"><form id ="updatemetadataForm">' +
				'<input id="inputupdateMetadata" type="file" value="upload" onchange = "getFileName(this.id)"/>' +
				'</form></div>';

	toAppend += '<div style="height:0px;width:0px;overflow:hidden;"><form id ="updatemetadataForm">' +
				'<input id="inputupdateMetadata" type="file" value="upload" onchange = "getFileName(this.id)"/>' +
				'</form></div>';

	toAppend += '<div id="updateLaunchButton" style="text-align:center;display:block;margin-top:5%;">' +
				'<button class="btn btn-primary resizable_button_submit" id="updatesubmitForm"> Update Metadata </button></div>';

	toAppend += '<div id="statusupdatemetadata" style="width:100%;text-align:center;"></div>';

	$('#dialog').empty();
	$('#dialog').append(toAppend);
	$('#dialog').dialog({
              height: $(window).height() * 0.4,
              width: $(window).width() * 0.4,
              modal: true,
              resizable: true,
              dialogClass: 'no-close success-dialog'
          });

	$('#updatesubmitForm').click(function(){
		if ($('#inputupdateMetadata').val() != ''){
			$('#updatemetadataForm').submit();
		}
	});

	$('#updatemetadataForm').submit(function(){
		changeMetadata(graphObject);
		return false;
	});
}

function statusupdateMetadata(message){
	$('#statusupdatemetadata').empty();
	if(message !="Update complete!") $('#statusupdatemetadata').append('<div style="margin:5%;"><img style="width:10%; height:auto;" src="/images/waitingGIF.gif"></img><label>' +message+ '</label></div>');
	else $('#statusupdatemetadata').append('<div style="margin:5%;"><label>' +message+ '</label></div>');
};

function getFile(id){

	var toCheck = 'input' + id;
	document.getElementById(toCheck).click();

}

function getFileName(id){
	
	var fileName = $('#' + id).val().split('\\').pop();
	var buttonToCheck = id.split('input')[1];
	$('#text' + buttonToCheck).attr("placeholder", fileName);	
}

function changeMetadata(graphObject){
	
	var form = document.getElementById('inputForm');
  	var fileSelectMetadata = document.getElementById('inputupdateMetadata');

  	var fd = new FormData();    
  	fd.append( 'datasetID', graphObject.datasetID );
  	fd.append( 'fileMetadata', fileSelectMetadata.files[0] );
  	fd.append( 'numberOfFiles', 1);

  	statusupdateMetadata('Uploading auxiliary data...');

  	$.ajax({
	    url: '/api/db/postgres/upload/metadata',
	    data: fd,
	    processData: false,
	    contentType: false,
	    type: 'POST',
	    success: function(data){
	      if(data.hasError == true){
	        $("#dialog").empty();
	        $("#dialog").append('<p>' + data.errorMessage + '</p>');
	        status('');
	        $("#waitingGif").css({'display': 'none'});
	        //$("#dialog").dialog();
	      }
	      else{
	        //$("#dialog").empty();
	        //$("#dialog").append('<p>Update Complete</p>');

	        statusupdateMetadata('Linking new auxiliary data...');
	        createInput(graphObject.datasetID, function(inputData){
	        	inputData.isPublic = graphObject.graphInput.isPublic;
	        	inputData.distanceMatrix = graphObject.graphInput.distanceMatrix;
	        	graphObject.graphInput = {};
	        	graphObject.graphInput = inputData;

	        	createTable(graphObject.graphInput, datasetID, 'isolates', function(){
	        		graphObject.isUpdateMetadata = true;
	        		colorAttributes(graphObject);
	        		linkTableAndGraph('isolates', graphObject);
	        		statusupdateMetadata('Update complete!');
	        		$("#selectByMetadata").val('1');
	        		$("#selectByMetadata").trigger("change");
	        		$('#noIsolates').css({"display": "none"});
	        		//graphObject.graphGL.forEachNode(function(node){
	        		  //console.log(node);
			        //});
	        	});

	        	//end update of all features and reset visualization by metadata
	        });
	      }
	    }

	  });
}






