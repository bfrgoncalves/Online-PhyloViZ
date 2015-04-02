function init(c) {
    var o = (pathgl.options = pathgl.options || { })
    o.beforeDraw = o.beforeDraw || function () {}
    
  if (! (gl = initContext(canvas = c)))
    return !! console.log('webGL context could not be initialized')

  if (! gl.getExtension('OES_texture_float'))
    console.warn('does not support floating point textures')

  program = createProgram(gl, build_vs(pathgl.vertexShader), pathgl.fragmentShader)
  canvas.program = program
  monkeyPatch(canvas)
  bindEvents(canvas)
  var main = RenderTarget(canvas)
  main.drawTo(null)
  tasks.push(main.update)
  flags(gl)
  startDrawLoop()
  tasks.push(function () {
    pathgl.uniform('clock', Date.now() % 1e7)
  })
  return canvas
}

function flags(gl) {
  gl.clearColor(0,0,0,0)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
}

function bindEvents(canvas) {
  setInterval(resizeCanvas, 100)

  function resizeCanvas(v) {
    pathgl.uniform('resolution', [canvas.width || 960, canvas.height || 500])
  }

  canvas.addEventListener('click', clicked)
  canvas.addEventListener('mousemove', mousemoved)
  canvas.addEventListener('touchmove', touchmoved)
  canvas.addEventListener('touchstart', touchmoved)
  pathgl.uniform('mouse', pathgl.options.mouseOrigin || [.5, .5])
}

function clicked () {}

function mousemoved(e) {
  var rect = canvas.getBoundingClientRect()
    , x = e.clientX - rect.left - canvas.clientLeft
    , y = e.clientY - rect.top - canvas.clientTop
  pathgl.uniform('mouse', [x / rect.width, y / rect.height])
  pick(x | 0, y | 0)
}

function touchmoved(e) {
  var rect = canvas.getBoundingClientRect()
  e = e.touches[0]
  pathgl.uniform('mouse', [ e.clientX - rect.left - canvas.clientLeft, e.clientY - rect.top - canvas.clientTop ])
}

function monkeyPatch(canvas) {
  extend(canvas, appendable).gl = gl

  if(! window.d3) return

  extend(window.d3.selection.prototype, {
    vAttr: d3_vAttr
  , shader: d3_shader
  })

  extend(window.d3.transition.prototype, {
    vAttr: d3_vAttr
  , shader: d3_shader
  })
}

var appendable = {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: function (s) { return this.querySelectorAll(s)[0] }
  , removeChild: removeChild
  , insertBefore: insertBefore
  , ownerSVGElement: { createSVGPoint:
                       function o(x, y) { return { y: y || 0, x: x || 0,
                                                   matrixTransform: function (m) {
                                                     //debugger
                                                     return o(m.e, m.f) }} }}
  , __scene__: []
  , __program__: void 0
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl', pathgl.options) || canvas.getContext('experimental-webgl', pathgl.options)
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })


}

function d3_vAttr(attr, fn) {
  this.each(function(d, i) {
    this.xy[this.indices[0]] = fn(d, i)
  })
  return this
}

function d3_shader(attr, name) {
  this.node().batch.mergeProgram(pathgl.vertexShader, pathgl.fragmentShader, attr)
  return this
}

var raf = window.requestAnimationFrame
       || window.webkitRequestAnimationFrame
       || window.mozRequestAnimationFrame
       || function(callback) { window.setTimeout(callback, 1000 / 60) }

var backTasks = []
function startDrawLoop() {
  var i = tasks.length, swap
  while(i--) tasks[i]()

  swap = tasksOnce
  tasksOnce = [] //backTasks
  backTasks = swap
  while(backTasks.length) backTasks.pop()()
  raf(startDrawLoop)
}
