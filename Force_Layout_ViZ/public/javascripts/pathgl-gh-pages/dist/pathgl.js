! function() {
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
;function PriorityQ (leq) {
  this.keys_ = PriorityQ.prototype.PQKeyRenew_(false, PriorityQ.INIT_SIZE_)
  this.order_ = false
  this.size_ = 0
  this.max_ = PriorityQ.INIT_SIZE_
  this.initialized_ = false

  this.leq_ = (leq)

  this.heap_ = new Heap(this.leq_)
}

PriorityQ.INIT_SIZE_ = 32

PriorityQ.prototype.init = function() {
  this.order_ = []
  for (var i = 0; i < this.size_; i++) this.order_[i] = i
  var comparator = (function(keys, leq) {
    return function(a, b) {
      return leq(keys[a], keys[b]) ? 1 : -1
    }
  })(this.keys_, this.leq_)
  this.order_.sort(comparator)

  this.max_ = this.size_
  this.initialized_ = true
  this.heap_.init()

  var p = 0
  var r = p + this.size_ - 1
  for (i = p; i < r; ++i)
    debugT(this.leq_(this.keys_[this.order_[i+1]], this.keys_[this.order_[i]]))
}

PriorityQ.prototype.add = function(keyNew) {
  if (this.initialized_) return this.heap_.add(keyNew)

  var now = this.size_
  if (++this.size_ >= this.max_) {
    this.max_ *= 2
    this.keys_ = PriorityQ.prototype.PQKeyRenew_(this.keys_, this.max_)
  }

  this.keys_[now] = keyNew
  return -(now+1)
}

PriorityQ.prototype.PQKeyRenew_ = function(oldArray, size) {
  var newArray = new Array(size)
  var index = 0
  if (oldArray !== false)
    for (; index < oldArray.length; index++)
      newArray[index] = oldArray[index]

  for (; index < size; index++) newArray[index] = false

  return newArray
}

PriorityQ.prototype.keyLessThan_ = function(x, y) {
  var keyX = this.keys_[x]
  var keyY = this.keys_[y]
  return !this.leq_(keyY, keyX)
}

PriorityQ.prototype.keyGreaterThan_ = function(x, y) {
  var keyX = this.keys_[x]
  var keyY = this.keys_[y]
  return !this.leq_(keyX, keyY)
}

PriorityQ.prototype.findMin = function() {
  if (this.size_ === 0) return this.heap_.findMin()

  var sortMin = this.keys_[this.order_[this.size_-1]]
  if (!this.heap_.isEmpty()) {
    var heapMin = this.heap_.minimum()
    if (this.leq_(heapMin, sortMin)) return this.heap_.findMin()
  }

  do {
    --this.size_
  } while(this.size_ > 0 && this.keys_[this.order_[this.size_-1]] === false)

  return sortMin
}

PriorityQ.prototype.minimum = function() {
  if (this.size_ === 0) return this.heap_.minimum()

  var sortMin = this.keys_[this.order_[this.size_-1]]
  if (!this.heap_.isEmpty()) {
    var heapMin = this.heap_.minimum()
    if (this.leq_(heapMin, sortMin)) return heapMin
  }
  return sortMin
}

PriorityQ.prototype.isEmpty = function() {
  return (this.size_ === 0) && this.heap_.isEmpty()
}

PriorityQ.prototype.remove = function(now) {
  if (now >= 0) return this.heap_.remove(now)

  now = -(now+1)

  debugT(now < this.max_ && this.keys_[now] !== false)

  this.keys_[now] = false
  while(this.size_ > 0 && this.keys_[this.order_[this.size_-1]] === false)
    --this.size_
}


function Heap(leq) {
  this.ns_ = PQN.renew(false, Heap.INIT_SIZE_ + 1)
  this.handles_ = PQHandleElem.renew(false, Heap.INIT_SIZE_ + 1)
  this.size_ = 0
  this.max_ = Heap.INIT_SIZE_
  this.fList_ = 0
  this.initialized_ = false
  this.leq_ = leq
  this.ns_[1].handle = 1
}

Heap.INIT_SIZE_ = 32

Heap.prototype.killHeap = function() {
  this.handles_ = false
  this.ns_ = false
}

Heap.prototype.init = function() {
  for(var i = this.size_; i >= 1; --i)
    this.floatDown_(i)

  this.initialized_ = true
}

Heap.prototype.add = function(keyNew) {
  var now = ++this.size_, f

  if ((now*2) > this.max_) {
    this.max_ *= 2
    this.ns_ = PQN.renew(this.ns_, this.max_ + 1)
    this.handles_ = PQHandleElem.renew(this.handles_, this.max_ + 1)
  }

  if (this.fList_ === 0) f = now
  else {
    f = this.fList_
    this.fList_ = this.handles_[f].n
  }

  this.ns_[now].handle = f
  this.handles_[f].n = now
  this.handles_[f].key = keyNew

  if (this.initialized_) this.floatUp_(now)
  return f
}

Heap.prototype.isEmpty = function() {
  return this.size_ === 0
}

Heap.prototype.minimum = function() {
  return this.handles_[this.ns_[1].handle].key
}

Heap.prototype.findMin = function() {
  var n = this.ns_
  var h = this.handles_
  var hMin = n[1].handle
  var min = h[hMin].key

  if (this.size_ > 0) {
    n[1].handle = n[this.size_].handle
    h[n[1].handle].n = 1

    h[hMin].key = false
    h[hMin].n = this.fList_
    this.fList_ = hMin

    if (--this.size_ > 0 ) this.floatDown_(1)
  }

  return min
}

Heap.prototype.remove = function(hNow) {
  var n = this.ns_
  var h = this.handles_

  debugT(hNow >= 1 && hNow <= this.max_ && h[hNow].key !== false)

  var now = h[hNow].n
  n[now].handle = n[this.size_].handle
  h[n[now].handle].n = now

  if (now <= --this.size_) {
    (now <= 1 || this.leq_(h[n[now>>1].handle].key, h[n[now].handle].key)) ?
      this.floatDown_(now) :
      this.floatUp_(now)
  }

  h[hNow].key = false
  h[hNow].n = this.fList_
  this.fList_ = hNow
}

Heap.prototype.floatDown_ = function(now) {
  var n = this.ns_
  var h = this.handles_
  var hNow = n[now].handle
  for( ;; ) {
    var child = now << 1
    if (child < this.size_ && this.leq_(h[n[child+1].handle].key, h[n[child].handle].key)) ++child

    debugT(child <= this.max_)

    var hChild = n[child].handle
    if (child > this.size_ || this.leq_(h[hNow].key, h[hChild].key)) {
      n[now].handle = hNow
      return h[hNow].n = now
    }
    n[now].handle = hChild
    h[hChild].n = now
    now = child
  }
}

Heap.prototype.floatUp_ = function(now) {
  var n = this.ns_
  var h = this.handles_

  var hNow = n[now].handle
  for( ;; ) {
    var parent = now >> 1
    var hParent = n[parent].handle
    if (parent === 0 || this.leq_(h[hParent].key, h[hNow].key)) {
      n[now].handle = hNow
      return h[hNow].n = now
    }

    n[now].handle = hParent
    h[hParent].n = now
    now = parent
  }
}


function PQN() {
  this.handle = 0
}

PQN.renew = function(oldArray, size) {
  var newArray = new Array(size)
  var index = 0

  if (oldArray !== false)
    for (;index < oldArray.length; index++) newArray[index] = oldArray[index]

  for (;index < size; index++) newArray[index] = new PQN()

  return newArray
}

function PQHandleElem() {
  this.key = false
  this.n = 0
}

PQHandleElem.renew = function(oldArray, size) {
  var newArray = new Array(size)
    , index = 0

  if (oldArray !== false)
    for (;index < oldArray.length; index++) newArray[index] = oldArray[index]

  for (;index < size; index++) newArray[index] = new PQHandleElem()

  return newArray
}
;function noop () {}

function identity(x) { return x }

function push(d) { return [].push.call(this, d) }

function powerOfTwo(x) { return ((x != 0) && ! (x & (x - 1))) }

function nextSquare(n) { return Math.pow(Math.ceil(Math.sqrt(n)), 2) }

function each(obj, fn) { for (var key in obj) fn(obj[key], key, obj) }

function clamp(x, min, max) { return Math.min(Math.max(x, min), max) }

function invoke(list, method) { return list.map(function (d) { return d[method]() })  }

//left-top, left-bottom, right-bottom, right-top
function Quad() { return [-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, 1.0,  1.0] }
//0
//1
//2
//2
//3
//1
function Quad() { return [
   -1.0, -1.0,
    1.0, -1.0,
   -1.0,  1.0,

   -1.0,  1.0,
    1.0,  1.0,
    1.0, -1.0]
                }

function isVideoUrl(url) { return url.split('.').pop().join().match(/mp4|ogg|webm/) }

function flatten(list){ return list.reduce(function(p,n){ return p.concat(n) }, []) }

function svgToClipSpace(pos) { return [2 * (pos[0] / 960) - 1, 1 - (pos[1] / 500 * 2)] }

function append () { [].forEach.call(arguments, push, this) }

function hash(str) { return str.split("").reduce(function(a,b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0) }

function revRange(end) {
  var result = new Array(end), i = 0
  while(i < end) result[i] = end - (i++)
  return result
}

function mipmappable() {
  return !! (this.height == this.width && 
      powerOfTwo(this.height)
      && powerOfTwo(this.width)
      && (this.data || {}).constructor !== HTMLVideoElement
      )
}

function extend (a, b) {
  if (arguments.length > 2) [].forEach.call(arguments, function (b) { extend(a, b) })
  else for (var k in b) a[k] = b[k]
  return a
}

function onLoad (image, cb) {
  if (! image || image.complete || image.readyState == 4) cb()
  else image.addEventListener && image.addEventListener('load', cb)
}

function pointInPolygon(x, y, shape) {}

var checkerboard = (function() {
  var c = document.createElement('canvas').getContext('2d')
    , s = c.canvas.width = c.canvas.height = 128, y, x
  for (y = 0; y < s; y += 16)
    for (x = 0; x < s; x += 16)
      c.fillStyle = (x ^ y) & 16 ? '#FFF' : '#DDD',
      c.fillRect(x, y, 16, 16)
  return c.canvas
})()


function uniq(array, iterator) {
  var results = [], seen = {}
  each(iterator ? array.map(iterator) : array, function(value, index) {
      if (seen[value]) return
      seen[value] = true
      results.push(array[index])
    })
  return results
}

function debug (cond, message) {
  if (! cond) console.log(message)
}

function nyi () { debug(0, 'not yet implemented') }


function refract() {}
function reflect() {}
function faceforward() {}
function normalize() {}
function cross() {}
function dot() {}
function distance() {}
function smoothstep() {}
function mix() {}
function step() {}

function fract(x) {
  return x - (x | 0)
}
;function parseColor(v) {
  var a = setStyle(v)
  return + (a[0] * 255) << 16 ^ (a[1] * 255) << 8 ^ (a[2] * 255) << 0
}

function hexColor( hex ) {
  hex = Math.floor(hex)
  return [ (hex >> 16 & 255) / 255
         , (hex >> 8 & 255) / 255
         , (hex & 255) / 255
         ]
}

function parse_hsl(h, s, l) {
  if (s === 0) return [l, l, l]
  var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s)
    , q = (2 * l) - p

  return [
    hue2rgb(q, p, h + 1 / 3)
  , hue2rgb(q, p, h)
  , hue2rgb(q, p, h - 1 / 3)
  ]
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t)
  return p
}

function setStyle(style) {
  if (cssColors[style])
    return hexColor(cssColors[style])

  if (/^hsl/i.test(style)) {
    var hsl = style.split(/,|\(/).map(parseFloat)
    return parse_hsl(hsl[1] / 360 , hsl[2] / 100, hsl[3] / 100)
  }

  if (/^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.test(style)) {
    var color = /^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.exec(style)
    return [ Math.min(255, parseInt(color[1], 10)) / 255
           , Math.min(255, parseInt(color[2], 10)) / 255
           , Math.min(255, parseInt(color[3], 10)) / 255
           ]
  }

  if (/^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.test(style)) {
    var color = /^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.exec(style)
    return [ Math.min(100, parseInt(color[1], 10)) / 100
           , Math.min(100, parseInt(color[2], 10)) / 100
           , Math.min(100, parseInt(color[3], 10)) / 100
           ]
  }

  if (/^\#([0-9a-f]{6})$/i.test(style)) {
    var color = /^\#([0-9a-f]{6})$/i.exec(style)
    return hexColor( parseInt(color[1], 16))
  }

  if (/^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(style)) {
    var color = /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(style)
    return hexColor(parseInt(color[1] + color[1] + color[2] + color[2] + color[3] + color[3], 16))
  }

  return false
}

var cssColors = {
  "aliceblue": 0xF0F8FF, "antiquewhite": 0xFAEBD7, "aqua": 0x00FFFF, "aquamarine": 0x7FFFD4, "azure": 0xF0FFFF
, "beige": 0xF5F5DC, "bisque": 0xFFE4C4, "black": 0x000000, "blanchedalmond": 0xFFEBCD, "blue": 0x0000FF, "blueviolet": 0x8A2BE2
, "brown": 0xA52A2A, "burlywood": 0xDEB887, "cadetblue": 0x5F9EA0, "chartreuse": 0x7FFF00, "chocolate": 0xD2691E, "coral": 0xFF7F50
, "cornflowerblue": 0x6495ED, "cornsilk": 0xFFF8DC, "crimson": 0xDC143C, "cyan": 0x00FFFF, "darkblue": 0x00008B, "darkcyan": 0x008B8B
, "darkgoldenrod": 0xB8860B, "darkgray": 0xA9A9A9, "darkgreen": 0x006400, "darkgrey": 0xA9A9A9, "darkkhaki": 0xBDB76B
, "darkmagenta": 0x8B008B, "darkolivegreen": 0x556B2F, "darkorange": 0xFF8C00, "darkorchid": 0x9932CC, "darkred": 0x8B0000
, "darksalmon": 0xE9967A, "darkseagreen": 0x8FBC8F, "darkslateblue": 0x483D8B, "darkslategray": 0x2F4F4F, "darkslategrey": 0x2F4F4F
, "darkturquoise": 0x00CED1, "darkviolet": 0x9400D3, "deeppink": 0xFF1493, "deepskyblue": 0x00BFFF, "dimgray": 0x696969
, "dimgrey": 0x696969, "dodgerblue": 0x1E90FF, "firebrick": 0xB22222, "floralwhite": 0xFFFAF0, "forestgreen": 0x228B22
, "fuchsia": 0xFF00FF, "gainsboro": 0xDCDCDC, "ghostwhite": 0xF8F8FF, "gold": 0xFFD700, "goldenrod": 0xDAA520
, "gray": 0x808080, "green": 0x008000, "greenyellow": 0xADFF2F, "grey": 0x808080, "honeydew": 0xF0FFF0, "hotpink": 0xFF69B4
, "indianred": 0xCD5C5C, "indigo": 0x4B0082, "ivory": 0xFFFFF0, "khaki": 0xF0E68C, "lavender": 0xE6E6FA, "lavenderblush": 0xFFF0F5
, "lawngreen": 0x7CFC00, "lemonchiffon": 0xFFFACD, "lightblue": 0xADD8E6, "lightcoral": 0xF08080
, "lightcyan": 0xE0FFFF, "lightgoldenrodyellow": 0xFAFAD2, "lightgray": 0xD3D3D3
, "lightgreen": 0x90EE90, "lightgrey": 0xD3D3D3, "lightpink": 0xFFB6C1, "lightsalmon": 0xFFA07A, "lightseagreen": 0x20B2AA
, "lightskyblue": 0x87CEFA, "lightslategray": 0x778899, "lightslategrey": 0x778899, "lightsteelblue": 0xB0C4DE
, "lightyellow": 0xFFFFE0, "lime": 0x00FF00, "limegreen": 0x32CD32, "mediumpurple": 0x9370DB
, "mediumseagreen": 0x3CB371, "mediumslateblue": 0x7B68EE, "mediumspringgreen": 0x00FA9A, "mediumturquoise": 0x48D1CC
, "mediumvioletred": 0xC71585, "midnightblue": 0x191970, "mintcream": 0xF5FFFA, "mistyrose": 0xFFE4E1, "moccasin": 0xFFE4B5
, "navajowhite": 0xFFDEAD,"navy": 0x000080, "oldlace": 0xFDF5E6, "olive": 0x808000, "olivedrab": 0x6B8E23
, "orange": 0xFFA500, "orangered": 0xFF4500, "orchid": 0xDA70D6, "palegoldenrod": 0xEEE8AA, "palegreen": 0x98FB98
, "paleturquoise": 0xAFEEEE, "palevioletred": 0xDB7093, "papayawhip": 0xFFEFD5
, "peachpuff": 0xFFDAB9, "peru": 0xCD853F, "pink": 0xFFC0CB, "plum": 0xDDA0DD, "powderblue": 0xB0E0E6, "purple": 0x800080
, "red": 0xFF0000, "rosybrown": 0xBC8F8F, "royalblue": 0x4169E1, "saddlebrown": 0x8B4513, "salmon": 0xFA8072
, "sandybrown": 0xF4A460, "seagreen": 0x2E8B57, "seashell": 0xFFF5EE, "sienna": 0xA0522D, "silver": 0xC0C0C0, "skyblue": 0x87CEEB
, "slateblue": 0x6A5ACD, "slategray": 0x708090, "slategrey": 0x708090, "snow": 0xFFFAFA
, "springgreen": 0x00FF7F, "steelblue": 0x4682B4, "tan": 0xD2B48C, "teal": 0x008080, "thistle": 0xD8BFD8
, "tomato": 0xFF6347, "turquoise": 0x40E0D0, "violet": 0xEE82EE, "wheat": 0xF5DEB3, "white": 0xFFFFFF, "whitesmoke": 0xF5F5F5
, "yellow": 0xFFFF00, "yellowgreen": 0x9ACD32
}
;pathgl.shader = shader

function shader() {
  var  target = null
    , blockSize
    , stepRate = 2
    , dependents = []

  var self = {
    scatter: scatter
    , reduce: reduce
    , scan: scan
    , map: map
    , match: matchWith
    , pipe: pipe
    , invalidate: invalidate
  }

  var render = RenderTarget({
    gl: gl
  , batch: simMesh()
  })

  self.render = render
  var children = []
  tasks.push(step)

  function step() {
    for(var i = -1; ++i < stepRate;) render.update()
  }

  return self

  function scatter(lambda) {

  }

  function scan(lambda) {

  }

  function reduce(lambda) {

  }

  function map (shader) {
    render.mergeProgram(simulation_vs, particleShader)
    return this
  }

  function read () {
    //render.batch.addMaterial(texture)
  }

  function invalidate() {
    // dependents.forEach(function (d) {
    //   d.invalidate()
    // })
  }

  function draw () {}

  function matchWith(shader) {
    var replace = shader()//takes 64 matched averages and tiles
                  .shared('uv', 'tex1.xy') //varyings
                  .map('gl_fragcolor = texel(uv);') //recolor square
                  .pipe(dependents)

    var search = shader() //takes 2 list of averages
                 .sort('float comparator(vec2 a, vec2 b) { return a > b ? a : b }')
                 .map('bsearch')
                 .pipe(replace)

    var hsl2RGB =
         'void main (){'
         + 'float a = texel(uv);'
          + 'float maxC = max(a.r, a.g, a.b)'
         + 'float minC = min(a.r, a.g, a.b)'
         + 'float lightness = (maxC + minC) * .5'
         + 'float  delta = maxC - minC'
         + 'float saturation = lightness <= 0.5 ? delta / ( maxC + minC ) : delta / ( 2 - maxC - minC )'
         + 'float hue = maxC == a.r ?  (a.g - a.b ) / delta + ( a.g < a.b ? 6 : 0 )'
                   + ': maxC == a.g  ? ( a.b - a.r ) / delta + 2'
                   + ': ( a.r - a.g ) / delta + 4;'
         + 'hue /= 6'
         + 'gl_FragColor = vec3(hue, saturation, threadIdx.xy);'
         + '}'

    dependencies.map(function (d) {
      var averages = shader()
      .blocksize(64, 64)
      .gridsize(8, 8)
      .map(hsl2RGB)
      .reduce(shader) //1024^2 -> 64^2
      .pipe(search)

      d.pipe(averages)
      d[1].pipe(replace)
    })

    //this.children.push(subKernels, matchKernel)
    return this
  }

  function spawnChild () {

  }

  function pipe (ctx) {
    render.drawTo(ctx)

    ctx && dependents.push(ctx)
    return self
  }
}

function simMesh() {
  return Mesh(gl, { xy: { array: Quad(), size: 2 }
                  , attrList: ['xy']
                  , count: 6
                  , primitive: 'triangles'
                  })
}
;pathgl.vertexShader = [
  'uniform float clock;'
, 'uniform vec2 mouse;'
, 'uniform vec2 resolution;'
, 'uniform vec2 dates;'
, 'uniform vec4 baseColor;'
, 'uniform vec4 lightColor;'
, 'uniform float logo;'

, 'attribute vec2 xy;'
, 'attribute vec2 r;'
, 'attribute vec2 color;'
, 'attribute vec2 fugue;'

, 'varying float type;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying vec4 dim;'

, 'uniform sampler2D texture0;'

, 'vec4 tex(vec2 get) { '
, '  return texture2D(texture0, abs(get));'
, '}'

, 'vec4 unpack_color(float col) {'
, '    return vec4(mod(col / 256. / 256., 256.),'
, '                mod(col / 256. , 256.),'
, '                mod(col, 256.),'
, '                256. - fugue.x)'
, '                / 256.;'
, '}'

, 'vec2 clipspace(vec2 pos) { return vec2(2. * (pos.x / resolution.x) - 1., 1. - ((pos.y / resolution.y) * 2.)); }'

,'float noise (){ return ((sin(clock / 100.) + 1.) /2. + (sin(xy.x / 100.) + 1.) / 2.) / 2.  ;}'

, '//chunks' 

, 'void main() {'
, '    float time = clock / 1000.;'
, '    float pointSize = replace_r;'
, '    float x = replace_x;'
, '    float y = replace_y;'
, '    float fill = color.x;'
, '    float stroke = color.x;'

, '    type = float(pointSize > 0.);'
, '    gl_PointSize =  pointSize;'
, '    v_fill = unpack_color(fill);'

, '    dim = vec4(x, y, pointSize, -pointSize);'
, '    v_stroke = replace_stroke;'
, '    gl_Position = vec4(clipspace(vec2(x, y)),  1., 1.);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'uniform vec2 resolution;'
, 'uniform vec2 dates;'
, 'uniform sampler2D texture0;'
, 'uniform sampler2D texture1;'

, 'varying float type;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying vec4 dim;'

, 'vec4 chos(vec2 get, float n) { '
, '  if (n == -1.)return texture2D(texture1, abs(get));'
, '  if (n == -2.) return texture2D(texture0, abs(get));'
, '}'

, 'vec2 clipspace(vec2 pos) { return vec2(2. * (pos.x / resolution.x) - .5, 1. - ((pos.y / resolution.y))); }'

, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (type == 1. && dist > 0.5) discard;'
, '    gl_FragColor = (v_stroke.x < 0.) ? chos(clipspace(dim.xy) * 2., -1.0)  : v_stroke;'
, '}'
].join('\n')

function createProgram(gl, vs_src, fs_src, attributes) {
    vs_src = vs_src.replace('//chunks', shaderRegistry.join('\n'))

  var src = vs_src + '\n' + fs_src
  program = gl.createProgram()



  var vs = compileShader(gl, gl.VERTEX_SHADER, vs_src)
    , fs = compileShader(gl, gl.FRAGMENT_SHADER, fs_src)

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)

  gl.deleteShader(vs)
  gl.deleteShader(fs)

  ;(attributes || ['xy', 'color', 'r', 'fugue']).forEach(function (d, i){
     gl.bindAttribLocation(program, i, d)
   })

  gl.linkProgram(program)
  gl.useProgram(program)
  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  var re = /uniform\s+(\S+)\s+(\S+)\s*;/g, match = null
  while ((match = re.exec(src)) != null) bindUniform(match[2], match[1])

  program.merge = mergify(vs, fs)
  program.gl = gl

  return program

  function bindUniform(key, type) {
    var loc = gl.getUniformLocation(program, key)
      , method = 'uniform' + glslTypedef(type)
      , keep

    program[key] = function (data) {
      //if (keep == data || ! arguments.length) return

      if (data.map && data.length > 4)
        gl[method](loc, gl.FALSE, Array.isArray(data) ? data : [data])
      else
        gl[method](loc, Array.isArray(data) ? data : [data])

      keep = data
    }
  }
}

function build_vs(src, subst) {
  each(subst || {}, function (v, k, o) {
    if (k == 'cx') o['x'] = v
    if (k == 'cy') o['y'] = v
  })

    var defaults = extend({
      stroke: '(stroke < 0.) ? vec4(stroke)  : unpack_color(stroke)'
    , r: '(r.x < 0.) ? clamp(abs(tex(xy.xy).w) + abs(tex(xy.xy).z) * 4., 2., 10.): (2. * r.x)'
    , x: '(xy.x < 1.) ? tex(xy.xy).x * resolution.x : xy.x'
    , y: '(xy.y < 1.) ? tex(xy.xy).y * resolution.y : xy.y'
    }, subst)

  for(var attr in defaults)
    src = src.replace('replace_'+attr, defaults[attr])

  return src
}

function compileShader (gl, type, src) {
  var header = 'precision mediump float;\n'
  var shader = gl.createShader(type)
  gl.shaderSource(shader, header + src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var log = (gl.getShaderInfoLog(shader) || '')
      , line = + log.split(':')[2]
    return console.error((src || '').split('\n').slice(line-5, line + 5).join('\n'), log)
  }
  return shader
}

function glslTypedef(type) {
  if (type == 'sampler2D') return '1i'
  if (type.match('mat')) return 'Matrix' + type[type.length - 1] +'fv'
  if (type.match('vec')) return type[type.length - 1] + 'fv'
  return '1fv'
}

function mergify(vs1, fs1, subst1) {
  return function (vs2, fs2, subst2) {
    fs2 = fs2 || pathgl.fragmentShader
    vs2 = build_vs(vs2, subst2)
    return createProgram(this.gl, vs2, fs2)
  }
}
;function init(c) {
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
;//based roughly on triangle.h by jonathan shewchuk

function triangulate(curves) {
  triangulator.Perp(0, 0, 1)
  var t = []
  triangulator.StartShape(t)
  for (var i = 0; i < curves.length; i++) {
    triangulator.StartCurve()
    var curve = curves[i]
    for (var j = 0; j < curve.length; j += 2) {
      var xys = [curve[j], curve[j+1], 0]
      triangulator.point(xys, xys)
    }
    triangulator.EndCurve()
  }
  triangulator.EndShape()
  return t
}

var debugT = function (cond) {
  //debugger
  debug(cond, 'Could not Triangulate...') }

function T() {
  this.state = T.cond.T_SLEEP
  this.perp = [0, 0, 0]
  this.s = [0, 0, 0]
  this.t = [0, 0, 0]

  this.relEpsilon = T._EPSILON
  this.command = T.command.COMM_ODD
  this.storeCount = 0
  this.store = new Array(T.MALA_MAX_STORE)

  for (var i = 0; i < T.MALA_MAX_STORE;  i++)
    this.store[i] = new T.storepoint()
}

T.sweepDebugEvent = function(mala) {}
T.MAX_XY = 1e150
T.MALA_MAX_STORE = 100
T.EPSILON = 0
T.S__X_ = 1
T.S__Y_ = 0
T.SIGN_INCONSISTENT_ = 2
T.cond = { T_SLEEP: 0
         , T_IN_SHAPE: 1
         , T_IN_CURVE: 2
         }

T.command = { COMM_ODD: 100130
            , COMM_NONZERO: 100131
            , COMM_POSITIVE: 100132
            , COMM_NEGATIVE: 100133
            , COMM_ABS_GEQ_TWO: 10013
            }

var primitive = { LINE_LOOP: 2
                , MALAANGLES: 4
                , MALAANGLE_SMALAP: 5
                , MALAANGLE_FAN: 6
                }

T.failureType = {
  MISSING_START_SHAPE: 100151,
  MISSING_END_SHAPE: 100153,
  MISSING_START_CURVE: 100152,
  MISSING_END_CURVE: 100154,
  XY_TOO_BIG: 100155,
  NEED_COMBINE_BACK: 100156
}

T.opt =  { SURFACE: 100112
         , EPSILON: 100142
         , COMM_RULE: 100140
         , LINE_ONLY: 100141
         , INVALID_: 100900
         , INVALID_VALUE: 100901
         , START: 100100
         , POINT: 100101
         , END: 100102
         , FAILURE: 100103
         , LINE_FLAG: 100104
         , COMBINE: 100105
         , START_STAT: 100106
         , POINT_STAT: 100107
         , END_STAT: 100108
         , FAILURE_STAT: 100109
         , LINE_FLAG_STAT: 100110
         , COMBINE_STAT: 100111
         }

T.storepoint = function() {
  this.xys = [0, 0, 0]
}

T.prototype.Perp = function(x, y, z) {
  this.perp[0] = x
  this.perp[1] = y
  this.perp[2] = z
}

T.prototype.on = function (w, fn) {
  fn = fn || false

  if (T.opt.START)  this.Start_ = (fn)
  if (w == T.opt.START_STAT)  this.StartStat_ = (fn)
  if (w == T.opt.LINE_FLAG) this.flagLine = (!!fn)
  if (w == T.opt.LINE_FLAG_STAT) this.flagLine = (!!fn)
  if (w == T.opt.POINT)  this.point_ = (fn)
  if (w == T.opt.POINT_STAT)  this.pointStat_ = (fn)
  if (w == T.opt.END)  this.End_ = (fn)
  if (w == T.opt.END_STAT)  this.EndStat_ = (fn)
  if (w == T.opt.FAILURE)  this.Failure_ = (fn)
  if (w == T.opt.FAILURE_STAT)  this.FailureStat_ = (fn)
  if (w == T.opt.COMBINE)  this.Combine_ = (fn)
  if (w == T.opt.COMBINE_STAT)  this.CombineStat_ = (fn)
  if (w == T.opt.SURFACE)  this.layer_ = (fn)

  return this
}

T.prototype.point = function(xys, stat) {
  var tooBig = false
  var clamped = [0, 0, 0]

  this.requireState_(T.cond.T_IN_CURVE)

  if (this.es) {
    this.empty_store()
    this.lastLine_ = false
  }

  for (var i = 0; i < 3; ++i) {
    var x = xys[i]
    if (x < -T.MAX_XY) {
      x = -T.MAX_XY
      tooBig = true
    }
    if (x > T.MAX_XY) {
      x = T.MAX_XY
      tooBig = true
    }
    clamped[i] = x
  }

  if (tooBig) this.FailureOrFailureStat(T.failureType.XY_TOO_BIG)

  if (this.surface === false) {
    if (this.storeCount < T.MALA_MAX_STORE) return this.sp(clamped, stat)
    this.empty_store()
  }

  this.addpoint_(clamped, stat)
}

T.prototype.StartShape = function(stat) {
  this.requireState_(T.cond.T_SLEEP)

  this.state = T.cond.T_IN_SHAPE
  this.storeCount = 0
  this.es = false
  this.surface = false

  this.shapeStat_ = stat
}

T.prototype.StartCurve = function() {
  this.requireState_(T.cond.T_IN_SHAPE)
  this.state = T.cond.T_IN_CURVE
  this.lastLine_ = false
  if (this.storeCount > 0) this.es = true
}

T.prototype.EndCurve = function() {
  this.requireState_(T.cond.T_IN_CURVE)
  this.state = T.cond.T_IN_SHAPE
}

T.prototype.EndShape = function() {
  this.requireState_(T.cond.T_IN_SHAPE)
  this.state = T.cond.T_SLEEP

  if (this.surface === false) {
    if (!this.flagLine && !this.layer_ && T.drawStore(this)) return this.shapeStat_ = false
    this.empty_store()
  }
  T.projectShape(this)
  T.computeInner(this)

  if (!this.fatalFailure) {
    this.lineOnly ?
      T.FollowId(this.surface, 1, true) :
      T.patchInner(this.surface)

    this.surface.fixlayer()

    if (this.Start_ || this.End_ || this.point_ ||
        this.LineFlag_ || this.StartStat_ || this.EndStat_ ||
        this.pointStat_ || this.LineFlagStat_) {

      this.lineOnly ?
        T.drawLine(this, this.surface) :
        T.drawlayer(this, this.surface)
    }

    if (this.layer_) {
      T.discardOuter(this.surface)
      this.layer_(this.surface)
      this.surface = false
      return this.shapeStat_ = false
    }
  }

  T.surface.killlayer(this.surface)
  this.shapeStat_ = false
  this.surface = false
}

T.prototype.makeSleep_ = function() {
  if (this.surface) T.surface.killlayer(this.surface)
  this.state = T.cond.T_SLEEP
  this.lastLine_ = false
  this.surface = false
}

T.prototype.requireState_ = function(state) {
  if (this.state !== state) this.gotoState_(state)
}

T.prototype.gotoState_ = function(newState) {
  while (this.state !== newState) {
    if (this.state < newState) {
      switch (this.state) {
        case T.cond.T_SLEEP:
          this.FailureOrFailureStat(T.failureType.MISSING_START_SHAPE)
          return this.StartShape(false)
        case T.cond.T_IN_SHAPE:
          this.FailureOrFailureStat(T.failureType.MISSING_START_CURVE)
          return this.StartCurve()
      }
    } else {
      switch (this.state) {
        case T.cond.T_IN_CURVE:
          this.FailureOrFailureStat(T.failureType.MISSING_END_CURVE)
          return this.EndCurve()
        case T.cond.T_IN_SHAPE:
          this.FailureOrFailureStat(T.failureType.MISSING_END_SHAPE)
          return this.makeSleep_()
      }
    }
  }
}

T.prototype.addpoint_ = function(xys, stat) {
  var e = this.lastLine_
  if (e === false) {
    e = T.surface.makeLine(this.surface)
    T.surface.surfaceSplit(e, e.sym)
  } else {
    T.surface.splitLine(e)
    e = e.lThere
  }

  e.org.stat = stat
  e.org.xys[0] = xys[0]
  e.org.xys[1] = xys[1]
  e.org.xys[2] = xys[2]
  e.follow = 1
  e.sym.follow = -1
  this.lastLine_ = e
}

T.prototype.sp = function(xys, stat) {
  var v = this.store[this.storeCount]
  v.stat = stat
  v.xys[0] = xys[0]
  v.xys[1] = xys[1]
  v.xys[2] = xys[2]
  ++this.storeCount
}

T.prototype.empty_store = function() {
  this.surface = new T.layer()
  for (var i = 0; i < this.storeCount; i++) {
    var v = this.store[i]
    this.addpoint_(v.xys, v.stat)
  }
  this.storeCount = 0
  this.es = false
}

T.prototype.StartOrStartStat = function(type) {
  this.StartStat_ ?
    this.StartStat_(type, this.shapeStat_) :
    this.Start_ && this.Start_(type)
}

T.prototype.pointOrpointStat = function(stat) {
  this.pointStat_ ?
    this.pointStat_(stat, this.shapeStat_) :
    this.point_ && this.point_(stat)
}

T.prototype.LineFlagOrLineFlagStat = function(flag) {
  this.LineFlagStat_ ?
    this.LineFlagStat_(flag, this.shapeStat_) :
    this.LineFlag_ && this.LineFlag_(flag)
}

T.prototype.EndOrEndStat = function() {
  this.EndStat_ ?
    this.EndStat_(this.shapeStat_) :
    this.End_ && this.End_()
}

T.prototype.CombineOrCombineStat = function(xys, stat, depth) {
  var interpStat = this.CombineStat_ ?
    this.CombineStat_(xys, stat, depth, this.shapeStat_) :
    this.Combine_(xys, stat, depth)
  return interpStat === undefined ?  interpStat = false :  interpStat
}

T.prototype.FailureOrFailureStat = function(errno) {
  this.FailureStat_ ?
    this.FailureStat_(errno, this.shapeStat_) :
    this.Failure_ && this.Failure_(errno)
}

T.DictN = function() {
    this.key = false
    this.there = false
    this.prev = false
}

T.Dict = function(frame, leq) {
  this.start = new T.DictN()
  this.start.there = this.start
  this.start.prev = this.start
  this.frame = frame
  this.leq_ = (leq)
}

T.Dict.prototype.addBefore = function(n, key) {
  do {
    n = n.prev
  } while(n.key !== false && !this.leq_(this.frame, n.key, key))

  var newN = new T.DictN()
  newN.key = key
  newN.there = n.there
  n.there.prev = newN
  newN.prev = n
  n.there = newN
  return newN
}

T.Dict.prototype.add = function(key) {
  return this.addBefore(this.start, key)
}

T.Dict.prototype.killN = function(n) {
  n.there.prev = n.prev
  n.prev.there = n.there
}

T.Dict.prototype.search = function(key) {
  var n = this.start
  do {
    n = n.there
  } while(n.key !== false && !this.leq_(this.frame, key, n.key))
  return n
}

T.PQN = function() {
    this.handle = 0
}

T.PQN.renew = function(oldArray, size) {
  var newArray = new Array(size)
  var index = 0

  if (oldArray !== false)
    for (;index < oldArray.length; index++) newArray[index] = oldArray[index]

  for (;index < size; index++) newArray[index] = new T.PQN()

  return newArray
}
T.PQHandleElem = function() {
    this.key = false
    this.n = 0
}

T.PQHandleElem.renew = function(oldArray, size) {
  var newArray = new Array(size)
  var index = 0
  if (oldArray !== false)
    for (;index < oldArray.length; index++) newArray[index] = oldArray[index]

  for (;index < size; index++) newArray[index] = new T.PQHandleElem()

  return newArray
}

T.fixOrientation_ = function(mala) {
  var area = 0
  var fStart = mala.surface.fStart
  for (var f = fStart.there; f !== fStart; f = f.there) {
    var e = f.anLine
    if (e.follow <= 0) { continue }
    do {
      area += (e.org.s - e.dst().s) * (e.org.t + e.dst().t)
      e = e.lThere
    } while(e !== f.anLine)
  }

  if (area < 0) {
    var vStart = mala.surface.vStart
    for (var v = vStart.there; v !== vStart; v = v.there) v.t = - v.t
    mala.t[0] = -mala.t[0]
    mala.t[1] = -mala.t[1]
    mala.t[2] = -mala.t[2]
  }
}

T.patchSpace_ = function(face) {
  var up = face.anLine
  debugT(up.lThere !== up && up.lThere.lThere !== up)

  while(T.pointLeq(up.dst(), up.org)) up = up.lPrev()
  while(T.pointLeq(up.org, up.dst())) up = up.lThere

  var lo = up.lPrev()
    , tempHalfLine
  while (up.lThere !== lo) {
    if (T.pointLeq(up.dst(), lo.org)) {
      while (lo.lThere !== up && (T.lineGoesLeft(lo.lThere) ||
          T.lineSign(lo.org, lo.dst(), lo.lThere.dst()) <= 0)) {

        tempHalfLine = T.surface.connect(lo.lThere, lo)
        lo = tempHalfLine.sym
      }
      lo = lo.lPrev()

    } else {
      while (lo.lThere !== up && (T.lineGoesRight(up.lPrev()) ||
          T.lineSign(up.dst(), up.org, up.lPrev().org) >= 0)) {

        tempHalfLine = T.surface.connect(up, up.lPrev())
        up = tempHalfLine.sym
      }
      up = up.lThere
    }
  }
  debugT(lo.lThere !== up)
  while (lo.lThere.lThere !== up) {
    tempHalfLine = T.surface.connect(lo.lThere, lo)
    lo = tempHalfLine.sym
  }
}

T.surface = function() {}

T.surface.makeLine = function(surface) {
  var e = T.surface.makeLinePair_(surface.eStart)
  T.surface.makepoint_(e, surface.vStart)
  T.surface.makepoint_(e.sym, surface.vStart )
  T.surface.makeFace_(e, surface.fStart)

  return e
}

T.surface.surfaceSplit = function(eOrg, eDst) {
  var joiningLoops = false
  var joiningPoints = false

  if (eOrg === eDst) return

  if (eDst.org !== eOrg.org) {
    joiningPoints = true
    T.surface.killpoint_(eDst.org, eOrg.org)
  }

  if (eDst.lFace !== eOrg.lFace) {
    joiningLoops = true
    T.surface.killFace_(eDst.lFace, eOrg.lFace)
  }

  T.surface.split_(eDst, eOrg)

  if (!joiningPoints) {
    T.surface.makepoint_(eDst, eOrg.org)
    eOrg.org.anLine = eOrg
  }

  if (!joiningLoops) {
    T.surface.makeFace_(eDst, eOrg.lFace)
    eOrg.lFace.anLine = eOrg
  }
}


T.surface.killLine = function(eDel) {
  var eDelSym = eDel.sym
  var joiningLoops = false

  if (eDel.lFace !== eDel.rFace()) {
    joiningLoops = true
    T.surface.killFace_(eDel.lFace, eDel.rFace())
  }

  if (eDel.oThere === eDel) T.surface.killpoint_(eDel.org, false)
  else {
    eDel.rFace().anLine = eDel.oPrev()
    eDel.org.anLine = eDel.oThere

    T.surface.split_(eDel, eDel.oPrev())

    if (!joiningLoops) T.surface.makeFace_(eDel, eDel.lFace)
  }

  if (eDelSym.oThere === eDelSym ) {
    T.surface.killpoint_(eDelSym.org, false)
    T.surface.killFace_(eDelSym.lFace, false)
  } else {
    eDel.lFace.anLine = eDelSym.oPrev()
    eDelSym.org.anLine = eDelSym.oThere
    T.surface.split_(eDelSym, eDelSym.oPrev())
  }

  T.surface.killLine_(eDel)
}

T.surface.addLinepoint = function(eOrg) {
  var eNew = T.surface.makeLinePair_(eOrg)
  var eNewSym = eNew.sym

  T.surface.split_(eNew, eOrg.lThere)
  eNew.org = eOrg.dst()
  T.surface.makepoint_(eNewSym, eNew.org )

  eNew.lFace = eNewSym.lFace = eOrg.lFace

  return eNew
}

T.surface.splitLine = function(eOrg) {
  var tempHalfLine = T.surface.addLinepoint(eOrg)
  var eNew = tempHalfLine.sym

  T.surface.split_(eOrg.sym, eOrg.sym.oPrev())
  T.surface.split_(eOrg.sym, eNew)

  eOrg.sym.org = eNew.org
  eNew.dst().anLine = eNew.sym
  eNew.sym.lFace = eOrg.rFace()
  eNew.follow = eOrg.follow
  eNew.sym.follow = eOrg.sym.follow

  return eNew
}

T.surface.connect = function(eOrg, eDst) {
  var joiningLoops = false
  var eNew = T.surface.makeLinePair_(eOrg)
  var eNewSym = eNew.sym

  if (eDst.lFace !== eOrg.lFace) {
    joiningLoops = true
    T.surface.killFace_(eDst.lFace, eOrg.lFace)
  }

  T.surface.split_(eNew, eOrg.lThere)
  T.surface.split_(eNewSym, eDst)

  eNew.org = eOrg.dst()
  eNewSym.org = eDst.org
  eNew.lFace = eNewSym.lFace = eOrg.lFace


  eOrg.lFace.anLine = eNewSym

  if (!joiningLoops) T.surface.makeFace_(eNew, eOrg.lFace )
  return eNew
}

T.surface.zapFace = function(fZap) {
  var eStart = fZap.anLine
    , eThere = eStart.lThere
    , e

  do {
    e = eThere
    eThere = e.lThere
    e.lFace = false

    if (e.rFace() === false) {
      if (e.oThere === e) T.surface.killpoint_(e.org, false)
      else {
        e.org.anLine = e.oThere
        T.surface.split_(e, e.oPrev())
      }

      var eSym = e.sym
      if (eSym.oThere === eSym) T.surface.killpoint_(eSym.org, false)
      else {
        eSym.org.anLine = eSym.oThere
        T.surface.split_(eSym, eSym.oPrev())
      }
      T.surface.killLine_(e)
    }
  } while(e !== eStart)

  var fPrev = fZap.prev
  var fThere = fZap.there
  fThere.prev = fPrev
  fPrev.there = fThere
}

T.surface.surfaceUnion = function(surface1, surface2) {
  var f1 = surface1.fStart
  var v1 = surface1.vStart
  var e1 = surface1.eStart

  var f2 = surface2.fStart
  var v2 = surface2.vStart
  var e2 = surface2.eStart

  if (f2.there !== f2) {
    f1.prev.there = f2.there
    f2.there.prev = f1.prev
    f2.prev.there = f1
    f1.prev = f2.prev
  }

  if (v2.there !== v2) {
    v1.prev.there = v2.there
    v2.there.prev = v1.prev
    v2.prev.there = v1
    v1.prev = v2.prev
  }

  if (e2.there !== e2) {
    e1.sym.there.sym.there = e2.there
    e2.there.sym.there = e1.sym.there
    e2.sym.there.sym.there = e1
    e1.sym.there = e2.sym.there
  }

  return surface1
}

T.surface.killlayer = function(surface) {}


T.surface.makeLinePair_ = function(eThere) {
  var e = new T.HalfLine()
  var eSym = new T.HalfLine()
  var ePrev = eThere.sym.there
  eSym.there = ePrev
  ePrev.sym.there = e
  e.there = eThere
  eThere.sym.there = eSym

  e.sym = eSym
  e.oThere = e
  e.lThere = eSym

  eSym.sym = e
  eSym.oThere = eSym
  eSym.lThere = e

  return e
}

T.surface.split_ = function(a, b) {
  var aOThere = a.oThere
  var bOThere = b.oThere
  aOThere.sym.lThere = b
  bOThere.sym.lThere = a
  a.oThere = bOThere
  b.oThere = aOThere
}

T.surface.makepoint_ = function(eOrig, vThere) {
  var vPrev = vThere.prev
  var vNew = new T.point(vThere, vPrev)
  vPrev.there = vNew
  vThere.prev = vNew
  vNew.anLine = eOrig
  var e = eOrig

  do {
    e.org = vNew
    e = e.oThere
  } while(e !== eOrig)
}

T.surface.makeFace_ = function(eOrig, fThere) {
  var fPrev = fThere.prev
  var fNew = new T.Face(fThere, fPrev)


  fPrev.there = fNew
  fThere.prev = fNew
  fNew.anLine = eOrig
  fNew.inside = fThere.inside

  var e = eOrig
  do {
    e.lFace = fNew
    e = e.lThere
  } while(e !== eOrig)
}

T.surface.killLine_ = function(eDel) {
  var eThere = eDel.there
  var ePrev = eDel.sym.there
  eThere.sym.there = ePrev
  ePrev.sym.there = eThere
}

T.surface.killpoint_ = function(vDel, newOrg) {
  var eStart = vDel.anLine
  var e = eStart
  do {
    e.org = newOrg
    e = e.oThere
  } while(e !== eStart)

  var vPrev = vDel.prev
  var vThere = vDel.there
  vThere.prev = vPrev
  vPrev.there = vThere
}

T.surface.killFace_ = function(fDel, newLFace) {
  var eStart = fDel.anLine
  var e = eStart
  do {
    e.lFace = newLFace
    e = e.lThere
  } while(e !== eStart)

  var fPrev = fDel.prev
  var fThere = fDel.there
  fThere.prev = fPrev
  fPrev.there = fThere
}


T.Face = function(opt_thereFace, opt_prevFace) {
    this.there = opt_thereFace || this
    this.prev = opt_prevFace || this
    this.anLine = false
    this.stat = false
    this.trail = false
    this.marked = false
    this.inside = false
}

T.HalfLine = function(opt_thereLine) {
    this.there = opt_thereLine || this
    this.sym = false
    this.oThere = false
    this.lThere = false
    this.org = false
    this.lFace = false
    this.region = false
    this.follow = 0
}

T.HalfLine.prototype.rFace = function() {
  return this.sym.lFace
}

T.HalfLine.prototype.dst = function() {
  return this.sym.org
}

T.HalfLine.prototype.oPrev = function() {
  return this.sym.lThere
}

T.HalfLine.prototype.lPrev = function() {
  return this.oThere.sym
}

T.HalfLine.prototype.dPrev = function() {
  return this.lThere.sym
}

T.HalfLine.prototype.rPrev = function() {
  return this.sym.oThere
}

T.HalfLine.prototype.dThere = function() {
  return this.rPrev().sym
}

T.HalfLine.prototype.rThere = function() {
  return this.oPrev().sym
}

T.point = function(opt_therepoint, opt_prevpoint) {
    this.there = opt_therepoint || this
    this.prev = opt_prevpoint || this
    this.anLine = false
    this.stat = false
    this.xys = [0, 0, 0]
    this.s = 0
    this.t = 0
    this.pqHandle = false
}

T.layer = function() {
  this.vStart = new T.point()
  this.fStart = new T.Face()
  this.eStart = new T.HalfLine()
  this.eStartSym = new T.HalfLine()
  this.eStart.sym = this.eStartSym
  this.eStartSym.sym = this.eStart
}

T.layer.prototype.fixlayer = function() {
  var fStart = this.fStart
  var vStart = this.vStart
  var eStart = this.eStart
  var e
  var f
  var fPrev = fStart

  for (fPrev = fStart; (f = fPrev.there) !== fStart; fPrev = f) {
    debugT(f.prev === fPrev)
    e = f.anLine
    do {
      debugT(e.sym !== e)
      debugT(e.sym.sym === e)
      debugT(e.lThere.oThere.sym === e)
      debugT(e.oThere.sym.lThere === e)
      debugT(e.lFace === f)
      e = e.lThere
    } while(e !== f.anLine)
  }
  debugT(f.prev === fPrev && f.anLine === false && f.stat === false)

  var v
  var vPrev = vStart
  for (vPrev = vStart; (v = vPrev.there) !== vStart; vPrev = v) {
    debugT(v.prev === vPrev)
    e = v.anLine
    do {
      debugT(e.sym !== e)
      debugT(e.sym.sym === e)
      debugT(e.lThere.oThere.sym === e)
      debugT(e.oThere.sym.lThere === e)
      debugT(e.org === v)
      e = e.oThere
    } while(e !== v.anLine)
  }
  debugT(v.prev === vPrev && v.anLine === false && v.stat === false)

  var ePrev = eStart
  for (ePrev = eStart; (e = ePrev.there) !== eStart; ePrev = e) {
    debugT(e.sym.there === ePrev.sym)
    debugT(e.sym !== e)
    debugT(e.sym.sym === e)
    debugT(e.org !== false)
    debugT(e.dst() !== false)
    debugT(e.lThere.oThere.sym === e)
    debugT(e.oThere.sym.lThere === e)
  }
  debugT(e.sym.there === ePrev.sym &&
         e.sym === this.eStartSym &&
         e.sym.sym === e &&
         e.org === false && e.dst() === false &&
         e.lFace === false && e.rFace() === false)
}

T.SENTINEL_XY_ = 4 * T.MAX_XY
T.EPSILON_NONZERO_ = false

T.computeInner = function(mala) {
  mala.fatalFailure = false
  T.removeDeadLines_(mala)
  T.initPriorityQ_(mala)
  T.initLineDict_(mala)
  var v
  while ((v = mala.pq.findMin()) !== false) {
    for ( ;; ) {
      var vThere = (mala.pq.minimum())
      if (vThere === false || !T.pointEq(vThere, v)) break

      vThere = (mala.pq.findMin())
      T.splitMergePoints_(mala, v.anLine, vThere.anLine)
    }
    T.sweepEvent_(mala, v)
  }
  var swapReg = (mala.dict.start.there.key)
  mala.event = swapReg.eUp.org
  T.sweepDebugEvent(mala)
  T.doneLineDict_(mala)
  T.done(mala)

  T.removeDeadFaces_(mala.surface)
  mala.surface.fixlayer()
}


T.addFollow_ = function(eDst, eSrc) {
  eDst.follow += eSrc.follow
  eDst.sym.follow += eSrc.sym.follow
}

T.lineLeq_ = function(mala, reg1, reg2) {
  var event = mala.event
  var e1 = reg1.eUp
  var e2 = reg2.eUp

  if (e1.dst() === event) {
    if (e2.dst() === event) {
      if (T.pointLeq(e1.org, e2.org)) return T.lineSign(e2.dst(), e1.org, e2.org) <= 0
      return T.lineSign(e1.dst(), e2.org, e1.org) >= 0
    }

    return T.lineSign(e2.dst(), event, e2.org) <= 0
  }

  if (e2.dst() === event) return T.lineSign(e1.dst(), event, e1.org) >= 0

  var t1 = T.lineEval(e1.dst(), event, e1.org)
  var t2 = T.lineEval(e2.dst(), event, e2.org)
  return (t1 >= t2)
}

T.killSpace_ = function(mala, reg) {
  if (reg.fixUpperLine) debugT(reg.eUp.follow === 0)

  reg.eUp.region = false

  mala.dict.killN(reg.nUp)
  reg.nUp = false
}

T.fixUpperLine_ = function(reg, newLine) {
  debugT(reg.fixUpperLine)
  T.surface.killLine(reg.eUp)

  reg.fixUpperLine = false
  reg.eUp = newLine
  newLine.region = reg
}



T.topLeftSpace_ = function(reg) {
  var org = reg.eUp.org
  do {
    reg = reg.spaceAbove()
  } while (reg.eUp.org === org)

  if (reg.fixUpperLine) {
    var e = T.surface.connect(reg.spaceBelow().eUp.sym, reg.eUp.lThere)
    T.fixUpperLine_(reg, e)
    reg = reg.spaceAbove()
  }

  return reg
}

T.topRightSpace_ = function(reg) {
  var dst = reg.eUp.dst()

  do {
    reg = reg.spaceAbove()
  } while (reg.eUp.dst() === dst)

  return reg
}

T.addSpaceBelow_ = function(mala, regAbove, eNewUp) {
  var regNew = new T.Region()

  regNew.eUp = eNewUp
  regNew.nUp = mala.dict.addBefore(regAbove.nUp, regNew)
  eNewUp.region = regNew

  return regNew
}

T.isFollowInside_ = function(mala, n) {
  switch(mala.command) {
    case T.command.COMM_ODD: return ((n & 1) !== 0)
    case T.command.COMM_NONZERO: return (n !== 0)
    case T.command.COMM_POSITIVE: return (n > 0)
    case T.command.COMM_NEGATIVE: return (n < 0)
    case T.command.COMM_ABS_GEQ_TWO: return (n >= 2) || (n <= -2)
  }

  debugT(false)
  return false
}

T.computeFollow_ = function(mala, reg) {
  reg.followId = reg.spaceAbove().followId + reg.eUp.follow
  reg.inside = T.isFollowInside_(mala, reg.followId)
}

T.finishSpace_ = function(mala, reg) {
  var e = reg.eUp
  var f = e.lFace

  f.inside = reg.inside
  f.anLine = e
  T.killSpace_(mala, reg)
}

T.finishLeftSpaces_ = function(mala, regFirst, regLast) {
  var regPrev = regFirst
  var ePrev = regFirst.eUp
  while (regPrev !== regLast) {
    regPrev.fixUpperLine = false
    var reg = regPrev.spaceBelow()
    var e = reg.eUp
    if (e && e.org !== ePrev.org) {
      if (!reg.fixUpperLine) {
        T.finishSpace_(mala, regPrev)
        break
      }

      e = T.surface.connect(ePrev.lPrev(), e.sym)
      T.fixUpperLine_(reg, e)
    }

    if (ePrev.oThere !== e) {
      T.surface.surfaceSplit(e.oPrev(), e)
      T.surface.surfaceSplit(ePrev, e)
    }

    T.finishSpace_(mala, regPrev)
    ePrev = reg.eUp
    regPrev = reg
  }

  return ePrev
}

T.addRightLines_ = function(mala, regUp, eFirst, eLast, eTopLeft, cleanUp) {
  var firstTime = true
  var e = eFirst
  do {
    debugT(T.pointLeq(e.org, e.dst()))
    T.addSpaceBelow_(mala, regUp, e.sym)
    e = e.oThere
  } while (e !== eLast)
  if (eTopLeft === false) eTopLeft = regUp.spaceBelow().eUp.rPrev()
  var regPrev = regUp
  var ePrev = eTopLeft
  var reg
  for( ;; ) {
    reg = regPrev.spaceBelow()
    e = reg.eUp.sym
    if (e.org !== ePrev.org) break

    if (e.oThere !== ePrev) {
      T.surface.surfaceSplit(e.oPrev(), e)
      T.surface.surfaceSplit(ePrev.oPrev(), e)
    }
    reg.followId = regPrev.followId - e.follow
    reg.inside = T.isFollowInside_(mala, reg.followId)
    regPrev.dirty = true
    if (!firstTime && T.fixForRightSplit_(mala, regPrev)) {
      T.addFollow_(e, ePrev)
      T.killSpace_(mala, regPrev)
      T.surface.killLine(ePrev)
    }
    firstTime = false
    regPrev = reg
    ePrev = e
  }

  regPrev.dirty = true
  debugT(regPrev.followId - e.follow === reg.followId)

  if (cleanUp) T.walkDirtySpaces_(mala, regPrev)
}

T.Combine_ = function(mala, isect, stat, depths, needed) {
  var xys = [
    isect.xys[0],
    isect.xys[1],
    isect.xys[2]
  ]

  isect.stat = false
  isect.stat = mala.CombineOrCombineStat(xys, stat, depths)
  if (isect.stat === false) {
    if (!needed) {
      isect.stat = stat[0]
    } else if (!mala.fatalFailure) {
      mala.FailureOrFailureStat(T.failureType.NEED_COMBINE_BACK)
      mala.fatalFailure = true
    }
  }
}


T.splitMergePoints_ = function(mala, e1, e2) {
  var stat = [false, false, false, false]
  var depths = [0.5, 0.5, 0, 0]

  stat[0] = e1.org.stat
  stat[1] = e2.org.stat
  T.Combine_(mala, e1.org, stat, depths, false)
  T.surface.surfaceSplit(e1, e2)
}

T.pointDepths_ = function(isect, org, dst, depths, depthIndex) {
  var t1 = T.pointL1dist(org, isect)
  var t2 = T.pointL1dist(dst, isect)
  var i0 = depthIndex
  var i1 = depthIndex + 1
  depths[i0] = 0.5 * t2 / (t1 + t2)
  depths[i1] = 0.5 * t1 / (t1 + t2)
  isect.xys[0] += depths[i0]*org.xys[0] + depths[i1]*dst.xys[0]
  isect.xys[1] += depths[i0]*org.xys[1] + depths[i1]*dst.xys[1]
  isect.xys[2] += depths[i0]*org.xys[2] + depths[i1]*dst.xys[2]
}

T.WriteStat_ = function(mala, isect, orgUp, dstUp, orgLo, dstLo) {
  var depths = [0, 0, 0, 0]
  var stat = [
    orgUp.stat,
    dstUp.stat,
    orgLo.stat,
    dstLo.stat
  ]
  isect.xys[0] = isect.xys[1] = isect.xys[2] = 0
  T.pointDepths_(isect, orgUp, dstUp, depths, 0)
  T.pointDepths_(isect, orgLo, dstLo, depths, 2)
  T.Combine_(mala, isect, stat, depths, true)
}

T.fixForRightSplit_ = function(mala, regUp) {
  var regLo = regUp.spaceBelow()
  var eUp = regUp.eUp
  var eLo = regLo.eUp

  if (T.pointLeq(eUp.org, eLo.org)) {
    if (T.lineSign(eLo.dst(), eUp.org, eLo.org) > 0) return false

    if (!T.pointEq(eUp.org, eLo.org)) {
      T.surface.splitLine(eLo.sym)
      T.surface.surfaceSplit(eUp, eLo.oPrev())
      regUp.dirty = regLo.dirty = true

    } else if (eUp.org !== eLo.org) {
      mala.pq.remove((eUp.org.pqHandle))
      T.splitMergePoints_(mala, eLo.oPrev(), eUp)
    }

  } else {
    if (T.lineSign(eUp.dst(), eLo.org, eUp.org) < 0) return false

    regUp.spaceAbove().dirty = regUp.dirty = true
    T.surface.splitLine(eUp.sym)
    T.surface.surfaceSplit(eLo.oPrev(), eUp)
  }

  return true
}

T.fixForLeftSplit_ = function(mala, regUp) {
  var regLo = regUp.spaceBelow()
  var eUp = regUp.eUp
  var eLo = regLo.eUp
  var e

  debugT(!T.pointEq(eUp.dst(), eLo.dst()))

  if (T.pointLeq(eUp.dst(), eLo.dst())) {
    if (T.lineSign(eUp.dst(), eLo.dst(), eUp.org) < 0) return false

    regUp.spaceAbove().dirty = regUp.dirty = true
    e = T.surface.splitLine(eUp)
    T.surface.surfaceSplit(eLo.sym, e)
    e.lFace.inside = regUp.inside
  } else {
    if (T.lineSign(eLo.dst(), eUp.dst(), eLo.org) > 0) return false

    regUp.dirty = regLo.dirty = true
    e = T.surface.splitLine(eLo)
    T.surface.surfaceSplit(eUp.lThere, eLo.sym)
    e.rFace().inside = regUp.inside
  }

  return true
}

T.fixForWrite_ = function(mala, regUp) {
  var regLo = regUp.spaceBelow()
  var eUp = regUp.eUp
  var eLo = regLo.eUp
  var orgUp = eUp.org
  var orgLo = eLo.org
  var dstUp = eUp.dst()
  var dstLo = eLo.dst()

  var isect = new T.point()

  debugT(!T.pointEq(dstLo, dstUp))
  debugT(T.lineSign(dstUp, mala.event, orgUp) <= 0)
  debugT(T.lineSign(dstLo, mala.event, orgLo) >= 0 )
  debugT(orgUp !== mala.event && orgLo !== mala.event)
  debugT(!regUp.fixUpperLine && !regLo.fixUpperLine)

  if (orgUp === orgLo) return false

  var tMinUp = Math.min(orgUp.t, dstUp.t)
  var tMaxLo = Math.max(orgLo.t, dstLo.t)
  if (tMinUp > tMaxLo) return false

  if (T.pointLeq(orgUp, orgLo)) {
    if (T.lineSign(dstLo, orgUp, orgLo) > 0) return false
  } else {
    if (T.lineSign(dstUp, orgLo, orgUp) < 0) return false
  }

  T.sweepDebugEvent(mala)

  T.lineWrite(dstUp, orgUp, dstLo, orgLo, isect)


  debugT(Math.min(orgUp.t, dstUp.t) <= isect.t)
  debugT(isect.t <= Math.max(orgLo.t, dstLo.t))
  debugT(Math.min(dstLo.s, dstUp.s) <= isect.s)
  debugT(isect.s <= Math.max(orgLo.s, orgUp.s))

  if (T.pointLeq(isect, mala.event)) {
    isect.s = mala.event.s
    isect.t = mala.event.t
  }


  var orgMin = T.pointLeq(orgUp, orgLo) ? orgUp : orgLo
  if (T.pointLeq(orgMin, isect)) {
    isect.s = orgMin.s
    isect.t = orgMin.t
  }

  if (T.pointEq(isect, orgUp) || T.pointEq(isect, orgLo)) {
    T.fixForRightSplit_(mala, regUp)
    return false
  }

  if ((!T.pointEq(dstUp, mala.event) && T.lineSign(dstUp, mala.event, isect) >= 0) ||
      (!T.pointEq(dstLo, mala.event) && T.lineSign(dstLo, mala.event, isect) <= 0)) {
    if (dstLo === mala.event) {
      T.surface.splitLine(eUp.sym)
      T.surface.surfaceSplit(eLo.sym, eUp)
      regUp = T.topLeftSpace_(regUp)
      eUp = regUp.spaceBelow().eUp
      T.finishLeftSpaces_(mala, regUp.spaceBelow(), regLo)
      T.addRightLines_(mala, regUp, eUp.oPrev(), eUp, eUp, true)
      return true
    }

    if (dstUp === mala.event) {
      T.surface.splitLine(eLo.sym)
      T.surface.surfaceSplit(eUp.lThere, eLo.oPrev())
      regLo = regUp
      regUp = T.topRightSpace_(regUp)
      var e = regUp.spaceBelow().eUp.rPrev()
      regLo.eUp = eLo.oPrev()
      eLo = T.finishLeftSpaces_(mala, regLo, false)
      T.addRightLines_(mala, regUp, eLo.oThere, eUp.rPrev(), e, true)
      return true
    }

    if (T.lineSign(dstUp, mala.event, isect) >= 0) {
      regUp.spaceAbove().dirty = regUp.dirty = true
      T.surface.splitLine(eUp.sym)
      eUp.org.s = mala.event.s
      eUp.org.t = mala.event.t
    }

    if (T.lineSign(dstLo, mala.event, isect) <= 0) {
      regUp.dirty = regLo.dirty = true
      T.surface.splitLine(eLo.sym)
      eLo.org.s = mala.event.s
      eLo.org.t = mala.event.t
    }
    return false
  }

  T.surface.splitLine(eUp.sym)
  T.surface.splitLine(eLo.sym)
  T.surface.surfaceSplit(eLo.oPrev(), eUp)
  eUp.org.s = isect.s
  eUp.org.t = isect.t
  eUp.org.pqHandle = mala.pq.add(eUp.org)
  T.WriteStat_(mala, eUp.org, orgUp, dstUp, orgLo, dstLo)
  regUp.spaceAbove().dirty = regUp.dirty = regLo.dirty = true

  return false
}

T.walkDirtySpaces_ = function(mala, regUp) {
  var regLo = regUp.spaceBelow()

  for ( ;; ) {
    while (regLo.dirty) {
      regUp = regLo
      regLo = regLo.spaceBelow()
    }
    if (!regUp.dirty) {
      regLo = regUp
      regUp = regUp.spaceAbove()
      if (regUp === false || !regUp.dirty) return
    }

    regUp.dirty = false
    var eUp = regUp.eUp
    var eLo = regLo.eUp

    if (eUp.dst() !== eLo.dst()) {
      if (T.fixForLeftSplit_(mala, regUp)) {
        if (regLo.fixUpperLine) {
          T.killSpace_(mala, regLo)
          T.surface.killLine(eLo)
          regLo = regUp.spaceBelow()
          eLo = regLo.eUp

        } else if (regUp.fixUpperLine) {
          T.killSpace_(mala, regUp)
          T.surface.killLine(eUp)
          regUp = regLo.spaceAbove()
          eUp = regUp.eUp
        }
      }
    }

    if (eUp.org !== eLo.org) {
      if (eUp.dst() !== eLo.dst() && !regUp.fixUpperLine && !regLo.fixUpperLine &&
          (eUp.dst() === mala.event || eLo.dst() === mala.event)) {
        if (T.fixForWrite_(mala, regUp)) return
      } else T.fixForRightSplit_(mala, regUp)
    }

    if (eUp.org === eLo.org && eUp.dst() === eLo.dst()) {
      T.addFollow_(eLo, eUp)
      T.killSpace_(mala, regUp)
      T.surface.killLine(eUp)
      regUp = regLo.spaceAbove()
    }
  }
}

T.connectightpoint_ = function(mala, regUp, eBottomLeft) {
  var eTopLeft = eBottomLeft.oThere
    , regLo = regUp.spaceBelow()
    , eUp = regUp.eUp
    , eLo = regLo.eUp
    , dead = false

  if (eUp.dst() !== eLo.dst()) T.fixForWrite_(mala, regUp)

  if (T.pointEq(eUp.org, mala.event)) {
    T.surface.surfaceSplit(eTopLeft.oPrev(), eUp)
    regUp = T.topLeftSpace_(regUp)
    eTopLeft = regUp.spaceBelow().eUp
    T.finishLeftSpaces_(mala, regUp.spaceBelow(), regLo)
    dead = true
  }

  if (T.pointEq(eLo.org, mala.event)) {
    T.surface.surfaceSplit(eBottomLeft, eLo.oPrev())
    eBottomLeft = T.finishLeftSpaces_(mala, regLo, false)
    dead = true
  }

  if (dead) {
    T.addRightLines_(mala, regUp, eBottomLeft.oThere, eTopLeft, eTopLeft, true)
    return
  }

  var eNew = (T.pointLeq(eLo.org, eUp.org))? eLo.oPrev() : eUp

  eNew = T.surface.connect(eBottomLeft.lPrev(), eNew)

  T.addRightLines_(mala, regUp, eNew, eNew.oThere, eNew.oThere, false)
  eNew.sym.region.fixUpperLine = true
  T.walkDirtySpaces_(mala, regUp)
}

T.connectLeftDead_ = function(mala, regUp, vEvent) {
  var e = regUp.eUp
  if (T.pointEq(e.org, vEvent)) {
    debugT(T.EPSILON_NONZERO_)
    return T.splitMergePoints_(mala, e, vEvent.anLine)
  }

  if (!T.pointEq(e.dst(), vEvent)) {
    T.surface.splitLine(e.sym)
    if (regUp.fixUpperLine) {
      T.surface.killLine(e.oThere)
      regUp.fixUpperLine = false
    }

    T.surface.surfaceSplit(vEvent.anLine, e)
    return T.sweepEvent_(mala, vEvent)
  }

  debugT(T.EPSILON_NONZERO_)
  regUp = T.topRightSpace_(regUp)
  var reg = regUp.spaceBelow()
    , eTopRight = reg.eUp.sym
    , eTopLeft = eTopRight.oThere
    , eLast = eTopLeft

  if (reg.fixUpperLine) {
    debugT(eTopLeft !== eTopRight)
    T.killSpace_(mala, reg)
    T.surface.killLine(eTopRight)
    eTopRight = eTopLeft.oPrev()
  }

  T.surface.surfaceSplit(vEvent.anLine, eTopRight)
  if (!T.lineGoesLeft(eTopLeft)) eTopLeft = false

  T.addRightLines_(mala, regUp, eTopRight.oThere, eLast, eTopLeft, true)
}

T.connectLeftpoint_ = function(mala, vEvent) {
  var swap = new T.Region()
  swap.eUp = vEvent.anLine.sym
  var regUp = (mala.dict.search(swap).key)
    , regLo = regUp.spaceBelow()
    , eUp = regUp.eUp
    , eLo = regLo.eUp
    , eNew

  if (T.lineSign(eUp.dst(), vEvent, eUp.org) === 0)
    return T.connectLeftDead_(mala, regUp, vEvent)

  var reg = T.pointLeq(eLo.dst(), eUp.dst()) ? regUp : regLo

  if (regUp.inside || reg.fixUpperLine) {
    if (reg === regUp) eNew = T.surface.connect(vEvent.anLine.sym, eUp.lThere)
    else {
      var tempHalfLine = T.surface.connect(eLo.dThere(), vEvent.anLine)
      eNew = tempHalfLine.sym
    }

    reg.fixUpperLine ?
      T.fixUpperLine_(reg, eNew) :
      T.computeFollow_(mala, T.addSpaceBelow_(mala, regUp, eNew))

    T.sweepEvent_(mala, vEvent)
  } else
    T.addRightLines_(mala, regUp, vEvent.anLine, vEvent.anLine, false, true)

}

T.sweepEvent_ = function(mala, vEvent) {
  mala.event = vEvent
  T.sweepDebugEvent( mala )

  var e = vEvent.anLine

  while (e.region === false) {
    e = e.oThere
    if (e === vEvent.anLine) return T.connectLeftpoint_(mala, vEvent)
  }

  var regUp = T.topLeftSpace_(e.region)
    , reg = regUp.spaceBelow()
    , eTopLeft = reg.eUp
    , eBottomLeft = T.finishLeftSpaces_(mala, reg, false)

  eBottomLeft.oThere === eTopLeft ?
    T.connectightpoint_(mala, regUp, eBottomLeft) :
    T.addRightLines_(mala, regUp, eBottomLeft.oThere, eTopLeft, eTopLeft, true)
}

T.addSentinel_ = function(mala, t) {
  var reg = new T.Region()
  var e = T.surface.makeLine(mala.surface)
  e.org.s = T.SENTINEL_XY_
  e.org.t = t
  e.dst().s = -T.SENTINEL_XY_
  e.dst().t = t
  mala.event = e.dst()

  reg.eUp = e
  reg.followId = 0
  reg.inside = false
  reg.fixUpperLine = false
  reg.sentinel = true
  reg.dirty = false
  reg.nUp = mala.dict.add(reg)
}

T.initLineDict_ = function(mala) {
  mala.dict = new T.Dict(mala, (T.lineLeq_))
  T.addSentinel_(mala, -T.SENTINEL_XY_)
  T.addSentinel_(mala, T.SENTINEL_XY_)
}

T.doneLineDict_ = function(mala) {
  var fixedLines = 0
    , reg
  while ((reg = (mala.dict.start.there.key)) !== false) {
    if (!reg.sentinel) {
      debugT(reg.fixUpperLine)
      debugT(++fixedLines === 1)
    }
    debugT(reg.followId === 0)
    T.killSpace_(mala, reg)
  }

  mala.dict = false
}

T.removeDeadLines_ = function(mala) {
  var eStart = mala.surface.eStart

  var eThere
  for (var e = eStart.there; e !== eStart; e = eThere) {
    eThere = e.there
    var eLThere = e.lThere

    if (T.pointEq(e.org, e.dst()) && e.lThere.lThere !== e) {
      T.splitMergePoints_(mala, eLThere, e)
      T.surface.killLine(e)
      e = eLThere
      eLThere = e.lThere
    }

    if (eLThere.lThere === e) {
      if (eLThere !== e) {
        if (eLThere === eThere || eLThere === eThere.sym) eThere = eThere.there
        T.surface.killLine(eLThere)
      }

      if (e === eThere || e === eThere.sym ) eThere = eThere.there
      T.surface.killLine(e)
    }
  }
}

T.initPriorityQ_ = function(mala) {
  var pq = new PriorityQ((T.pointLeq))
  mala.pq = pq
  var vStart = mala.surface.vStart

  for (var v = vStart.there; v !== vStart; v = v.there) v.pqHandle = pq.add(v)
  pq.init()
}

T.done = function(mala) {
  mala.pq = false
}

T.removeDeadFaces_ = function(surface) {
  var fThere
  for (var f = surface.fStart.there; f !== surface.fStart; f = fThere) {
    fThere = f.there
    var e = f.anLine
    debugT(e.lThere !== e)
    if (e.lThere.lThere === e) {
      T.addFollow_(e.oThere, e)
      T.surface.killLine(e)
    }
  }
}

T.Region = function() {
    this.eUp = false
    this.nUp = false
    this.followId = 0
    this.inside = false
    this.sentinel = false
    this.dirty = false
    this.fixUpperLine = false
}

T.Region.prototype.spaceBelow = function() {
  return (this.nUp.prev.key)
}

T.Region.prototype.spaceAbove = function() {
  return (this.nUp.there.key)
}

T.drawlayer = function(mala, surface) {
  mala.lonelyTList = false
  var f
  for(f = surface.fStart.there; f !== surface.fStart; f = f.there) {
    f.marked = false
  }
  for(f = surface.fStart.there; f !== surface.fStart; f = f.there) {
    if (f.inside && ! f.marked) {
      T.drawMaximumFaceGroup_(mala, f)
      debugT(f.marked)
    }
  }
  if (mala.lonelyTList !== false) {
    T.drawLonelyTangles_(mala, mala.lonelyTList)
    mala.lonelyTList = false
  }
}

T.drawLine = function(mala, surface) {
  for (var f = surface.fStart.there; f !== surface.fStart; f = f.there) {
    if (f.inside) {
      mala.StartOrStartStat(primitive.LINE_LOOP)
      var e = f.anLine
      do {
        mala.pointOrpointStat(e.org.stat)
        e = e.lThere
      } while (e !== f.anLine)

      mala.EndOrEndStat()
    }
  }
}

T.drawStore = function(mala) {
  if (mala.storeCount < 3) return true
  var n = [0, 0, 0]
  n[0] = mala.perp[0]
  n[1] = mala.perp[1]
  n[2] = mala.perp[2]

  if (n[0] === 0 && n[1] === 0 && n[2] === 0)
    T.computePerp_(mala, n, false)

  var sign = T.computePerp_(mala, n, true)
  if (sign === T.SIGN_INCONSISTENT_) return false
  if (sign === 0) return true

  switch(mala.command) {
    case T.command.COMM_ODD:
    case T.command.COMM_NONZERO:
      break
    case T.command.COMM_POSITIVE:
      if (sign < 0) return true
      else break
    case T.command.COMM_NEGATIVE:
      if (sign > 0) return true
      else break
    case T.command.COMM_ABS_GEQ_TWO:
      return true
  }

  mala.StartOrStartStat(mala.lineOnly ?
      primitive.LINE_LOOP : (mala.storeCount > 3) ?
      primitive.MALAANGLE_FAN : primitive.TRIANGLES)

  var v0 = 0
  var vn = v0 + mala.storeCount
  var vc

  mala.pointOrpointStat(mala.store[v0].stat)
  if (sign > 0) {
    for (vc = v0+1; vc < vn; ++vc)
      mala.pointOrpointStat(mala.store[vc].stat)
  } else {
    for(vc = vn-1; vc > v0; --vc)
      mala.pointOrpointStat(mala.store[vc].stat)
  }
  mala.EndOrEndStat()
  return true
}

T.marked_ = function(f) {
  return (!f.inside || f.marked)
}

T.fTrail_ = function(t) {
  while (t !== false)
    t.marked = false, t = t.trail
}

T.maximumFan_ = function(eOrig) {
  var newFace = new T.Count(0, false, T.drawFan_)
    , trail = false
    , e

  for(e = eOrig; !T.marked_(e.lFace); e = e.oThere) {
    e.lFace.trail = trail
    trail = e.lFace
    e.lFace.marked = true
    ++newFace.size
  }

  for(e = eOrig; !T.marked_(e.rFace()); e = e.oPrev()) {
    e.rFace().trail = trail
    trail = e.rFace()
    e.rFace().marked = true
    ++newFace.size
  }

  newFace.eStart = e
  T.fTrail_(trail)
  return newFace
}

T.maximumSTp_ = function(eOrig) {
  var newFace = new T.Count(0, false, T.drawSTp_)
  var startSize = 0, tailSize = startSize
  var trail = false
  var e
  var eTail
  var eStart

  for (e = eOrig; !T.marked_(e.lFace); ++tailSize, e = e.oThere) {
    e.lFace.trail = trail
    trail = e.lFace
    e.lFace.marked = true

    ++tailSize
    e = e.dPrev()
    if (T.marked_(e.lFace)) {
      break
    }
    e.lFace.trail = trail
    trail = e.lFace
    e.lFace.marked = true
  }
  eTail = e

  for (e = eOrig; !T.marked_(e.rFace()); ++startSize, e = e.dThere()) {
    e.rFace().trail = trail
    trail = e.rFace()
    e.rFace().marked = true

    ++startSize
    e = e.oPrev()
    if (T.marked_(e.rFace())) {
      break
    }
    e.rFace().trail = trail
    trail = e.rFace()
    e.rFace().marked = true
  }
  eStart = e

  newFace.size = tailSize + startSize
  if ((tailSize & 1) === 0) {
    newFace.eStart = eTail.sym
  } else if ((startSize & 1) === 0) {
    newFace.eStart = eStart
  } else {
    --newFace.size
    newFace.eStart = eStart.oThere
  }

  T.fTrail_(trail)
  return newFace
}

T.drawFan_ = function(mala, e, size) {
  mala.StartOrStartStat(primitive.MALAANGLE_FAN)
  mala.pointOrpointStat(e.org.stat)
  mala.pointOrpointStat(e.dst().stat)

  while (!T.marked_(e.lFace)) {
    e.lFace.marked = true
    --size
    e = e.oThere
    mala.pointOrpointStat(e.dst().stat)
  }

  debugT(size === 0)
  mala.EndOrEndStat()
}

T.drawSTp_ = function(mala, e, size) {
  mala.StartOrStartStat(primitive.MALAANGLE_SMALAP)
  mala.pointOrpointStat(e.org.stat)
  mala.pointOrpointStat(e.dst().stat)

  while (!T.marked_(e.lFace)) {
    e.lFace.marked = true
    --size
    e = e.dPrev()
    mala.pointOrpointStat(e.org.stat)
    if (T.marked_(e.lFace)) break

    e.lFace.marked = true
    --size
    e = e.oThere
    mala.pointOrpointStat(e.dst().stat)
  }

  debugT(size === 0)
  mala.EndOrEndStat()
}

T.drawTangle_ = function(mala, e, size) {
  debugT(size === 1)

  e.lFace.trail = mala.lonelyTList
  mala.lonelyTList = e.lFace
  e.lFace.marked = true
}


T.Eval = function(u, v, w) {
  debugT(T.Leq(u, v) && T.Leq(v, w))
  var gapL = v.t - u.t
    , gapR = w.t - v.t

  if (gapL + gapR > 0) return (gapL < gapR) ?
    (v.s - u.s) + (u.s - w.s) * (gapL / (gapL + gapR)) :
    (v.s - w.s) + (w.s - u.s) * (gapR / (gapL + gapR))

  return 0
}

T.drawMaximumFaceGroup_ = function(mala, fOrig) {
  var e = fOrig.anLine
    , max = new T.Count(1, e, T.drawTangle_)
    , newFace

  if (!mala.flagLine) {
    newFace = T.maximumFan_(e)
    if (newFace.size > max.size) max = newFace

    newFace = T.maximumFan_(e.lThere)
    if (newFace.size > max.size) max = newFace

    newFace = T.maximumFan_(e.lPrev())
    if (newFace.size > max.size) max = newFace

    newFace = T.maximumSTp_(e)
    if (newFace.size > max.size) max = newFace

    newFace = T.maximumSTp_(e.lThere)
    if (newFace.size > max.size) max = newFace

    newFace = T.maximumSTp_(e.lPrev())
    if (newFace.size > max.size) max = newFace
  }

  max.draw(mala, max.eStart, max.size)
}

T.drawLonelyTangles_ = function(mala, start) {
  var lineState = -1
  var f = start
  mala.StartOrStartStat(primitive.TRIANGLES)
  for(; f !== false; f = f.trail) {
    var e = f.anLine
    do {
      if (mala.flagLine) {
        var newState = !e.rFace().inside ? 1 : 0
        if (lineState !== newState) {
          lineState = newState
          mala.LineFlagOrLineFlagStat(!!lineState)
        }
      }
      mala.pointOrpointStat(e.org.stat)

      e = e.lThere
    } while (e !== f.anLine)
  }

  mala.EndOrEndStat()
}

T.computePerp_ = function(mala, n, fix) {
  if (!fix)
    n[0] = n[1] = n[2] = 0
  var v0 = 0
  var vn = v0 + mala.storeCount
  var vc = v0 + 1
  var point0 = mala.store[v0]
  var pointc = mala.store[vc]

  var xc = pointc.xys[0] - point0.xys[0]
  var yc = pointc.xys[1] - point0.xys[1]
  var zc = pointc.xys[2] - point0.xys[2]

  var sign = 0
  while (++vc < vn) {
    pointc = mala.store[vc]
    var xp = xc
    var yp = yc
    var zp = zc
    xc = pointc.xys[0] - point0.xys[0]
    yc = pointc.xys[1] - point0.xys[1]
    zc = pointc.xys[2] - point0.xys[2]

    var n = [0, 0, 0]
    n[0] = yp*zc - zp*yc
    n[1] = zp*xc - xp*zc
    n[2] = xp*yc - yp*xc

    var dot = n[0]*n[0] + n[1]*n[1] + n[2]*n[2]
    if (!fix) {
      if (dot >= 0) {
        n[0] += n[0]
        n[1] += n[1]
        n[2] += n[2]
      } else {
        n[0] -= n[0]
        n[1] -= n[1]
        n[2] -= n[2]
      }
    } else if (dot !== 0) {
      if (dot > 0) {
        if (sign < 0)
          return T.SIGN_INCONSISTENT_
        sign = 1
      } else {
        if (sign > 0)
          return T.SIGN_INCONSISTENT_
        sign = -1
      }
    }
  }

  return sign
}

T.Count = function(size, eStart, drawFunction) {
  this.size = size
  this.eStart = eStart
  this.draw = drawFunction
}

T.pointEq = function(u, v) {
  return u.s === v.s && u.t === v.t
}

T.pointLeq = function(u, v) {
  return (u.s < v.s) || (u.s === v.s && u.t <= v.t)
}

T.lineEval = function(u, v, w) {
  debugT(T.pointLeq(u, v) && T.pointLeq(v, w))

  var gapL = v.s - u.s
    , gapR = w.s - v.s

  if (gapL + gapR > 0) return (gapL < gapR) ?
    (v.t - u.t) + (u.t - w.t) * (gapL / (gapL + gapR)) :
    (v.t - w.t) + (w.t - u.t) * (gapR / (gapL + gapR))

  return 0
}

T.lineSign = function(u, v, w) {
  debugT(T.pointLeq(u, v) && T.pointLeq(v, w))
  var gapL = v.s - u.s
    , gapR = w.s - v.s
  if (gapL + gapR > 0) return (v.t - w.t) * gapL + (v.t - u.t) * gapR

  return 0
}

T.Leq = function(u, v) {
  return (u.t < v.t) || (u.t === v.t && u.s <= v.s)
}

T.Sign = function(u, v, w) {
  debugT(T.Leq(u, v) && T.Leq(v, w))

  var gapL = v.t - u.t
    , gapR = w.t - v.t

  return (gapL + gapR > 0) ? (v.s - w.s) * gapL + (v.s - u.s) * gapR : 0
}

T.lineGoesLeft = function(e) {
  return T.pointLeq(e.dst(), e.org)
}

T.lineGoesRight = function(e) {
  return T.pointLeq(e.org, e.dst())
}

T.pointL1dist = function(u, v) {
  return Math.abs(u.s - v.s) + Math.abs(u.t - v.t)
}

T.pointCCW = function(u, v, w) {
  return (u.s*(v.t - w.t) + v.s*(w.t - u.t) + w.s*(u.t - v.t)) >= 0
}

T.merge_ = function(a, x, b, y) {
  a = (a < 0) ? 0 : a
  b = (b < 0) ? 0 : b

  return a <= b ?
    b === 0 ? (x+y) / 2 :
    x + (y-x) * (a/(a+b)) :
    y + (x-y) * (b/(a+b))
}

T.lineWrite = function(o1, d1, o2, d2, v) {
  var z1, z2
  var swap

  if (!T.pointLeq(o1, d1)) {
    swap = o1
    o1 = d1
    d1 = swap
  }

  if (!T.pointLeq(o2, d2)) {
    swap = o2
    o2 = d2
    d2 = swap
  }

  if (!T.pointLeq(o1, o2)) {
    swap = o1
    o1 = o2
    o2 = swap
    swap = d1
    d1 = d2
    d2 = swap
  }

  if (!T.pointLeq(o2, d1)) v.s = (o2.s + d1.s) / 2
  else if (T.pointLeq(d1, d2)) {
    z1 = T.lineEval(o1, o2, d1)
    z2 = T.lineEval(o2, d1, d2)
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2 }
    v.s = T.merge_(z1, o2.s, z2, d1.s)
  } else {
    z1 = T.lineSign(o1, o2, d1)
    z2 = -T.lineSign(o1, d2, d1)
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2 }
    v.s = T.merge_(z1, o2.s, z2, d2.s)
  }

  if (!T.Leq(o1, d1)) {
    swap = o1
    o1 = d1
    d1 = swap
  }
  if (!T.Leq(o2, d2)) {
    swap = o2
    o2 = d2
    d2 = swap
  }
  if (!T.Leq(o1, o2)) {
    swap = o1
    o1 = o2
    o2 = swap
    swap = d1
    d1 = d2
    d2 = swap
  }

  if (!T.Leq(o2, d1)) v.t = (o2.t + d1.t) / 2
  else if (T.Leq(d1, d2)) {
    z1 = T.Eval(o1, o2, d1)
    z2 = T.Eval(o2, d1, d2)
    if (z1+z2 < 0)  z1 = -z1, z2 = -z2
    v.t = T.merge_(z1, o2.t, z2, d1.t)
  } else {
    z1 = T.Sign(o1, o2, d1)
    z2 = -T.Sign(o1, d2, d1)
    if (z1+z2 < 0) { z1 = -z1; z2 = -z2 }
    v.t = T.merge_(z1, o2.t, z2, d2.t)
  }
}

T.projectShape = function(mala) {
  var computedPerp = false
    , n = [0, 0, 0]
  n[0] = mala.perp[0]
  n[1] = mala.perp[1]
  n[2] = mala.perp[2]
  if (n[0] === 0 && n[1] === 0 && n[2] === 0) {
    T.computePerp_(mala, n)
    computedPerp = true
  }

  var s = mala.s
  var t = mala.t
  var i = T.longAxis_(n)

  if (T.TRUE_PROJECT) {
    T.perpize_(n)

    s[i] = 0
    s[(i+1)%3] = T.S__X_
    s[(i+2)%3] = T.S__Y_

    var w = T.dot_(s, n)
    s[0] -= w * n[0]
    s[1] -= w * n[1]
    s[2] -= w * n[2]
    T.perpize_(s)

    t[0] = n[1]*s[2] - n[2]*s[1]
    t[1] = n[2]*s[0] - n[0]*s[2]
    t[2] = n[0]*s[1] - n[1]*s[0]
    T.perpize_(t)

  } else {
    s[i] = 0
    s[(i+1)%3] = T.S__X_
    s[(i+2)%3] = T.S__Y_

    t[i] = 0
    t[(i+1)%3] = (n[i] > 0) ? -T.S__Y_ : T.S__Y_
    t[(i+2)%3] = (n[i] > 0) ? T.S__X_ : -T.S__X_
  }

  var vStart = mala.surface.vStart
  for (var v = vStart.there; v !== vStart; v = v.there)
    v.s = T.dot_(v.xys, s), v.t = T.dot_(v.xys, t)

  if (computedPerp)
    T.fixOrientation_(mala)
}

T.dot_ = function(u, v) {
  return u[0]*v[0] + u[1]*v[1] + u[2]*v[2]
}

T.perpize_ = function(v) {
  var len = v[0]*v[0] + v[1]*v[1] + v[2]*v[2]
  debugT(len > 0)
  len = Math.sqrt(len)
  v[0] /= len
  v[1] /= len
  v[2] /= len
}

T.longAxis_ = function(v) {
  var i = 0
  if (Math.abs(v[1]) > Math.abs(v[i])) i = 1
  if (Math.abs(v[2]) > Math.abs(v[i])) i = 2
  return i
}

T.computePerp_ = function(mala, n) {
  var maxVal = [0, 0, 0]
    , minVal = [0, 0, 0]
    , d1 = [0, 0, 0]
    , d2 = [0, 0, 0]
    , tN = [0, 0, 0]

  maxVal[0] = maxVal[1] = maxVal[2] = -2 * T.MAX_XY
  minVal[0] = minVal[1] = minVal[2] = 2 * T.MAX_XY

  var maxPoint = new Array(3)
  , minPoint = new Array(3)
  , vStart = mala.surface.vStart
  , i, v
  for (v = vStart.there; v !== vStart; v = v.there) {
    for (i = 0; i < 3; ++i) {
      var c = v.xys[i]
      if (c < minVal[i]) { minVal[i] = c; minPoint[i] = v }
      if (c > maxVal[i]) { maxVal[i] = c; maxPoint[i] = v }
    }
  }

  i = 0

  if (maxVal[1] - minVal[1] > maxVal[0] - minVal[0]) i = 1
  if (maxVal[2] - minVal[2] > maxVal[i] - minVal[i]) i = 2
  if (minVal[i] >= maxVal[i]) return n[0] = 0; n[1] = 0; n[2] = 1

  var maxLen2 = 0
  var v1 = minPoint[i]
  var v2 = maxPoint[i]
  d1[0] = v1.xys[0] - v2.xys[0]
  d1[1] = v1.xys[1] - v2.xys[1]
  d1[2] = v1.xys[2] - v2.xys[2]
  for (v = vStart.there; v !== vStart; v = v.there) {
    d2[0] = v.xys[0] - v2.xys[0]
    d2[1] = v.xys[1] - v2.xys[1]
    d2[2] = v.xys[2] - v2.xys[2]
    tN[0] = d1[1]*d2[2] - d1[2]*d2[1]
    tN[1] = d1[2]*d2[0] - d1[0]*d2[2]
    tN[2] = d1[0]*d2[1] - d1[1]*d2[0]
    var tLen2 = tN[0]*tN[0] + tN[1]*tN[1] + tN[2]*tN[2]
    if (tLen2 > maxLen2) {
      maxLen2 = tLen2
      n[0] = tN[0]
      n[1] = tN[1]
      n[2] = tN[2]
    }
  }

  if (maxLen2 <= 0) {
    n[0] = n[1] = n[2] = 0
    n[T.longAxis_(d1)] = 1
  }
}

T.patchInner = function(surface) {
  for (var f = surface.fStart.there, there = f.there; f !== surface.fStart; there = (f = there).there)
    if (f.inside) T.patchSpace_(f)
}

T.discardOuter = function(surface) {
  for (var f = surface.fStart.there, there = f.there; f !== surface.fStart; there = (f = there).there)
    if (!f.inside) T.surface.zapFace(f)
}

T.FollowId = function(surface, value, keepOnlyLine) {
  for (var eThere, e = surface.eStart.there; e !== surface.eStart; e = eThere, eThere = e.there)
    if (e.rFace().inside !== e.lFace.inside) e.follow = (e.lFace.inside) ? value : -value
    else keepOnlyLine ? T.surface.killLine(e) : e.follow = 0
}

var triangulator = new T()
      .on(T.opt.POINT_STAT, function (d, poly) { poly.push(d[0], d[1]) })
      .on(T.opt.COMBINE, function (d) { return d.slice(0, 2) })
      .on(T.opt.LINE_FLAG, noop)
;function parsePath(str) {
  var buffer  = []
    , pos = [0, 0]
    , origin = [0, 0]
    , contours = [buffer]

  str.slice()
  .replace(/([MLHVCSQTAZmlhvcsqtaz])/g, '###$1')
  .split(/###/)
  .slice(1)
  .forEach(function (segment, i, match) {
    var points = segment.slice(1).trim().split(/\s|,|###/), j = 0
    while(j < points.length) {
      var x = points[j++], y = points[j++]
      //todo handle relative coordinates
      switch (segment[0].toLowerCase()) {
        case 'm':
          buffer.push(origin[0], origin[1])
          origin = pos = [x, y]
          contours.push(buffer = [])
          buffer.push(pos[0], pos[1])
          break
        case'l':
          buffer.push(x, y)
          pos = [x, y]
          break
        case 'z':
          pos = origin
          buffer.push(pos[0], pos[1])
          break
        // case 'h':
        //   pos[0] = x
        //   buffer.push(pos[0], pos[1])
        //   break
        // case 'v':
        //   pos[1] = x
        //   buffer.push(pos[0], pos[1])
        //   break
        }
      }
    })
  this.indices = this.batch.spread(this.indices, triangulate(contours))
}

function applyCSSRules () {
  if (! d3) return console.warn('this method depends on d3')
  d3.selectAll('link[rel=styleSheet]').each(function () {
    d3.text
  })

  var k = d3.selectAll('style')[0].map(function () { return this.sheet })
          .reduce(function (acc, item) {
            var itemRules = {}
            each(item.cssRules, function (rules, i) {
              var l = rules.length, cssom = {}
              while(l--) {
                var name = rules[rules[l]]
                cssom[name] = rules[name]
              }
              itemRules[rules.selectorText] = cssom
            })
              return extend(acc, itemRules)
          }, {})

  each(k, function (styles, selector) {
    d3.select(selector).attr(styles)
  })
}

function matchesSelector(selector) {
  if (isNode(selector)) return this == selector
  if (isFinite(selector.length)) return !!~flatten(selector).indexOf(this)
  for (var selectors = selector.split(','), tokens, dividedTokens; selector = selectors.pop(); tokens = selector.split(tokenizr).slice(0))
    if (interpret.apply(this, q(tokens.pop())) && (!tokens.length || ancestorMatch(this, tokens, selector.match(dividers)))) return true
}
;//cpu intersection tests
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
;function Pool(max) {
    var reclaim = []
    this.length = this.max = max
    this.push = function (i) {
        reclaim.push(i)
        return ++ this.length 
    }
    this.pop = function () {
        if (reclaim.length) return reclaim.pop()
        return this.max - this.length--
    }
    this.splice = function (start, end) {
        var result = []
        while (result.length < end) result.push(this.pop())
        return result 
    }
}

function Mesh(gl, options, attr) {
  var attributes = {}
    , count = options.count || 0
    , attrList = options.attrList || ['xy','color',  'r', 'fugue']
    , primitive = gl[options.primitive.toUpperCase()]
    , indexPool = new Pool(1e6)

  init()
  var self = {
    init : init
  , free: free
  , tessOffset: 0
  , alloc: alloc
  , draw: draw
  , bind: bind
  , attributes: attributes
  , set: set
  , addAttr: addAttr
  , removeAttr: removeAttr
  , boundingBox: boundingBox
  , spread: spread
  , changed: true
  }

  return self

  function alloc() {
    if (options.primitive == 'triangles') return []
    return options.primitive == 'points' ? [indexPool.pop() * 2]
          : options.primitive == 'lines' ? [indexPool.pop() * 2, indexPool.pop() * 2]
         : []
  }

  function spread(indices, buffer) {
    var dx = buffer.length - indices.length
    if (dx > 0)
      indices = indices.concat(indexPool.splice(indexPool.length - dx, dx))
    else
      indexPool.push.apply(indexPool, indices.splice(indexPool.length + dx, - dx))
    var posBuffer = attributes.xy.array
    indices.forEach(function (i) {
      posBuffer[i] = buffer[i]
    })
    return indices
  }

  function init() {
    attrList.forEach(function (name, i) {
      var buffer = gl.createBuffer()
      var option = options[name]  || {}
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, 1.7e7, gl.STATIC_DRAW)
      attributes[name] = {
        array: new Float32Array(options[name] && options[name].array || 4e6)
      , buffer: buffer
      , size: option.size || 2
      , loc: i
      }
    })
  }

  function free (index) {
    var i, attr
    for(attr in attributes) {
      attr = attributes
      i = attr.size
      while(i--) attributes[index * attr.size + i] = 0
    }
  }

  function bind (obj) {
    obj.xyBuffer = attributes.xy.array
    obj.rBuffer = attributes.r.array

    obj.fBuffer = attributes.fugue.array
    obj.colorBuffer = attributes.color.array
    obj.batch = this
  }
    
  function draw (offset) {
    if (! count && 0 == indexPool.max - indexPool.length) return
      
    for (var attr in attributes) {
      attr = attributes[attr]
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer)
      gl.vertexAttribPointer(attr.loc, attr.size, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(attr.loc)

      if (self.changed)
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, attr.array)
    }
    
      self.changed = false

      pathgl.options.beforeDraw && pathgl.options.beforeDraw(options)
           
    gl.drawArrays(primitive, offset, (indexPool.max - indexPool.length)|| options.count || 0)
  }

  function set () {}
  function addAttr () {}
  function removeAttr () {}
  function boundingBox() {}
}

;function RenderTarget(screen) {
  var gl = screen.gl
    , targets = []
    , prog = screen.program || program
    , types = screen.types = SVGProxy()
    , batches = screen.batch ? [screen.batch] : buildBuffers(gl, screen.types)

  batches.forEach(function (d) { d.mergeProgram = mergeProgram })

  var self = {
    update: update
  , append: append
  , drawTo: drawTo
  , mergeProgram: mergeProgram
  , mats: []
  , read: function (m) {
      console.log(m)
      this.mats.push(m)
  } 
  }
   return screen.__renderTarget__ = self

  function drawTo(texture) {
    if (! texture) return targets.push(null)
    targets.push(initFbo(texture))
    this.mats.push(texture)
    screen.width = texture.width
    screen.height = texture.height
  }

  function append(el) {
    return (types[el.toLowerCase()] || console.log.bind(console, 'Error'))(el)
  }

  function mergeProgram(vs, fs, subst) {
    prog = prog.merge(vs, fs, subst)
  }

  function update () {
    if (program != prog) gl.useProgram(program = prog)
    for(var i = -1; ++i < targets.length;) {
      if (! targets[i]) gl.enable(gl.BLEND)
      else gl.disable(gl.BLEND)
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[i])
      setUniforms()
      self.mats.forEach(function (m, i) {
          m.bind(i)
      })
        //if (Math.random() > .999)console.log(self.mats)
      beforeRender(gl, screen)
      for(var j = -1; ++j < batches.length;) batches[j].draw()
    }
  }

  function setUniforms () {
    for (var k in uniforms)
      program[k] && program[k](uniforms[k])
  }

  function beforeRender(gl, screen) {
    //if (screen == gl.canvas) gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, screen.width, screen.height)
  }
}

function buildBuffers(gl, types) {
  var pointMesh = new Mesh(gl, { primitive: 'points' })
  pointMesh.bind(types.circle)


  var lineMesh = new Mesh(gl, { primitive: 'lines'})
  lineMesh.bind(types.line)

  var triangleMesh = new Mesh(gl, { primitive: 'triangles'})
  triangleMesh.bind(types.path)
  triangleMesh.bind(types.rect)

  return [pointMesh, triangleMesh, lineMesh]
}

function initFbo(texture) {
  var fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  fbo.width = texture.width
  fbo.height = texture.height
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.id, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return fbo
}
;//regexes sourced from sizzle
function querySelector(s) { return this.querySelectorAll(s)[0] }
function querySelectorAll(selector, r) {
  return selector.replace(/^\s+|\s*([,\s\+\~>]|$)\s*/g, '$1').split(',')
  .forEach(function (s) { query(s, this).forEach(push.bind(r = [])) }, this) || r
}

function query(selector, root) {
  var symbols = selector.split(/[\s\>\+\~](?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/)
    , dividedTokens = selector.match(/([\s\>\+\~])(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/)
    , last = chunk(symbols.pop()), right = [], left = [], item

  byTagName.call(root, last[1] || '*').forEach(function (d) { if (item = checkRight.apply(d, last)) right.push(item) })
  return symbols.length ? right.forEach(function (e) { if (leftCheck(e, symbols, dividedTokens)) left.push(e) }) || left : right
}

function leftCheck(doc, symbols, divided, cand) {
  return cand = function recur(e, i, p) {
    while (p = combinators[divided[i]](p, e))
      if (checkRight.apply(p, chunk(symbols[i]))) {
        if (i) if (cand = recur(p, i - 1, p)) return cand
        else return p
      }
  }(doc, symbols.length - 1, doc)
}

function checkRight(_, tag, classId, attribute, attr, attrCmp, attrVal, _, pseudo, _, pseudoVal, m) {
  return pseudo && pseudos[pseudo] && !pseudos[pseudo](this, pseudoVal)
      || tag && tag !== '*' && this.tag && this.tag.toLowerCase() !== tag
      || attribute && !checkAttr(attrCmp, (this.attr[attr] || '').toString(), attrVal)
      || classId && (m = classId.match(/#([\w\-]+)/)) && m[1] !== this.attr.id
      || classId && (classId.match(/\.[\w\-]+/g) || []).some(matchClass.bind(this)) ? 0 : this
}

function checkAttr(cmp, actual, val) {
  return actual.toString()
         .match(RegExp({ '='  : val
                       , '^=' : '^' + clean(val)
                       , '$=' : clean(val) + '$'
                       , '*=' : clean(val)
                       , '~=' : '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)'
                       , '|=' : '^' + clean(val) + '(-|$)'
                       }[cmp] || 'adnan^'))
}

function chunk(query) { return query.match(chunker) }
function byId(id) { return querySelectorAll('[id="' + id + '"]')[0] }
function isNode(el) { return el && typeof el === 'object' }
function previous(n) { while (n = n.previousSibling()) if (n.top) return n }
function clean(s) { return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/, '\\$1') }
function matchClass(d) { return ! RegExp('(^|\\s+)' + d.slice(1) + '(\\s+|$)').test(this.attr.class) }
function byTagName(name) { return traverse(this, function (doc) { return name == '*' || doc.tagName == name }, []) }
function traverse(node, fn, val) {
  return (node.__scene__ || node.children).forEach(function (node) { traverse(node, fn, val), fn(node) && val.push(node) }) || val }

var pseudos = {} //todo

var combinators = { ' ': function (d) { return d && d !== __scene__ && d.parent() }
                  , '>': function (d, maybe) { return d && d.parent() == maybe.parent() && d.parent() }
                  , '~': function (d) { return d && d.previousSibling() }
                  , '+': function (d, ct, p1, p2) { return ! d || ((p1 = previous(d)) && (p2 = previous(ct)) && p1 == p2 && p1) }
                  }
var chunker =
  /^(\*|\w+)?(?:([\.\#]+[\w\-\.#]+)?)(\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\])?(:([\w\-]+)(\(['"]?([^()]+)['"]?\))?)?/
;var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, fill: 0
, stroke: 0
, 'stroke-width': 2
, cx: 0
, cy: 0
, x: 0
, y: 0
, opacity: .999
}

function SVGProxy () {
  return types.reduce(function (a, type) {
           a[type.name] = function x() {
             var self = Object.create(type.prototype)
             extend(self, x)
             self.init(self.batch.alloc())
             self.attr = Object.create(attrDefaults)
             return self
           }
           extend(type.prototype, baseProto, proto[type.name], {tagName: type.name})
           return a
         }, {})
}

var proto = {
  circle: { init: function (i) {
              this.fBuffer[i[0]] = 1
              this.indices = i
            }
          , cx: function (v) {
              this.xyBuffer[this.indices[0] + 0] = v
            }
          , cy: function (v) {
              this.xyBuffer[this.indices[0] + 1] = v
            }
          , r: function (v) {
              this.rBuffer[this.indices[0]] = v
            }
          , cz: function (v) {
              this.rBuffer[this.indices[0] + 1] = v
            }
          , fill: function (v) {
              this.colorBuffer[this.indices[0]] = v < 0 ? v : parseColor(v)
            }
          , stroke: function (v) {
              this.colorBuffer[this.indices[0]] = parseColor(v)
            }
          }
, ellipse: { init: function () {}, cx: noop, cy: noop, rx: noop, ry: noop }
, rect: { init: function (i) {
            this.indices = this.batch.spread(
              [], Quad()
            )
            
          },
          opacity: function (v) {
              var f = this.fBuffer
              this.indices.forEach(function (i) {
                  f[i] = 256 - v * 256
              })
          },
          render: function (t) {
              var x = this.attr.x || 0
              var y = this.attr.y || 0
              var width = this.attr.width || 0
              var height = this.attr.height || 0

              this.xyBuffer[this.indices[0]] = x
              this.xyBuffer[this.indices[1]] = y
              this.xyBuffer[this.indices[2]] = x
              this.xyBuffer[this.indices[3]] = y + height
              this.xyBuffer[this.indices[4]] = x + width
              this.xyBuffer[this.indices[5]] = y + height
              this.xyBuffer[this.indices[6]] = x + width
              this.xyBuffer[this.indices[7]] = y
              this.xyBuffer[this.indices[8]] = x 
              this.xyBuffer[this.indices[9]] = y 
              this.xyBuffer[this.indices[10]] = x + width
              this.xyBuffer[this.indices[11]] = y + height
          }
        , fill: function (v) {
            var c = v < 0 ? v : parseColor(v)
            var cb = this.colorBuffer
            this.render()
            this.opacity(this.attr.opacity)
            this.indices.forEach(function (i) {
                cb[i] = c
            })
          }
        , x: function (v){
            this.xyBuffer[this.indices[0] + 0] = v
          }
        , y: function (v) {
            this.xyBuffer[this.indices[0] + 1] = v
          }
        , width: function (v) {
            this.xyBuffer[this.indices[0] + 2] = v
          }
        , height: function (v) {
            this.xyBuffer[this.indices[0] + 3] = v
          }
        , rx: noop,
          ry:  noop
        }
, image: { init: function () { }
         , 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }

, line: { init: function (i) {
            this.indices = i
          }
        , x1: function (v) { this.xyBuffer[this.indices[0]] = v }
        , y1: function (v) { this.xyBuffer[this.indices[0] + 1] = v }
        , x2: function (v) { this.xyBuffer[this.indices[1]] = v }
        , y2: function (v) { this.xyBuffer[this.indices[1]  + 1] = v }
        , stroke: function (v) {
            var fill = parseColor(v)
            var color = this.colorBuffer
            this.indices.forEach(function (i) {
              color[i * 4] = fill
              color[i * 2] = fill
              color[i] = fill
            }, this)
          }
        }
, path: { init: function () {
            this.indices = []
          }
        , d: buildPath
        , pathLength: noop
        , fill: function (v) {
            var fill = parseColor(v)
            this.indices.forEach(function (i) {
              this.colorBuffer[i] = fill
                this.colorBuffer[i*2] = fill
            }, this)
          }
        }
, polygon: { init: function () {
             }
           , points: noop }
, polyline: { init: function (i) {
                this.indices = [i * 2, i * 2 + 1]
              }
          , points: noop }
, g: { init: function () { }
     , appendChild: function (tag) { this.children.push(appendChild(tag)) }
     ,  ctr: function () { this.children = [] } }
, text: { init: function () {}, x: noop, y: noop, dx: noop, dy: noop }
}

var baseProto = {
  gl: gl
, children: Object.freeze([])
, querySelector: querySelector
, querySelectorAll: querySelectorAll
, createElementNS: identity
, insertBefore: noop
, ownerDocument: { createElementNS: function (_, x) { return x } }
, previousSibling: function () { canvas.__scene__[canvas.__scene__.indexOf(this) - 1] }
, nextSibling: function () { canvas.__scene__[canvas.__scene__.indexOf()  + 1] }
, parentNode: false
, removeChild: function (child) {
    var s = canvas.__scene__
    s.splice(s.indexOf(child), 1)
  }
, opacity: function (v) {
    var f = this.fBuffer[this.indices[0]] = 256 - (v * 256)
  }
, transform: function (d) {}
, getAttribute: function (name) {
    return this.attr[name]
  }
, setAttribute: function (name, value) {
    this.attr[name] = value
    this[name] && this[name](value)
    this.batch.changed = true
    if (value && value.texture) this.batch.bindMaterial(name, value)
  }
, removeAttribute: function (name) {
    delete this.attr[name]
  }
, textContent: noop
, removeEventListener: noop
, addEventListener: addEventListener
, style: { setProperty: noop }
, ownerSVGElement: { createSVGPoint: function () { return { y: 0, x: 0, matrixTransform: nyi } }}
, getScreenCTM: getScreenCTM
, getBBox: getBBox
, trigger: function (evt) {
    var fn = this['__on' + evt]
    if(fn) fn.call(this, new proxyEvent(this))
    return this
  }
}

baseProto.parentNode = baseProto
var types = [
  function circle () {}
, function rect() {}
, function ellipse() {}
, function line() {}
, function path() {}
, function polygon() {}
, function polyline() {}
, function image() {}
, function text() {}
, function g() {}
]

function buildPath (d) {
  parsePath.call(this, d)
  this.fill(this.attr.stroke)
}

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push(0)),
              function (d, i) { scene[i] = scene[i - 1] })
  scene[i] = node
}

function appendChild(el) {
  return this.__scene__[this.__scene__.length] = this.__renderTarget__.append(el.tagName)
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)

  el = this.__scene__.splice(i, 1)[0]
  el && el.batch.free(i)
  //el.buffer.count -= 1
}

function getScreenCTM(){
  var rect = canvas.getBoundingClientRect()

  return { a: 1
         , b: 0
         , c: 0
         , d: 1
         , e: this.attr.cx + rect.left
         , f: this.attr.cy + rect.top
         }
}
function getBBox(){
  return { height: 10
         , width: 10
         , y: this.attr.cy
         , x: this.attr.cx
         }
}
;function Texture(image, options) {
  if ('string' == typeof image) image = parseImage(image)
    options = options || {}
  //if (Array.isArray(image)) this.data = batchTexture.call(this)
  //if (image.constructor == Object) image = parseJSON(image)

  extend(this, {
    gl: gl
  , data: image
  , init: initTexture
  , dependents: []
  , id: gl.createTexture()
  , cursor: 0
  , val: id()
  , slots: options.slots || 1
  , invalidate: function () {
      // tasksOnce.push(function () {
      //     this.forEach(function (d) { d.invalidate() })
      // }.bind(this.dependents))
  }
  })

  if ('number' == typeof image) {
    this.height = Math.sqrt(nextSquare(image))
    this.width = this.slots * this.height
    this.data = false
    initTexture.call(this)
  }
  else loadTexture.call(this)
}

Texture.prototype = {
  update: function (data) {
      if (this.data && this.data.getContext)
          return gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.data)
      
    this.data ?
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data || this.data) :
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null)
  }
 , readBack : function (x, y, width, height) {
     x = x || 0
     y = y || 0
     width = width || this.width
     height = height || this.height
     var fb = gl.createFramebuffer()
     gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0)
     if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
         var pixels = new Uint8Array(width * height * 4)
         gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
     }
     return pixels
    }
, size: function (w, h) {
    if (! arguments.length) return this.width * this.height
    this.width = w
    this.height = h || w
    return this
  }
, x: function () {
    var sq = Math.sqrt(this.width * this.height)
    return function (d, i) { return -1.0 / sq * ~~ (i % sq) }
  }
, y: function () {
    var sq = Math.sqrt(this.width * this.height)
    return function (d, i) { return -1.0 / sq * ~~ (i / sq) }
  }

, bind: function (unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    pathgl.uniform('texture' + unit, unit);
    //console.log(unit.shit)
}
, subImage: function (x, y, data) {
    gl.bindTexture(gl.TEXTURE_2D, this.id)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, data.length / 4, 1, gl.RGBA, gl.FLOAT, new Float32Array(data))
  }

, repeat: function () {
    this.task = function () { this.update() }.bind(this)
    tasks.push(this.task)
    return this
  }

, stop : function () {
    this.task && tasks.splice(tasks.indexOf(this.task))
    delete this.task
  },
    __scene__: []

, appendChild: function (el) {
    if (! this.__renderTarget__) renderable.call(this)
    return this.__scene__[this.__scene__.length] = this.__renderTarget__.append(el.tagName || el)
  }

, valueOf: function () {
    return - this.val
  }

, copy: function () { return pathgl.texture(this.src) }
, pipe: pipeTexture
, querySelector: querySelector
, querySelectorAll: querySelectorAll
, ownerDocument: { createElementNS: function (_, x) { return x } }
, unwrap: unwrap
, adnan: true
, seed: seed
}

function initTexture() {
  var mipmap = mipmappable.call(this)
    , wrap = gl[mipmap ? 'REPEAT' : 'CLAMP_TO_EDGE']
    , filter = gl[mipmap ? 'LINEAR' : 'NEAREST']

  gl.bindTexture(gl.TEXTURE_2D, this.id)
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)

  this.update()

  //if (mipmap) gl.generateMipmap(gl.TEXTURE_2D)
}

function parseImage(image) {
  try {
    var query = document.querySelector(image)
    if (query) return query
  } catch (e) {}

  return extend(isVideoUrl ? new Image : document.createElement('video'), { crossOrigin: 'anonymous', src: image})
}

function pipeTexture(ctx) {
  ctx.render.read(this)
    //console.log('f', this)
  return this
}

function readFrom(ctx) {
  this.dependents.push(ctx)
}

function unwrap() {
  var i = (this.width * this.height / this.slots) || 0, uv = new Array(i)
  while(i--) uv[i] = { x: this.x()(0, i * this.slots), y: this.y()(0, i * this.slots) }
  return uv
}

function renderable() {
  extend(this, { __scene__: [] })
  ;(this.__renderTarget__ = RenderTarget(this))
  .drawTo(this)
  var save  = this.update
  this.update = function () {
    save.call(this)
    this.__renderTarget__.update()
  }
}

function batchTexture () {
  var data = this.data
    , rows = data.rows
    , size = data.width
    , update = this.update.bind(this)
    , c = document.createElement('canvas').getContext('2d')
    , tile = size / rows
    , count = 0

  c.canvas.width = c.canvas.height = size

  data.forEach(function (d, i) {
    var img = parseImage(data[i]),
        sx = tile * (i % rows),
        sy = tile * ~~(i / rows)

    onLoad(img, function () {
      c.drawImage(img, sx, sy, tile, tile)
      update()
    })
  }, this)

  return c.canvas
}

function readFrom(ctx) {
  this.dependents.push(ctx)
}

function parseJSON(json) {
  var buff = new Float32Array(1024), row = 0, count = 0
  for(var key in json) {
    for(var pixel in json[key])
      buff[count++] = json[key][pixel]

    if (count > 1020) {
        this.subImage(0, count, buff)
        buff = new Float32Array(1024)
    }
  }
}

function loadTexture()  {
  var image = this.data

  //swap texture data with filler until texture loads
  // this.data = checkerboard
  // this.width = checkerboard.width
  // this.height = checkerboard.height
  // initTexture.call(this)

  onLoad(image, function () {
      this.width = image.width || 512
      this.height = image.height || 512
      this.data = image
      initTexture.call(this)
  }.bind(this))

  return this
}

function seed(count, origin, fn) {
    var x = (this.slots * this.cursor) % this.width | 0
      , y = (this.slots * this.cursor) / this.height | 0
      , chunks = [{ x: x, y: y, size: count * this.slots}]
      , s = this.height

    fn = fn || function () { return 1 - Math.random() * 2 }
    var chunk = chunks[0]

    do {
        var boundary = chunk.x + chunk.size
          , delta = boundary - s
        chunk.size -= delta
        chunks.push(chunk = { x: 0, y:(chunk.y + 1) % s, size: delta })
    } while (boundary > s)

    for(var i = 0; i < chunks.length; i++) {
        var data = [], j = -1
        chunk = chunks[i]
        while(++j < chunk.size)
            data.push(origin[0], origin[1], fn(j), fn(j))
        this.subImage(chunk.x, chunk.y, data)
    }

    this.cursor += count;
    this.cursor %= this.size();
    this.invalidate()
}
; }()