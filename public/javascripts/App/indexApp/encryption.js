
function onLoad(){
	$('#submitForm').submit(function(e){
		var password = $('#pass').val();
		var cryptohash = CryptoJS.SHA256(password);
		$('#pass').css('color', 'transparent');
		$('#pass').val(cryptohash);
	});
}
