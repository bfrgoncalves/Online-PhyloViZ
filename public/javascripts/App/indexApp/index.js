
$(document).ready( function(){

	createDatasetButtons();

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

function createDatasetButtons(){

	var isUploading = false;

	$('#buttonExistingDatasets').click(function(){
		status("");
		$('#LaunchButton').css({ 'display': 'block'});
		if (!isUploading) return false;
		if (isUploading){
			$('#uploadDiv').toggle();
			isUploading = false;
		} 
        $('#useDataset').toggle();
      });

	$('#buttonUploadDatasets').click(function(){
		status("");
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 0) $('#LaunchButton').css({ 'display': 'none'});
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