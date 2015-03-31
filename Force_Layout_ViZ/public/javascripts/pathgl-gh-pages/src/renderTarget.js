function RenderTarget(screen) {
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
