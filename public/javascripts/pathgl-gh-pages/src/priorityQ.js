function PriorityQ (leq) {
  this.keys_ = PriorityQ.prototype.PQKeyRenew_(false, PriorityQ.INIT_SIZE_)
  this.order_ = false
  this.size_ = 0
  this.max_ = PriorityQ.INIT_SIZE_
  this.initialized_ = false

  this.leq_ = (leq)

  this.heap_ = new Heap(this.leq_)
}

PriorityQ.INIT_SIZE_ = 32

PriorityQ.prototype.init = function() {
  this.order_ = []
  for (var i = 0; i < this.size_; i++) this.order_[i] = i
  var comparator = (function(keys, leq) {
    return function(a, b) {
      return leq(keys[a], keys[b]) ? 1 : -1
    }
  })(this.keys_, this.leq_)
  this.order_.sort(comparator)

  this.max_ = this.size_
  this.initialized_ = true
  this.heap_.init()

  var p = 0
  var r = p + this.size_ - 1
  for (i = p; i < r; ++i)
    debugT(this.leq_(this.keys_[this.order_[i+1]], this.keys_[this.order_[i]]))
}

PriorityQ.prototype.add = function(keyNew) {
  if (this.initialized_) return this.heap_.add(keyNew)

  var now = this.size_
  if (++this.size_ >= this.max_) {
    this.max_ *= 2
    this.keys_ = PriorityQ.prototype.PQKeyRenew_(this.keys_, this.max_)
  }

  this.keys_[now] = keyNew
  return -(now+1)
}

PriorityQ.prototype.PQKeyRenew_ = function(oldArray, size) {
  var newArray = new Array(size)
  var index = 0
  if (oldArray !== false)
    for (; index < oldArray.length; index++)
      newArray[index] = oldArray[index]

  for (; index < size; index++) newArray[index] = false

  return newArray
}

PriorityQ.prototype.keyLessThan_ = function(x, y) {
  var keyX = this.keys_[x]
  var keyY = this.keys_[y]
  return !this.leq_(keyY, keyX)
}

PriorityQ.prototype.keyGreaterThan_ = function(x, y) {
  var keyX = this.keys_[x]
  var keyY = this.keys_[y]
  return !this.leq_(keyX, keyY)
}

PriorityQ.prototype.findMin = function() {
  if (this.size_ === 0) return this.heap_.findMin()

  var sortMin = this.keys_[this.order_[this.size_-1]]
  if (!this.heap_.isEmpty()) {
    var heapMin = this.heap_.minimum()
    if (this.leq_(heapMin, sortMin)) return this.heap_.findMin()
  }

  do {
    --this.size_
  } while(this.size_ > 0 && this.keys_[this.order_[this.size_-1]] === false)

  return sortMin
}

PriorityQ.prototype.minimum = function() {
  if (this.size_ === 0) return this.heap_.minimum()

  var sortMin = this.keys_[this.order_[this.size_-1]]
  if (!this.heap_.isEmpty()) {
    var heapMin = this.heap_.minimum()
    if (this.leq_(heapMin, sortMin)) return heapMin
  }
  return sortMin
}

PriorityQ.prototype.isEmpty = function() {
  return (this.size_ === 0) && this.heap_.isEmpty()
}

PriorityQ.prototype.remove = function(now) {
  if (now >= 0) return this.heap_.remove(now)

  now = -(now+1)

  debugT(now < this.max_ && this.keys_[now] !== false)

  this.keys_[now] = false
  while(this.size_ > 0 && this.keys_[this.order_[this.size_-1]] === false)
    --this.size_
}


function Heap(leq) {
  this.ns_ = PQN.renew(false, Heap.INIT_SIZE_ + 1)
  this.handles_ = PQHandleElem.renew(false, Heap.INIT_SIZE_ + 1)
  this.size_ = 0
  this.max_ = Heap.INIT_SIZE_
  this.fList_ = 0
  this.initialized_ = false
  this.leq_ = leq
  this.ns_[1].handle = 1
}

Heap.INIT_SIZE_ = 32

Heap.prototype.killHeap = function() {
  this.handles_ = false
  this.ns_ = false
}

Heap.prototype.init = function() {
  for(var i = this.size_; i >= 1; --i)
    this.floatDown_(i)

  this.initialized_ = true
}

Heap.prototype.add = function(keyNew) {
  var now = ++this.size_, f

  if ((now*2) > this.max_) {
    this.max_ *= 2
    this.ns_ = PQN.renew(this.ns_, this.max_ + 1)
    this.handles_ = PQHandleElem.renew(this.handles_, this.max_ + 1)
  }

  if (this.fList_ === 0) f = now
  else {
    f = this.fList_
    this.fList_ = this.handles_[f].n
  }

  this.ns_[now].handle = f
  this.handles_[f].n = now
  this.handles_[f].key = keyNew

  if (this.initialized_) this.floatUp_(now)
  return f
}

Heap.prototype.isEmpty = function() {
  return this.size_ === 0
}

Heap.prototype.minimum = function() {
  return this.handles_[this.ns_[1].handle].key
}

Heap.prototype.findMin = function() {
  var n = this.ns_
  var h = this.handles_
  var hMin = n[1].handle
  var min = h[hMin].key

  if (this.size_ > 0) {
    n[1].handle = n[this.size_].handle
    h[n[1].handle].n = 1

    h[hMin].key = false
    h[hMin].n = this.fList_
    this.fList_ = hMin

    if (--this.size_ > 0 ) this.floatDown_(1)
  }

  return min
}

Heap.prototype.remove = function(hNow) {
  var n = this.ns_
  var h = this.handles_

  debugT(hNow >= 1 && hNow <= this.max_ && h[hNow].key !== false)

  var now = h[hNow].n
  n[now].handle = n[this.size_].handle
  h[n[now].handle].n = now

  if (now <= --this.size_) {
    (now <= 1 || this.leq_(h[n[now>>1].handle].key, h[n[now].handle].key)) ?
      this.floatDown_(now) :
      this.floatUp_(now)
  }

  h[hNow].key = false
  h[hNow].n = this.fList_
  this.fList_ = hNow
}

Heap.prototype.floatDown_ = function(now) {
  var n = this.ns_
  var h = this.handles_
  var hNow = n[now].handle
  for( ;; ) {
    var child = now << 1
    if (child < this.size_ && this.leq_(h[n[child+1].handle].key, h[n[child].handle].key)) ++child

    debugT(child <= this.max_)

    var hChild = n[child].handle
    if (child > this.size_ || this.leq_(h[hNow].key, h[hChild].key)) {
      n[now].handle = hNow
      return h[hNow].n = now
    }
    n[now].handle = hChild
    h[hChild].n = now
    now = child
  }
}

Heap.prototype.floatUp_ = function(now) {
  var n = this.ns_
  var h = this.handles_

  var hNow = n[now].handle
  for( ;; ) {
    var parent = now >> 1
    var hParent = n[parent].handle
    if (parent === 0 || this.leq_(h[hParent].key, h[hNow].key)) {
      n[now].handle = hNow
      return h[hNow].n = now
    }

    n[now].handle = hParent
    h[hParent].n = now
    now = parent
  }
}


function PQN() {
  this.handle = 0
}

PQN.renew = function(oldArray, size) {
  var newArray = new Array(size)
  var index = 0

  if (oldArray !== false)
    for (;index < oldArray.length; index++) newArray[index] = oldArray[index]

  for (;index < size; index++) newArray[index] = new PQN()

  return newArray
}

function PQHandleElem() {
  this.key = false
  this.n = 0
}

PQHandleElem.renew = function(oldArray, size) {
  var newArray = new Array(size)
    , index = 0

  if (oldArray !== false)
    for (;index < oldArray.length; index++) newArray[index] = oldArray[index]

  for (;index < size; index++) newArray[index] = new PQHandleElem()

  return newArray
}
