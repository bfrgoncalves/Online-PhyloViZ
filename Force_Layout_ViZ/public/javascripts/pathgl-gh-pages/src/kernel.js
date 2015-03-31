pathgl.shader = shader

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
