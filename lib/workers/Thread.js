(function() {
  var theThread, worker;
  worker = this;
  theThread = null;
  worker.onmessage = function(e) {
    var actions;
    actions = {
      'new': function(data) {
        theThread = new Thread(data['class'], data.entryMethod, data.id);
        if (data.locals) {
          theThread.current_frame.locals = data.locals;
        }
        return theThread.start();
      },
      'GCreport': function() {
        return theThread.reportObjects();
      },
      'notify': function() {
        if (this.callback) {
          if (this.callback.call(this.caller)) {
            this.callback = null;
            return theThread["continue"]();
          }
        } else {
          return theThread["continue"]();
        }
      },
      'resource': function(resource) {
        if (this.callback !== null) {
          if (this.callback.call(this.caller, resource)) {
            this.callback = null;
            return theThread["continue"]();
          }
        } else {
          return theThread["continue"]();
        }
      }
    };
    return actions[e.data.action].call(theThread, e.data.resource);
  };
  importScripts('../jvm.js');
  this.Thread = (function() {
    function Thread(_class, startMethod, id) {
      this.id = id;
      this.opcodes = new OpCodes(this);
      this.methodFactory = new MethodFactory(this);
      this.current_class = _class;
      this.methods = this.current_class.methods;
      this.pc = 0;
      this.jvm_stack = new Array();
      this.jvm_stack.peek = function() {
        return this[this.length - 1];
      };
      this.native_stack = new Array();
      this.native_stack.peek = function() {
        return this[this.length - 1];
      };
      this.current_frame = this.createFrame(startMethod, this.current_class);
      this;
    }
    Thread.prototype.createFrame = function(method, cls) {
      return this.methodFactory.createFrame(method, cls);
    };
    Thread.prototype.reportObjects = function() {
      var frame, index, item, objs;
      objs = new Array();
      for (index in this.jvm_stack) {
        frame = this.jvm_stack[index];
        for (index in frame.op_stack) {
          item = frame.op_stack[index];
          if (item.pointer) {
            objs.push(item);
          }
        }
        for (index in frame.locals) {
          item = frame.locals[index];
          if (item.pointer) {
            objs.push(item);
          }
        }
      }
      return worker.postMessage({
        'action': 'GCreport',
        'objectrefs': objs
      });
    };
    Thread.prototype.start = function(destroy) {
      this.pc = this.current_frame.pc;
      while (this.current_frame != null) {
        if (this.current_frame.execute(this.opcodes, this)) {
          continue;
        } else {
          return false;
        }
      }
      return this.finished();
    };
    /*
        The following methods request the JVM load specific resources.
        During reolution this Thread will be paused on the invoking opcode.
        Execution will continue when the Thread is notified by the JVM that the 
        resource has been loaded. The paused opcode will by interpretted from its 
        original state before the resolution.
      */
    /*
        Ask RDA to resolve a Class.
      */
    Thread.prototype.resolveClass = function(clsname, callback, caller) {
      var cb;
      this.callback = callback;
      this.caller = caller;
      if (typeof clsname === 'object') {
        cb = this.callback;
        this.callback.call(this.caller, clsname);
        if (this.callback === cb) {
          this.callback = null;
        }
        return;
      }
      while (typeof clsname === 'number') {
        clsname = this.current_class.constant_pool[clsname];
      }
      return worker.postMessage({
        'action': 'resolveClass',
        'name': clsname,
        'id': this.id
      });
    };
    Thread.prototype.resolveNativeClass = function(clsname, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'resolveNativeClass',
        'name': clsname,
        'id': this.id
      });
    };
    Thread.prototype.allocateNew = function(classname, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'allocateNew',
        'classname': classname,
        'id': '@id'
      });
    };
    Thread.prototype.executeNativeMethod = function(clsname, methodname, args, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'executeNativeMethod',
        'classname': clsname,
        'methodname': methodname,
        'args': args,
        'id': this.id
      });
    };
    /*
        Ask RDA to resolve a Method
      */
    Thread.prototype.resolveMethod = function(methodname, classname, descriptor, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      if (classname.real_name) {
        classname = classname.real_name;
      }
      return worker.postMessage({
        'action': 'resolveMethod',
        'name': methodname,
        'classname': classname,
        'descriptor': descriptor,
        'id': this.id
      });
    };
    /*
        Ask RDA to resolve a Field
      */
    Thread.prototype.resolveField = function(cls, name, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'resolveField',
        'name': name,
        'classname': cls.real_name,
        'id': this.id
      });
    };
    /*
        Ask RDA to resolve a String
      */
    Thread.prototype.resolveString = function(stringLiteral, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'resolveString',
        'string': stringLiteral
      });
    };
    /*
        Retrieve an Object from the Heap
      */
    Thread.prototype.getObject = function(ref, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'getObject',
        'reference': ref
      });
    };
    /*
        Pass an Object back to the RDA to be saved to the stack. 
        Not threadsafe unless this Thread is the Objects monitor.
      */
    Thread.prototype.updateObject = function(ref, newobject) {
      this.callback = null;
      return worker.postMessage({
        'action': 'updateObject',
        'reference': ref,
        'object': newobject
      });
    };
    /*
        Attempt to aquire a lock on an Object.
        If another Thread holds this lock then this Thread will wait.    
      */
    Thread.prototype.aquireLock = function(ref, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'aquireLock',
        'reference': ref
      });
    };
    /*
        Release this Threads lock on an Object
        If this Thread is not the Objects current monitor a 
        IllegalAccessException will be thrown.
      */
    Thread.prototype.releaseLock = function(ref, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'releaseLock',
        'reference': ref
      });
    };
    /*
        Allocate a new Object on the Heap
      */
    Thread.prototype.allocate = function(jobject, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'allocate',
        'object': jobject
      });
    };
    /*
        Log something nicely if the JVM is in verbose mode
      */
    Thread.prototype.log = function(message) {
      return worker.postMessage({
        'action': 'log',
        'message': message,
        'id': this.id
      });
    };
    /*
        Get a static field from the specified Class Object
        Not synchronized without keyword. 
      */
    Thread.prototype.getStatic = function(classname, fieldname, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      if (typeof classname === 'object') {
        classname = classname.real_name;
      }
      return worker.postMessage({
        'action': 'getStatic',
        'classname': classname,
        'fieldname': fieldname
      });
    };
    /*
        Set a static field in the specified Class Object
        Not synchronized without keyword. 
      */
    Thread.prototype.setStatic = function(classname, fieldname, value) {
      while (typeof classname === 'number') {
        classname = this.current_class.constant_pool[clsname];
      }
      if (classname.real_name != null) {
        classname = classname.real_name;
      }
      return worker.postMessage({
        'action': 'setStatic',
        'classname': classname,
        'fieldname': fieldname,
        'value': value
      });
    };
    /*
        Set a field in an Object.
        Not synchronized without keyword. 
      */
    Thread.prototype.setObjectField = function(objectref, fieldname, value) {
      return worker.postMessage({
        'action': 'setObjectField',
        'reference': objectref,
        'fieldname': fieldname,
        'value': value
      });
    };
    /*
        Get a field from an Object
        Not synchronized without keyword. 
      */
    Thread.prototype.getObjectField = function(objectref, fieldname, callback, caller) {
      this.callback = callback;
      this.caller = caller;
      return worker.postMessage({
        'action': 'getObjectField',
        'reference': objectref,
        'fieldname': fieldname
      });
    };
    Thread.prototype.finished = function() {
      return worker.postMessage({
        'action': 'finished',
        'id': this.id
      });
    };
    /*
      Called when waiting threads are notified by the RDA. Will continue opcode 
      loop
      */
    Thread.prototype["continue"] = function(name) {
      return this.start();
    };
    return Thread;
  })();
}).call(this);
