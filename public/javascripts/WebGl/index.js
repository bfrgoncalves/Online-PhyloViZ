Math.seedrandom(1);


var width = $(document).width(),
    height = $(document).height() - $('#navbarWebgl').height();

var prevNodeProgram = null;

var thisrgb = {
      r : 255,
      g : 0,
      b : 0
    }



function onLoad(){

    $('#visual').css({width:width, height: height, position: "relative"});

    constructGraph("./data/goeData.json");

}


function getRandomColor() {
    var color = (0x1000000+(Math.random())*0xffffff);
    return color;
}

function transformGraphToClient(nodePos) {
            //change graph coordinates to container coordinates
            console.log(nodePos);
            nodePos.x = width /2 + nodePos.x;
            nodePos.y = height / 2 + nodePos.y + 400;

            return nodePos;
}