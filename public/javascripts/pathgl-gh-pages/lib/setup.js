var examples = {}
  , docs = {}
  , selector = 'canvas'
  , isDesktop = innerWidth > 1000
  , size = { width: innerWidth * (isDesktop ? .85 : 1)
           , height: innerHeight * (1)
           }

d3.select(window).on('load', loaded)

function loaded () {
  d3extend()
  // pjax(".examples a", loadScript)
  // pjax(".docs a", loadDocs)
  var c = d3.select('canvas')
  window.$ = c.selectAll.bind(c)
  if ('/' == window.location.pathname) d3.select('[href*=swarm]').node().click()

  d3.selectAll('li').on('click.scroll', function () {})

  //redirects...
  if (location.hostname == 'adnanwahab.com')
    location.href = 'http://pathgl.com'

  if (location.hostname == 'localhost')
    d3.json('//' + location.hostname + ':1234').on('load', location.reload.bind(location))
}

function off (el){
  var node = el.node()
    , keys = d3.keys(node)

  keys.forEach(function (key) {
    if (key = key.match(/__on(.+)/)) el.on(key[1], null)
  })
}

function cleanup() {
  pathgl.stop()
  d3.select('svg').selectAll('*').remove()
  off(window.c = d3.select('canvas'))

  d3.select('.blurb').text(null)
}

function pjax(links, cb) {
  d3.selectAll(links).on("click", function() {
    history.pushState(this.href, this.textContent, this.href)
    cb(this.href)
    d3.event.preventDefault()
  });

  d3.select(window).on("popstate", function() {
    if (d3.event.state) cb(d3.event.state)
  })
}

function loadScript(href) {
  d3.text(href.replace('.html','.js'), function(fragment) {
    cleanup()
    document.querySelector('body').scrollTop = document.querySelector('.right').offsetTop
    var script = document.createElement('script')
    script.textContent = fragment
    document.head.appendChild(script)
  })
}

function loadDocs(href) {
  d3.text(href.replace('.html', '.md'), function(fragment) {
    cleanup()
    document.querySelector('body').scrollTop = document.querySelector('.right').offsetTop
    document.querySelector('.blurb').textContent = (fragment)
  })
}



var env = {
    size: 1e5
}
//slider



function d3extend() {
  d3.transition.repeat
}