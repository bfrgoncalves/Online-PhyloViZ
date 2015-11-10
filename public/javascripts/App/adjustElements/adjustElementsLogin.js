fontsize = function () {
    var ButtonDatasetsSize = $("#cancel").width() * 0.20; // 10% of container width
    var ButtonSubmitfontSize = $("#submitButton").width() * 0.30; // 10% of container width
    var ButtonfontSize = $("#submitButton").width() * 0.25; // 10% of container width
    var titleFontSize = $("#sign").width() * 0.05; // 10% of container width

    $("body").css('font-size', ButtonfontSize);
    $("#userLocation").css('font-size', ButtonfontSize * 1.1);
    $(".resizable_button").css('font-size', ButtonDatasetsSize);
    $(".resizable_button_submit").css('font-size', ButtonSubmitfontSize);
    $("#uploadDiv").css('font-size', ButtonfontSize);
    $("#divMessage").css('font-size', ButtonfontSize);
    $("#status").css('font-size', ButtonfontSize);
    $(".title").css('font-size', titleFontSize);

    $("body").css('opacity', 1);
};

$(window).resize(fontsize);
$(document).ready(fontsize);