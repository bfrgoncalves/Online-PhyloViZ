var compressor = require('uglify-js')
  , marked = require('marked')

  , fs = require('fs')
  , http = require('http')
  , path = require('path')
  , source = './src/'
  , main = 'main.js'

var connections = []

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

basicFileServer(3000)
watchFiles(1234)

function watchFiles(port) {
  build('','')
  fs.watch('src', build)
  http.createServer(live_reloader).listen(port)
  console.log('watching for file save on port ' + port)
  return
  ;['src', 'examples', 'lib', 'documentation']
   .forEach(function (dir) {
     console.log('watching ' + dir)
     fs.readdirSync(dir).forEach(function (name) {
       var count = 0
       fs.watch(dir + '/' + name, function (type) { (++count % 2) || process.emit('write_file') })
     })
   })
}

var elapsed = new Date()
function build(_, file) {
  var blob = [ 'start.js'
             , 'priorityQ.js'
             , 'util.js'
             , 'color.js'
             , 'kernel.js'
             , 'shaders.js'
             , 'init.js'
             , 'triangulate.js'
             , 'parse.js'
             , 'picking.js'
             , 'batch.js'
             , 'renderTarget.js'
             , 'queryselector.js'
             , 'proxy.js'
             , 'texture.js'
             , 'end.js'
             ].map(read).join(';')
    , closed = '! function() {\n' + blob + ' }()'

  if((Date.now() - elapsed) < 200) return
  elapsed = Date.now()

  console.log('rebuilding ' + (file ? file : ''))

  try {
    if (! fs.existsSync('dist/')) fs.mkdirSync('dist/')
    fs.writeFileSync('dist/pathgl.js', closed)
    fs.writeFileSync('dist/pathgl.min.js',
                     compressor.minify(closed, { fromString: true }).code
                    )
  } catch (e) { console.log(e) }

  fs.readdirSync('documentation').filter(isType('.md')).filter(hash)
  .forEach(function (abc) {
    var file = template(marked(fs.readFileSync('documentation/' + abc).toString()), null, 'documentation')
    fs.writeFileSync('documentation/' + abc.replace('.md', '.html'), file)
  })


  fs.readdirSync('examples/js/').filter(isType('.js')).filter(hash)
  .forEach(function (name) {
    var content = '<script src="js/' + name +  '"></script>' +
      '<p>' + fs.readFileSync('examples/md/' + name.replace('js', 'md')) + '</p>' +
      '<pre><code>' + fs.readFileSync('examples/js/' + name) + '</code></pre>'

    var file = template(content,
                        name.replace(/\..*/, ''),
                        'examples')
    fs.writeFileSync('examples/' + name.replace('.js', '.html'), file)
  })
}

function read (file) {
  return '' + fs.readFileSync(source + file)
}

function hash(str) {
  return ! str.match('#')
}

function live_reloader(req, res) {
  console.log('connection received')
  connections.push(res)
}

process.on('write_file', function () {
  while(connections.length) connections.pop().end()
})

function isType(wow) {
  return function (d) {
    return path.extname(d) == wow
  }
}

function template (content, page, dir) {
  return fs.readFileSync('lib/template.html')
         .toString()
         .replace('<!--content-->', content)
         .replace('{{source}}', (page || '') + ' ' + dir)
}

function basicFileServer(port) {
  var express = require('express')
    , app = express()

  app.set('port', port)

  app.configure(function() {
    app.use(express.logger('dev'))
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(express.static(path.resolve(__dirname, '..')))
    app.use(app.router)
  })

  app.listen(app.get('port'), function(){
    console.log('Listening on port ' + app.get('port'))
  })
}
