
function onLoad(){

	createDatasetButtons();

	showProfileButton();

	checkDatasets(function(datasetsObject){
		$('#submitForm').click(function(){
			submitTree(datasetsObject);
		});
	});

	var optionsToDropDown = [{name: 'Profile Data'}, {name: 'Newick Data'}];
	createDropdown(optionsToDropDown, '#possibleInputFormats', 'Input formats', 1, 'inputFormats');

	$('#possibleInputFormats').change(function(){
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 1) showProfileButton();
		else if (propertyToCheck[0].index == 2) showNewickButton();
	});

	
}

function createDatasetButtons(){

	var isUploading = false;

	$('#buttonExistingDatasets').click(function(){
		status("");
		if (!isUploading) return false;
		if (isUploading){
			$('#uploadDiv').toggle();
			isUploading = false;
		} 
        $('#useDataset').toggle();
      });

	$('#buttonUploadDatasets').click(function(){
		status("");
		if (isUploading) return false;
		if (!isUploading){
			var table = $('#TableDatasets').DataTable();
			table.$('tr.selected').removeClass('selected');
			$('#useDataset').toggle();
			isUploading = true;
		} 
        $('#uploadDiv').toggle();
      });

}


function showProfileButton(){
	$('#newickButton').css('display', 'none');
	$('#profileButton').css('display', 'block');
}

function showNewickButton(){
	$('#profileButton').css('display', 'none');
	$('#newickButton').css('display', 'block');
}