var crypto = require('crypto');

var Script = module.exports = function(scripty, name, src) {
  this.scripty = scripty;
  this.redis = this.scripty.redis;
  this.name = name;
  this.src = src;
  this.digest = this.digest(this.src);
};

Script.prototype.run = function() {
  var self = this;
  var origArguments = arguments;
  var args = Array.prototype.slice.call(arguments);
  var cb = function(){};

  var checkResult = function(err) {

    if (err && err.message.indexOf('NOSCRIPT') !== -1) {
      // Check if the script has been flushed for some reaon.
      // Someone could have run a script flush or a flushall on the server.
      // re-register script and try re-running
      self.scripty.cache.del(self.name);

      self.scripty.loadScript(self.name, self.src, function(err, script) {
        if (err) return cb(err);

        return script.run.apply(self, origArguments);
      });

      return;
    }

    return cb.apply(cb, arguments);
  };

  if (typeof args[args.length-1] === 'function') cb = args.pop();

  args.unshift(this.digest);
  args.push(checkResult);

  self.redis.evalsha.apply(self.redis, args);
};

Script.prototype.digest = function(src) {
  return crypto.createHash('sha1').update(src).digest('hex');
};
