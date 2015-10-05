
function onLoad(){

	showProfileButton();

	checkDatasets();

	var optionsToDropDown = [{name: 'Profile Data'}, {name: 'Newick Data'}];
	createDropdown(optionsToDropDown, '#possibleInputFormats', 'Input formats', 1, 'inputFormats');

	$('#possibleInputFormats').change(function(){
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 1) showProfileButton();
		else if (propertyToCheck[0].index == 2) showNewickButton();
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