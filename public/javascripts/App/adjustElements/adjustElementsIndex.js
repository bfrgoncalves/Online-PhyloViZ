fontsize = function () {
    var ButtonDatasetsSize = $("#buttonExistingDatasets").width() * 0.06; // 10% of container width
    var ButtonSubmitfontSize = $("#inputDiv").width() * 0.018; // 10% of container width
    var ButtonfontSize = $("#inputDiv").width() * 0.014; // 10% of container width
    var ButtonfontSizeLogin = $("#inputDiv").width() * 0.018; // 10% of container width
    var titleFontSize = $("#inputDiv").width() * 0.022; // 10% of container width
    var titleFontSizeHome = $("#inputDiv").width() * 0.036; // 10% of container width

    $("body").css('font-size', ButtonfontSize);
    $('.btn').css('font-size', ButtonfontSize);
    $("#indexuserLocation").css('font-size', ButtonfontSizeLogin);
    $("label").css('font-size', ButtonfontSize * 1.3);
    $(".resizable_button").css('font-size', ButtonDatasetsSize);
    $(".resizable_button_submit").css('font-size', ButtonSubmitfontSize);
    $("#uploadDiv").css('font-size', ButtonfontSize);
    $("#divMessage").css('font-size', ButtonfontSize);
    $("#status").css('font-size', ButtonfontSize);
    $(".title").css('font-size', titleFontSize);
    $(".titleHome").css('font-size', titleFontSizeHome);
    $(".input-formats").css('font-size', ButtonfontSize * 1.1);

    $("body").css('opacity', 1);
};

$(window).resize(fontsize);
$(document).ready(fontsize);