fontsize = function () {
    var ButtonDatasetsSize = $("#buttonExistingDatasets").width() * 0.06; // 10% of container width
    var ButtonSubmitfontSize = $("#submitForm").width() * 0.17; // 10% of container width
    var ButtonfontSize = $("#submitForm").width() * 0.15; // 10% of container width
    var titleFontSize = $("#inputDiv").width() * 0.03; // 10% of container width

    $("body").css('font-size', ButtonfontSize);
    $("#userLocation").css('font-size', ButtonfontSize * 1.5);
    $("label").css('font-size', ButtonfontSize * 1.5);
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