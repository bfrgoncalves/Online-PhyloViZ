adjustElements = function () {

    var ButtonfontSize = $("#col_webgl").width() * 0.06; // 10% of container width

    if(ButtonfontSize < 1) ButtonfontSize = NaN;

    var heightTab = $(window).height() - $("#tabs_headers").height() - 50;

    heightTab = heightTab - heightTab * 0.06;

    var assignColorHeight = $("#assignCol").height();

    var width = $(window).width() - $(window).width() * 0.05,
    height = $(window).height() - $('#tabs').height() - $(window).width() * 0.02;
    pauseRegionHeight = $("#pauseRegion").height();
    
    //$('#layoutParameters').css({height: height-pauseRegionHeight, "overflow-y": "auto"});
    $('#buttonRegion').css({"overflow-y": "auto"});
    $('#labelsDiv').css({width: width, position: "absolute"});
    $('#visual').css({width: width, height: height, position: "relative"});

    
    $("body").css({'font-size': '125%'});
    $('.btn').css({'font-size': '100%'});
    
    //$(".collapsebt").css({'font-size': '120%'});
    //$(".datasetInfoButton").css({'font-size': '120%'});
    $("li").css({'font-size': '100%'});
    //$("a").css('font-size', ButtonfontSize * 1.5);
    $(".login").css({'font-size': '120%'});
    $("i").css({'font-size': '95%'});
    
    
    //$(".form-control").css({'font-size': ButtonfontSize, 'height': assignColorHeight, 'padding': 0});
    //$(".btn-search").css({'font-size': '150%', 'height': assignColorHeight, 'padding': 0});
    $("h5").css({'font-size': '120%'});
    $(".title").css({'font-size': '140%'});
    $(".float_title").css('float', "right");
    $("#header_container").css({'font-size': '120%'});
    $("#home_container").css('margin-top', '0%');
    //$(".phylovizImage").css({'width': '12%'});
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