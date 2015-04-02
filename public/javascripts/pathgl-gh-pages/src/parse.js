function parsePath(str) {
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
