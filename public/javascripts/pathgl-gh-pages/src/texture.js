function Texture(image, options) {
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
