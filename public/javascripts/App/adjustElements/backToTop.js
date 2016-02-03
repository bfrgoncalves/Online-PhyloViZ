
$(window).scroll(function(e){
	if($(window).scrollTop() > 100) $('#top-link-block').css({"display": "block"});
	else $('#top-link-block').css({"display": "none"});

});

$("img").click(function() {
	$('#' + this.id).colorbox({transition:"fade"});
});