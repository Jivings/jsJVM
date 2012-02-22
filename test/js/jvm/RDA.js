(function() {
  /*
    Runtime Data Area of the JVM. Stores all loaded Classes, 
    instantiated Objects and running or paused Threads.
  */
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.RDA = (function() {
    function RDA() {
      var self;
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
        if (object instanceof JVM_Reference) {
          throw "Reference on heap?";
        }
        ref = ++this.id;
        this[ref] = object;
        return new JVM_Reference(ref);
      };
      this.threads = new Array();
      this.clinitThread = new Worker(Settings.workerpath + '/Thread.js');
      this.clinitThread['finished'] = true;
      this.clinitThread.waiting = new Array();
      self = this;
      this.clinitThread.loaded = 0;
      this.clinitThread.onmessage = function(e) {
        return self.message.call(self, e);
      };
      this.clinitThread.onerror = function(e) {
        return console.log(e);
      };
      this.clinitThread.init = true;
      this.clinitThread.callback = new Array();
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
    RDA.prototype.addClass = function(classname, raw_class, instantiatedCallback) {
      var cls;
      cls = raw_class;
      while ((cls = cls.get_super()) !== void 0) {
        if (!this.method_area[cls.real_name]) {
          this.method_area[cls.real_name] = cls;
        }
      }
      this.method_area[classname] = raw_class;
      return this.clinit(classname, raw_class, __bind(function() {
        var method;
        if (classname === this.JVM.mainclassname) {
          method = this.JVM.JVM_ResolveMethod(raw_class, 'main', '([Ljava/lang/String;)V');
          this.createThread(classname, method);
        }
        if (instantiatedCallback) {
          return instantiatedCallback();
        }
      }, this));
    };
    /*
        Creates a new Thread instance to execute Java methods. Each Java Thread 
        is represented by a JavaScript worker
      */
    RDA.prototype.createThread = function(mainClassName, method, locals, callback) {
      var args, id, self, t;
      id = this.threads.length - 1;
      t = new Worker(Settings.workerpath + '/Thread.js');
      self = this;
      t.onmessage = function(e) {
        return self.message.call(self, e);
      };
      t.onerror = function(e) {
        return console.log(e);
      };
      this.threads.push(t);
      if (callback) {
        t.callback = callback;
      }
      args = {
        'action': 'new',
        'resource': {
          'class': this.method_area[mainClassName],
          'id': id,
          'entryMethod': method,
          'locals': locals
        }
      };
      t.postMessage(args);
      return true;
    };
    /*
        If a Class contains a <clinit> method, it is executed as the class
        is loaded
      */
    RDA.prototype.clinit = function(classname, raw_class, callback) {
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
        this.createThread(classname, clsini, null, callback);
        /*@clinitThread.callback.push(callback)
        
        if @clinitThread.finished or !@clinitThread.init
          @clinitThread.finished = false
          @clinitThread.postMessage(message)
        else
          @clinitThread.waiting.push(message)
        */
      } else {
        callback();
      }
      return true;
    };
    /*
        Notify all threads waiting on a particular notifier object.
        Threads will continue executing from where they were paused.
        @see Thread.notify()
      */
    RDA.prototype.notifyAll = function(notifierName, data) {
      return true;
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
          return this.JVM.JVM_ResolveClass(data.name, e.target, __bind(function(cls) {
            return e.target.postMessage({
              'action': 'resource',
              'resource': cls
            });
          }, this));
        },
        'resolveNativeClass': function(data) {
          if (this.JVM.JVM_ResolveNativeClass(data.name, e.target)) {
            return e.target.postMessage({
              'action': 'notify'
            });
          }
        },
        'resolveMethod': function(data) {
          return this.JVM.JVM_ResolveClass(data.classname, e.target, __bind(function(cls) {
            var method;
            method = this.JVM.JVM_ResolveMethod(cls, data.name, data.descriptor);
            return e.target.postMessage({
              'action': 'resource',
              'resource': method
            });
          }, this));
        },
        'executeNativeMethod': function(data) {
          var returnval;
          returnval = this.JVM.JVM_ExecuteNativeMethod(data.classname, data.methodname, data.args);
          return e.target.postMessage({
            'action': 'resource',
            'resource': returnval
          });
        },
        'resolveField': function(data) {},
        'resolveString': function(data) {
          return this.JVM.JVM_ResolveStringLiteral(data.string, function(stringref) {
            return e.target.postMessage({
              'action': 'resource',
              'resource': stringref
            });
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
            return e.target.postMessage({
              'action': 'notify'
            });
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
          return console.log('#' + data.id + ' ' + data.message);
        },
        'finished': function(data) {
          var nextClinit;
          console.log('Thread #' + data.id + ' finished');
          if (e.target === this.clinitThread) {
            this.clinitThread.loaded++;
            this.clinitThread.callback.pop().call(this);
            nextClinit = this.clinitThread.waiting.pop();
            if (nextClinit) {
              return this.clinitThread.postMessage(nextClinit);
            } else {
              this.clinitThread.finished = true;
              if (this.clinitThread.init) {
                this.clinitThread.init = false;
                return this.JVM.InitializeSystem(__bind(function() {
                  return this.JVM.load(this.JVM.mainclassname);
                }, this));
              }
            }
          } else if (e.target.callback) {
            return e.target.callback();
          }
        }
      };
      return actions[e.data.action].call(this, e.data);
    };
    return RDA;
  })();
}).call(this);
