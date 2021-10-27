var extend   = require('extend');
var lruCache = require('lru-cache');
var Script   = require('./Script');
var fs       = require('fs');

var Scripty = function(redis, opts){
  this.redis = redis;

  var conf = {};
  this.conf = extend(true, conf, opts);

  this.cache = lruCache({
    max: 10000
  });
};

/**
 * Register a script and return its digest.
 * Only registers once.
 * @param  {object}   redis  node-redis client
 * @param  {object}   script script info. Must be: { digest: "digest of src", src: "source of script" }
 * @param  {Function} cb
 */
Scripty.prototype.loadScript = function(name, src, cb) {
  var redis = this.redis;
  var self = this;
  var script;

  if ((script = this.cache.get(name))) {
    setImmediate(function(){
      cb(null, script);
    });

    return script;
  }

  script = new Script(this, name, src);
  var digest = script.digest;

  redis.script('load', src, function(err, redisDigest) {
    if (err) return cb(err);

    if (redisDigest !== digest) return cb(new Error('digest mismatch'));

    self.cache.set(name, script);

    return cb(err, script);
  });

  return script;
};

Scripty.prototype.loadScriptFile = function(name, path, cb) {
  var self = this;
  var script;

  if ((script = this.cache.get(name))) {
    setImmediate(function(){
      cb(null, script);
    });

    return script;
  }

  var opts = {
    encoding: 'utf8'
  };

  fs.readFile(path, opts, function(err, data) {
    if (err) return cb(err);

    return self.loadScript(name, data, cb);
  });
};

module.exports = function(redis, opts){
  return new Scripty(redis, opts);
};
