var should  = require('should');
var redis = require('./setup/redisConnection');
require('./setup/redisFlush');
var Scripty = require('../lib/Scripty');

var src = 'return KEYS[1]';

describe('scripty', function() {
  var scripty = new Scripty(redis);

  it('registers script and caches digest', function(done) {
    var redis = this.redis;

    scripty.loadScript('blank', src, function(err, blank) {
      should.not.exist(err);
      (typeof blank.digest).should.equal('string');
      blank.digest.length.should.equal(40);

      redis.script('exists', blank.digest, function(err, exists) {
        should.not.exist(err);
        exists[0].should.equal(1);

        scripty.cache.has('blank').should.equal(true);

        return done();
      });
    });
  });

  it('runs script', function(done) {
    scripty.loadScript('blank', src, function(err, blank) {
      blank.run(1, 'hi', function(err, result) {
        should.not.exist(err);
        result.should.equal('hi');

        done();
      });
    });
  });

  it('re-caches digest if script is run after being flushed from redis', function(done) {
    scripty.loadScript('blank', src, function(err, blank) {
      should.not.exist(err);

      var digest = blank.digest;

      redis.script('flush', function(err) {
        blank.run(1, 'hi', function(err, result) {

          should.not.exist(err);
          result.should.equal('hi');

          scripty.cache.has('blank').should.equal(true);

          return done();
        });
      });
    });
  });

  it('can load script from file', function(done) {
    scripty.loadScriptFile('blank', __dirname + '/lua/script.lua', done);
  });
});
