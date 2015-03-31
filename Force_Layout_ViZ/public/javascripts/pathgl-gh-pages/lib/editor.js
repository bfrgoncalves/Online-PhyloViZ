function initCodeMirror () {
  var code =
    CodeMirror(document.querySelector('body'), {
      matchBrackets: true
    , mode:  "javascript"
    , value: 'hello...'
    , showCursorWhenSelecting: true
    , tabSize: 8
    , indentUnit: 8

    , onChange: function (a, b) {
                  try { new Function('+' + a.getValue() + '("canvas")') }
                  catch (e) { console.log(e.stack)  }

                  cleanup()

                  injectScript('+' + a.getValue() + '("' + selector +'")')

                }
    })

  code.getWrapperElement().style.display = 'none'

  d3.select('.edit').datum({}).on('click', function (d) {
    if (d.show = ! d.show) {
      code.getWrapperElement().style.display = 'block'
      this.textContent = 'Hide Code'
      code.focus()
      code.refresh()
    } else {
      code.getWrapperElement().style.display = 'none'
      this.textContent = 'Edit Code'
    }
  })

  return code
}
utils.domifyHTML = function (string) {
      var div = document.createElement('div')
      div.innerHTML = string

      if (div.childNodes.length == 1)
        return div.removeChild(div.childNodes[0])

      var fragment = document.createDocumentFragment()

      while (div.firstChild)
        fragment.appendChild(div.firstChild)

      return fragment
    }

d3._tsv = d3.tsv
          d3._csv = d3.csv
          d3._json = d3.json
function loadGist() {
  var link = this.value
         , segments = link.split('/')
         , id = + segments.reverse().find(parseFloat)

  if (! id) return

  var files  = {}

  d3.json = function (url, cb) {
              if (url in files) cb(null, JSON.parse(files[url].content))
              else d3._json.apply(0, arguments)
            }

  d3.tsv = function (url, accessor, cb) {
            if (arguments.length == 2) (cb = accessor), (accessor = null)
            if (url in files) cb(null, d3.tsv.parse(files[url].content, accessor))
            else d3._tsv.apply(0, arguments)
          }

  d3.csv = function (url, accessor, cb) {
        if (arguments.length == 2) (cb = accessor), (accessor = null)
        if (url in files) cb(null, d3.csv.parse(files[url].content, accessor))
        else d3._csv.apply(0, arguments)
      }

  // _.extend(d3.tsv, d3._tsv)
  // _.extend(d3.csv, d3._csv)

  d3.json("https://api.github.com" + "/gists/" + id, function (err, data) {
    cleanup()
    files = data.files
    var injection =
      files['index.html'].content.replace('append("svg")', 'select("canvas").call(pathgl)')

    //var frag = utils.domifyHTML(injection)
    d3.select('.blockDisplay').html(injection)
    .selectAll('script')
    .filter(function () { return ! this.classList.contains('temp') })
    .each(function () { eval(this.textContent) })
  })
}