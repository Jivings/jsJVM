(function() {
  /*
    Runtime Data Area of the JVM. Stores all loaded Classes, 
    instantiated Objects and running or paused Threads.
  */  this.RDA = (function() {
    function RDA() {
      this.waiting = new Array();
      this.method_area = {};
      this.heap = {
        permgen: {},
        oldgen: {},
        younggen: {},
        id: 0,
        0: null
      };
      this.heap.allocate = function(object) {
        var ref;
        ref = ++this.id;
        this[ref] = object;
        return new JVM_Reference(ref);
      };
      this.threads = new Array();
      this.clinitThread = new Worker('js/jvm/Thread.js');
      this.clinitThread['finished'] = true;
      this.clinitThread.waiting = new Array();
    }
    RDA.prototype.addNative = function(name, raw_class) {
      return this.method_area[name] = raw_class;
    };
    /*
        Adds a Class loaded by the ClassLoader to the Method Area. 
        If the Class has a <clinit> method, that will be executed here.
        
        If the Class is the entry point to the application, the main method will be
        resolved and executed.
      */
    RDA.prototype.addClass = function(classname, raw_class) {
      var method, supercls;
      supercls = this.method_area[raw_class.get_super()];
      raw_class.constant_pool[raw_class.super_class] = supercls;
      this.method_area[classname] = raw_class;
      this.clinit(classname, raw_class);
      if (classname === this.JVM.mainclassname) {
        method = this.JVM.JVM_ResolveMethod(raw_class, 'main', '([Ljava/lang/String;)V');
        return this.createThread(classname, method);
      }
    };
    /*
        Creates a new Thread instance to execute Java methods. Each Java Thread 
        is represented by a JavaScript worker
      */
    RDA.prototype.createThread = function(mainClassName, method) {
      var args, id, self, t;
      id = this.threads.length - 1;
      t = new Worker('js/jvm/Thread.js');
      self = this;
      t.onmessage = function(e) {
        return self.message.call(self, e);
      };
      t.onerror = function(e) {
        return console.log(e);
      };
      this.threads.push(t);
      args = {
        'action': 'new',
        'resource': {
          'class': this.method_area[mainClassName],
          'id': id,
          'entryMethod': method
        }
      };
      t.postMessage(args);
      return true;
    };
    /*
        If a Class contains a <clinit> method, it is executed as the class
        is loaded
      */
    RDA.prototype.clinit = function(classname, raw_class) {
      var clsini, message;
      clsini = this.JVM.JVM_ResolveMethod(raw_class, '<clinit>', '()V');
      if (clsini) {
        message = {
          'action': 'new',
          'resource': {
            'class': raw_class,
            'id': 0,
            'entryMethod': clsini
          }
        };
        if (this.clinitThread.finished) {
          this.clinitThread.finished = false;
          this.clinitThread.postMessage(message);
        } else {
          this.clinitThread.waiting.push(message);
        }
      }
      return true;
    };
    /*
        Notify all threads waiting on a particular notifier object.
        Threads will continue executing from where they were paused.
        @see Thread.notify()
      */
    RDA.prototype.notifyAll = function(notifierName, data) {
      var lock, thread, _ref;
      _ref = this.waiting;
      for (lock in _ref) {
        thread = _ref[lock];
        if (lock === notifierName) {
          thread.postMessage({
            'action': 'resource',
            'resource': data
          });
        }
      }
      return true;
    };
    RDA.prototype.lockAquired = function(thread) {
      return thread.postMessage({
        'action': 'notify'
      });
    };
    /*
        Thread interface methods. The following are messages received from 
        running Threads. These are detailed individually, but are usually requests
        for resources such as Objects.
      */
    RDA.prototype.message = function(e) {
      var actions;
      actions = {
        'resolveClass': function(data) {
          return this.JVM.JVM_ResolveClass(data.name, e.target);
        },
        'resolveMethod': function(data) {
          var method;
          method = this.JVM.JVM_ResolveMethod(data.classname, data.methodname, data.descriptor);
          return e.target.postMessage({
            'action': 'resource',
            'resource': method
          });
        },
        'resolveField': function(data) {},
        'resolveString': function(data) {
          var stringref;
          stringref = this.JVM.JVM_ResolveStringLiteral(data.string);
          return e.target.postMessage({
            'action': 'resource',
            'resource': stringref
          });
        },
        'getObject': function(data) {
          var object;
          object = this.heap[data.reference.pointer];
          return e.target.postMessage({
            'action': 'resource',
            'resource': object
          });
        },
        'updateObject': function(data) {
          this.heap[data.reference.pointer] = data.object;
          return e.target.postMessage({
            'action': 'notify'
          });
        },
        'getStatic': function(data) {
          var field;
          field = this.method_area[data.classname].fields[data.fieldname];
          return e.target.postMessage({
            'action': 'resource',
            'resource': field
          });
        },
        'setStatic': function(data) {
          this.method_area[data.classname].fields[data.fieldname] = data.value;
          return e.target.postMessage({
            'action': 'notify'
          });
        },
        'setObjectField': function(data) {
          var obj;
          obj = this.heap[data.reference.pointer];
          obj[data.fieldname] = data.value;
          return e.target.postMessage({
            'action': 'notify'
          });
        },
        'getObjectField': function(data) {
          var obj, value;
          obj = this.heap[data.reference.pointer];
          value = obj[data.fieldname];
          return e.target.postMessage({
            'action': 'resource',
            'resource': value
          });
        },
        'aquireLock': function(data) {
          if (this.heap[data.reference.pointer].monitor.aquireLock(e.target)) {
            return lockAquired(e.target);
          }
        },
        'releaseLock': function(data) {
          return this.heap[data.reference.pointer].monitor.releaseLock(e.target);
        },
        'allocate': function(data) {
          var ref;
          ref = this.heap.allocate(data.object);
          return e.target.postMessage({
            'action': 'resource',
            'resource': ref
          });
        },
        'log': function(data) {
          return console.log(data.message);
        },
        'finished': function() {
          console.log('Thread #' + data.id + ' finished');
          if (e.target === this.clinitThread) {
            return this.clinitThread.postMessage(this.clinitThread.waiting.pop());
          } else {
            return this.clinitThread.finished = true;
          }
        }
      };
      return actions[e.data.action](e.data);
    };
    return RDA;
  })();
}).call(this);
