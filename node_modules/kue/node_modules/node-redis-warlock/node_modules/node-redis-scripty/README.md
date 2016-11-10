scripty
=======

Redis script manager for node.js.

* Easily load scripts into Redis' script cache using `scripty.loadScript`.
* Run loaded scripts using `script.run()`;

Scripty caches the sha1 digest in an LRU cache local to the node process, allowing it to invoke the script on Redis using the hash instead of eval'ing it each time.

Scripty also guards against script flushes on Redis. If the Redis script cache is flushed or the script disappears for whatever reason, Scripty will automatically detect this and re-load the script into Redis before executing.

# Requirements

* [node-redis](https://github.com/mranney/node_redis) compatible with `v0.10`
* Redis `v2.6` or above

# Install

    npm install node-redis-scripty

# Usage

```javascript
var redis = require('redis').createClient();

var src = 'return KEYS[1]';
var scripty = new Scripty(redis);
scripty.loadScript('blank', src, function(err, script) {
  script.run(1, 'hi', function(err, result) {
    if (err) return;

    // Should print 'hi'
    console.log(result);
  });
});
