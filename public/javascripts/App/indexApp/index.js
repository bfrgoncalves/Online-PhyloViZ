
$(document).ready( function(){

	if(navigator.userAgent.toLowerCase().indexOf('chrome') < 0 && navigator.userAgent.toLowerCase().indexOf('safari') < 0)
    {
        var toAdd = 'We Apologize, but currently only Google Chrome and Safari web browsers are <b>fully  supported</b>. Performance is higher if you use Chrome.<br>' +
                 '<br>We are hoping (and working) to increase browser support soon.<br>' +
                  'In the meantime you can <b>Download Chrome</b> <a href="//www.google.com/chrome/browser/desktop/index.html">here</a>.<br>' +
                    '<br>You can use other web-browsers but be aware of known issues.<br>';
         
         $('#firefoxversionInfo').empty();
         $('#firefoxversionInfo').append('<div>'+toAdd+'</div>');
         $('#firefoxversionInfo').dialog({
              height: $(window).height() * 0.2,
              width: $(window).width() * 0.2,
              modal: true,
              resizable: true,
              dialogClass: 'no-close success-dialog'
          });

    }

	var onButtons = {
		home: true,
		about: false,
		api: false,
		userdatasets: false,
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

	var tutorialFunctions = tutorial('col_tutorial');
	tutorialFunctions.home();

	var optionsToDropDown = [{name: 'Profile Data'}, {name: 'Newick Data'}, , {name: 'Fasta Data'}];
	createDropdown(optionsToDropDown, '#possibleInputFormats', 'Input formats', 1, 'inputFormats');

	$('#possibleInputFormats').change(function(){
		$('#inputButtons').css({ 'display': 'block'});
		$('#LaunchButton').css({ 'display': 'block'});
		$('#uploadProfile').val('');
		$('#textProfile').attr('placeholder', 'Upload Profile Data');
  		$('#uploadMetadata').val('');
  		$('#textMetadata').attr('placeholder', 'Upload Auxiliary Data');
  		$('#uploadNewick').val('');
  		$('#textNewick').attr('placeholder', 'Upload Newick file');
  		$('#uploadFasta').val('');
  		$('#textFasta').attr('placeholder', 'Upload Fasta file');
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 0){
			$('#inputButtons').css({ 'display': 'none'});
			$('#LaunchButton').css({ 'display': 'none'});
		}
		$("#File1").val('');
		if (propertyToCheck[0].index == 1) showProfileButton();
		else if (propertyToCheck[0].index == 2) showNewickButton();
		else if (propertyToCheck[0].index == 3) showFastaButton();
	});

	$('#inputFormats').css({ 'width': '50%'});
	
});


function createDatasetButtons(onButtons){

	var tutorialFunctions = tutorial('col_tutorial');

	$('#buttonHelp').click(function(){
		$('#col_tutorial').toggle();
	});

	$('#buttonHome').click(function(){
		status("");
		var table = $('#tableuser').DataTable();
		table.$('tr').removeClass('selected');
		var table = $('#tablepublic').DataTable();
		table.$('tr').removeClass('selected');
		$('#LaunchButton').css({ 'display': 'none'});
		if (onButtons.home) return false;
		if (onButtons.uploaddatasets){
			$('#uploadDiv').toggle();
			onButtons.uploaddatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
		else if (onButtons.userdatasets){
			$('#userDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.about){
			$('#AboutDiv').toggle();
			onButtons.about = false;
		}
		else if (onButtons.api){
			$('#APIDiv').toggle();
			onButtons.api = false;
		}
		$('#homeDiv').toggle();
		$('#userDataset').css({"display": "none"});
        $('#uploadDiv').css({"display": "none"});
        $('#publicDataset').css({"display": "none"});
        $('#AboutDiv').css({"display": "none"});
        $('#APIDiv').css({"display": "none"});
        tutorialFunctions.home();
		onButtons.home = true;
	});

	$('#buttonAbout').click(function(){
		status("");
		var table = $('#tableuser').DataTable();
		table.$('tr').removeClass('selected');
		var table = $('#tablepublic').DataTable();
		table.$('tr').removeClass('selected');
		$('#LaunchButton').css({ 'display': 'none'});
		if (onButtons.about) return false;
		if (onButtons.uploaddatasets){
			$('#uploadDiv').toggle();
			onButtons.uploaddatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
		else if (onButtons.userdatasets){
			$('#userDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.home){
			$('#homeDiv').toggle();
			onButtons.home = false;
		}
		else if (onButtons.api){
			$('#APIDiv').toggle();
			onButtons.api = false;
		}
		$('#AboutDiv').toggle();
		$('#userDataset').css({"display": "none"});
        $('#uploadDiv').css({"display": "none"});
        $('#publicDataset').css({"display": "none"});
        $('#homeDiv').css({"display": "none"});
        $('#APIDiv').css({"display": "none"});
        tutorialFunctions.about();
		onButtons.about = true;
	});

	$('#buttonAPI').click(function(){
		status("");
		var table = $('#tableuser').DataTable();
		table.$('tr').removeClass('selected');
		var table = $('#tablepublic').DataTable();
		table.$('tr').removeClass('selected');
		$('#LaunchButton').css({ 'display': 'none'});
		if (onButtons.api) return false;
		if (onButtons.uploaddatasets){
			$('#uploadDiv').toggle();
			onButtons.uploaddatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
		else if (onButtons.userdatasets){
			$('#userDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.home){
			$('#homeDiv').toggle();
			onButtons.home = false;
		}
		else if (onButtons.about){
			$('#AboutDiv').toggle();
			onButtons.about = false;
		}
		$('#APIDiv').toggle();
		$('#userDataset').css({"display": "none"});
        $('#uploadDiv').css({"display": "none"});
        $('#publicDataset').css({"display": "none"});
        $('#homeDiv').css({"display": "none"});
        $('#AboutDiv').css({"display": "none"});
        tutorialFunctions.api();
		onButtons.api = true;
	});

	$('#buttonPublicDatasets').click(function(){
		status("");
		var table = $('#tableuser').DataTable();
		table.$('tr').removeClass('selected');
		$('#LaunchButton').css({ 'display': 'block'});
		if (onButtons.publicdatasets) return false;
		else if (onButtons.uploaddatasets){
			$('#uploadDiv').toggle();
			onButtons.uploaddatasets = false;
		}
		else if (onButtons.userdatasets){
			$('#userDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.home){
			$('#homeDiv').toggle();
			onButtons.home = false;
		}
		else if (onButtons.about){
			$('#AboutDiv').toggle();
			onButtons.about = false;
		}
		else if (onButtons.api){
			$('#APIDiv').toggle();
			onButtons.api = false;
		}
        $('#publicDataset').toggle();
        $('#userDataset').css({"display": "none"});
        $('#uploadDiv').css({"display": "none"});
        $('#homeDiv').css({"display": "none"});
        $('#AboutDiv').css({"display": "none"});
        $('#APIDiv').css({"display": "none"});
        tutorialFunctions.publicdatasets();
        onButtons.publicdatasets = true;
        var tableToUse = $('#tablepublic').DataTable();
		tableToUse.columns.adjust().draw();
	});

	$('#buttonUserDatasets').click(function(){
		status("");
		var table = $('#tablepublic').DataTable();
		table.$('tr').removeClass('selected');
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
		else if (onButtons.home){
			$('#homeDiv').toggle();
			onButtons.home = false;
		}
		else if (onButtons.about){
			$('#AboutDiv').toggle();
			onButtons.about = false;
		}
		else if (onButtons.api){
			$('#APIDiv').toggle();
			onButtons.api = false;
		}
        $('#userDataset').toggle();
        $('#publicDataset').css({"display": "none"});
        $('#uploadDiv').css({"display": "none"});
        $('#homeDiv').css({"display": "none"});
        $('#AboutDiv').css({"display": "none"});
        $('#APIDiv').css({"display": "none"});
        tutorialFunctions.userdatasets();
        onButtons.userdatasets = true;
        var tableToUse = $('#tableuser').DataTable();
		tableToUse.columns.adjust().draw();
      });

	$('#buttonUploadDatasets').click(function(){
		status("");
		var table = $('#tableuser').DataTable();
		table.$('tr').removeClass('selected');
		var table = $('#tablepublic').DataTable();
		table.$('tr').removeClass('selected');
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 0) $('#LaunchButton').css({ 'display': 'none'});

        if (onButtons.uploaddatasets) return false;
		else if (onButtons.userdatasets){
			$('#userDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
		else if (onButtons.home){
			$('#homeDiv').toggle();
			onButtons.home = false;
		}
		else if (onButtons.about){
			$('#AboutDiv').toggle();
			onButtons.about = false;
		}
		else if (onButtons.api){
			$('#APIDiv').toggle();
			onButtons.api = false;
		}
		$('#uploadDiv').toggle();
		$('#publicDataset').css({"display": "none"});
        $('#userDataset').css({"display": "none"});
        $('#homeDiv').css({"display": "none"});
        $('#AboutDiv').css({"display": "none"});
        $('#APIDiv').css({"display": "none"});
        tutorialFunctions.uploaddatasets();
		onButtons.uploaddatasets = true;
      });

	$('#logInFree').click(function(){
		status("");
		var table = $('#tableuser').DataTable();
		table.$('tr').removeClass('selected');
		var table = $('#tablepublic').DataTable();
		table.$('tr').removeClass('selected');
		var propertyToCheck = $('#possibleInputFormats').find(":selected");
		if (propertyToCheck[0].index == 0) $('#LaunchButton').css({ 'display': 'none'});

        if (onButtons.uploaddatasets) return false;
		else if (onButtons.userdatasets){
			$('#userDataset').toggle();
			onButtons.userdatasets = false;
		}
		else if (onButtons.publicdatasets){
			$('#publicDataset').toggle();
			onButtons.publicdatasets = false;
		}
		else if (onButtons.home){
			$('#homeDiv').toggle();
			onButtons.home = false;
		}
		else if (onButtons.about){
			$('#AboutDiv').toggle();
			onButtons.about = false;
		}
		else if (onButtons.api){
			$('#APIDiv').toggle();
			onButtons.api = false;
		}
		$('#uploadDiv').toggle();
		$('#publicDataset').css({"display": "none"});
        $('#userDataset').css({"display": "none"});
        $('#homeDiv').css({"display": "none"});
        $('#AboutDiv').css({"display": "none"});
        $('#APIDiv').css({"display": "none"});
        tutorialFunctions.uploaddatasets();
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