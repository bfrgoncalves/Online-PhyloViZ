function getFile(id){

	var toCheck = 'upload' + id;
	document.getElementById(toCheck).click();

}

function getFileName(id){
	
	var fileName = $('#' + id).val().split('\\').pop();
	var buttonToCheck = id.split('upload')[1];
	$('#text' + buttonToCheck).attr("placeholder", fileName);	
}


$('.justVisual').keydown(function(e) {
   e.preventDefault();
   return false;
});

$('.justVisual').mousedown(function(e) {
   e.preventDefault();
   return false;
});
