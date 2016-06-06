adjustElements = function () {

    var ButtonfontSize = $("#col_webgl").width() * 0.06; // 10% of container width

    if(ButtonfontSize < 1) ButtonfontSize = NaN;

    var heightTab = $(window).height() - $("#tabs_headers").height() - 50;

    heightTab = heightTab - heightTab * 0.06;

    var assignColorHeight = $("#assignCol").height();

    var width = $(window).width() - $(window).width() * 0.02,
    height = $(window).height() - $('#tabs').height() - $(window).width() * 0.02;
    pauseRegionHeight = $("#pauseRegion").height();
    
    //$('#layoutParameters').css({height: height-pauseRegionHeight, "overflow-y": "auto"});
    $('#buttonRegion').css({"overflow-y": "auto"});
    $('#labelsDiv').css({width: width, position: "absolute"});
    $('#visual').css({width: width, height: height, position: "relative"});

    $("body").css('font-size', ButtonfontSize);
    $('.btn').css('font-size', ButtonfontSize);
    $(".collapsebt").css('font-size', ButtonfontSize);
    $(".datasetInfoButton").css('font-size', ButtonfontSize);
    $("li").css('font-size', ButtonfontSize);
    //$("a").css('font-size', ButtonfontSize * 1.5);
    $(".login").css('font-size', ButtonfontSize * 1.2);
    $("i").css('font-size', ButtonfontSize);
    //$(".form-control").css({'font-size': ButtonfontSize, 'height': assignColorHeight, 'padding': 0});
    //$(".btn-search").css({'font-size': ButtonfontSize, 'height': assignColorHeight, 'padding': 0});
    $("h5").css('font-size', ButtonfontSize*1.2);
    $(".title").css('font-size', ButtonfontSize*2);
    $(".float_title").css('float', "right");
    $("#header_container").css('font-size', ButtonfontSize*1.5);
    $("#home_container").css('margin-top', '0%');
    $(".phylovizImage").css({'width': '12%'});
    $("#isolateContent").css({"height": heightTab + 'px'});
    $("#profileContent").css({"height": heightTab + 'px'});
    $("#distanceContent").css({"height": heightTab + 'px'});
    $("#FASTAContent").css({"height": heightTab + 'px'});

    $("body").css('opacity', 1);

    $(".actionButton").click(function () {
       $(this).toggleClass("sel");
    });


};

$(window).resize(adjustElements);
$(document).ready(adjustElements);