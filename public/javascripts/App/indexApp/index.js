
$(document).ready( function(){

	var onButtons = {
		userdatasets: true,
		uploaddatasets:false,
		publicdatasets: false
	}

	createDatasetButtons(onButtons);

	showProfileButton();

	checkDatasets(function(datasetsObject){
		$('#submitForm').click(function(){
			submitTree(datasetsObject);
		});
	});

	var optionsToDropDown = [{name: 'Profile Data'}, {name: 'Newick Data'}, , {name: 'Fasta Data'}];
	createDropdown(optionsToDropDown, '#possibleInputFormats', 'Input formats', 1, 'inputFormats');

	$('#possibleInputFormats').change(function(){
		$('#inputButtons').css({ 'display': 'block'});
		$('#LaunchButton').css({ 'display': 'block'});
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 0){
			$('#inputButtons').css({ 'display': 'none'});
			$('#LaunchButton').css({ 'display': 'none'});
		}
		if (propertyToCheck[0].index == 1) showProfileButton();
		else if (propertyToCheck[0].index == 2) showNewickButton();
		else if (propertyToCheck[0].index == 3) showFastaButton();
	});

	$('#inputFormats').css({ 'width': '50%'});
	
});


function createDatasetButtons(onButtons){


	$('#buttonExistingDatasets').click(function(){
		status("");
		$('#LaunchButton').css({ 'display': 'block'});
		if (onButtons.userdatasets) return false;
		else if (onButtons.uploaddatasets){
			$('#uploadDiv').toggle();
			onButtons.uploaddatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
        $('#useDataset').toggle();
        onButtons.userdatasets = true;
      });

	$('#buttonUploadDatasets').click(function(){
		status("");
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 0) $('#LaunchButton').css({ 'display': 'none'});

        if (onButtons.uploaddatasets) return false;
		else if (onButtons.userdatasets){
			$('#useDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
		$('#uploadDiv').toggle();
		onButtons.uploaddatasets = true;
      });

}


function showProfileButton(){
	$('#newickButton').css('display', 'none');
	$('#fastaButton').css('display', 'none');
	$('#profileButton').css('display', 'block');
}

function showNewickButton(){
	$('#profileButton').css('display', 'none');
	$('#fastaButton').css('display', 'none');
	$('#newickButton').css('display', 'block');
}

function showFastaButton(){
	$('#profileButton').css('display', 'none');
	$('#fastaButton').css('display', 'block');
	$('#newickButton').css('display', 'none');
}