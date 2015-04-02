//regexes sourced from sizzle
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
