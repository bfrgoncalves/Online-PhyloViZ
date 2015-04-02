module['exports'] = {
  "*::getEvents": function(cb) {
    cb(null, this.getEvents());
  },
  "*::query": function (hook, cb) {
    this.query(hook, cb);
  },
  "*::spawn": function (options, cb) {
    this.spawn(options, cb);
  },
  "*::install": function (hook, callback) {
    var self = this;
    self.emit('hook::npm::installing', hook);
    self.npm.install(hook, function (err, result) {
      if (err) {
        return self.emit('hook::npm::install::error', err);
      }
      self.emit('hook::npm::installed', result);
      if (callback) {
        callback(null, result);
      }
    });
  },
  "*::link": function (hook, callback) {
    var self = this;
    self.emit('hook::npm::linking', hook);
    self.npm.link(hook, function (err, result) {
      if (err) {
        return self.emit('hook::npm::link::error', err);
      }
      self.emit('hook::npm::linked', result);
      if (callback) {
        callback(null, result);
      }
    });
  },
  "*::connection::end": function (data) {
    var self = this;
    if(data.proposedRank >= self.proposedRank) {
      self.proposedRank = self.proposedRank - 1;
      self.emit('hook::rank::accepting', self.proposedRank);
    }
  },
  "hook::disconnected": function (data) {
    var self = this;
    self.clientCount = self.clientCount - 1;
    if(data.proposedRank >= self.proposedRank) {
      //self.proposedRank = self.proposedRank - 1;
      //console.log('my new proposedRank is ', self.proposedRank);
    }
  },
};