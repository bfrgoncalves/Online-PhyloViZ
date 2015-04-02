var pathgl = this.pathgl = {}
pathgl.stop = function () {}
pathgl.context = function () { return gl }
var shaderRegistry = []
var id = (function id (i) { return function () { return i++ }})(1)

var inited = 0
var tasksOnce = []
pathgl.texture = function (image, o) {
  if (! inited) pathgl.init('canvas')
  return new Texture(image || false, o)
}

pathgl.uniform = function (attr, value) {
  return arguments.length == 1 ? uniforms[attr] : uniforms[attr] = value
}

pathgl.registerChunk = function (chunk) {
    shaderRegistry.push(chunk)
}

pathgl.applyCSS = applyCSSRules


HTMLCanvasElement.prototype.appendChild = function (el) {
  if (pathgl.init(this)) return this.appendChild(el)
}

var gl, program, programs
var textures = { null: [] }
var stopRendering = false
var tasks = []
var uniforms = {}
var start = 0

pathgl.init = function (canvas) {
  inited = 1
  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  if (! canvas.getContext) return console.log(canvas, 'is not a valid canvas')
  return !! init(canvas)
}

function mock (obj, meth) {
  var save = obj[meth]
  obj[meth] = function () { (obj[meth] = save).call(this, arguments) }
}
