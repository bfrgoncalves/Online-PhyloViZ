function Pool(max) {
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

