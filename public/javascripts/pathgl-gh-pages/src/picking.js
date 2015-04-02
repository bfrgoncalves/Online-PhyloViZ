//cpu intersection tests
//offscreen render color test

var elCoordinates  = {}
var hoveringOver = []
function addEventListener(evt, listener, capture) {
  (elCoordinates[this.attr.cx | 0] = (elCoordinates[this.attr.cx | 0] || {})
  )[this.attr.cy | 0] = this
}

function pick (x, y) {
    elCoordinates[x] && elCoordinates[x][y] &&
    console.log('123')
  if (elCoordinates[x] && elCoordinates[x][y])
    hoveringOver.push(elCoordinates[x][y].trigger('mouseover'))
}


function proxyEvent(target) {
  this.target =  target
}


proxyEvent.prototype = extend(Object.create(null), {
  preventDefault: noop
, stopPropagation: noop
})
