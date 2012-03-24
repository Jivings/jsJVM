(function() {
  /*
  The core of the Java Virtual Machine
  Defined in Global Scope.
  */
  var ClassReader, JVM_Number, OpCode, compatibility, dataTypes, jDataView, scopedJVM, type, _fn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  scopedJVM = 0;
  this.JVM = (function() {
    /*
        Initialise JVM options
      */    function JVM(options) {
      this.load = __bind(this.load, this);
      var name;
      this.VERSION_ID = "0.1";
      this.JAVA_VERSION = "1.2";
      this.settings = {
        stdin: 'stdin',
        stdout: 'stdout',
        sterr: 'stderr',
        verbosity: 'warn',
        classpath: '',
        workerpath: 'workers'
      };
      for (name in options) {
        this.settings[name] = options[name];
      }
      if (params.version) {
        this.stdout.write("JS-JVM version '" + this.VERSION_ID + "' \njava version " + this.JAVA_VERSION);
      } else if (params.help) {
        this.stdout.write(this.helpText());
      } else {
        this.RDA = new RDA();
        this.RDA.JVM = this;
        (this.classLoader = new ClassLoader(__bind(function(cls, c) {
          return this.RDA.addClass(cls.real_name, cls, c);
        }, this), __bind(function() {
          return this.InitializeSystem(__bind(function() {
            return this.load(this.mainclassname, false, this.end);
          }, this));
        }, this))).init();
        this.JNI = new InternalJNI(this);
      }
    }
    /*
      Push classes to the classloader stack. Return self for chaining or return helptext if no classname supplied
      When the RDA requests a class to be loaded, a callback method will be provided. 
      This is so that opcode execution can continue after the class is loaded.
      */
    JVM.prototype.load = function(classname, threadsWaiting, finishedLoading) {
      var cls;
      if (!finishedLoading) {
        throw 'bugfixexception';
      }
      if (this.classLoader != null) {
        if ((classname != null) && classname.length > 0) {
          cls = this.classLoader.find(classname);
          this.RDA.addClass(classname, cls, __bind(function() {
            if (threadsWaiting) {
              this.RDA.notifyAll(classname, cls);
            }
            return finishedLoading(cls);
          }, this));
        } else {
          this.stdout.write(this.helpText());
        }
      }
      return this;
    };
    JVM.prototype.loadNative = function(classname, waitingThreads) {
      var _native;
      _native = this.classLoader.findNative(classname);
      this.RDA.addNative(classname, _native);
      this.RDA.notifyAll(classname);
      return _native;
    };
    /*
      loadedNative : (classname, nativedata) =>
        if nativedata != null
          @RDA.addNative(classname, nativedata)
          # no data needs to be sent as native execution takes place on the JVM
          @RDA.notifyAll(classname)
      */
    JVM.prototype.end = function() {
      if (this.callback != null) {
        return this.callback();
      }
    };
    /*
      Retrieves messages from Workers and performs relevent actions.
      Hack 'scopedJVM' needed because this is treated as a callback method and thus 
      expected scope is completely lost 
      */
    JVM.prototype.message = function(e) {
      switch (e.data.action) {
        case 'log':
          return scopedJVM.console.println(e.data.message);
        case 'class':
          scopedJVM.RDA.addClass(e.data.classname, e.data._class);
          if (e.data.waitingThreads) {
            return scopedJVM.RDA.notifyAll(e.data.classname);
          }
          break;
        default:
          return alert(e.data);
      }
    };
    /*
      Print help text
      */
    JVM.prototype.helpText = function() {
      return "Usage: java [-options] class [args...] \n" + "          (to execute a class) \n" + "where options include:\n" + "   -version        print product version and exit\n" + "   -verbose -v     enable verbose output\n" + "   -vv             enable debug output\n" + "   -? -help        show this help message\n" + "See http://www.ivings.org.uk/hg/js-jvm for more details.";
    };
    JVM.prototype.setCallBack = function(callback) {
      this.callback = callback;
      return this;
    };
    return JVM;
  })();
  /*
    Runtime Data Area of the JVM. Stores all loaded Classes, 
    instantiated Objects and running or paused Threads.
  */
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
          var worker;
          worker = e.target;
          return this.JVM.JVM_ResolveStringLiteral(data.string, function(stringref) {
            return worker.postMessage({
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
        'allocateNew': function(data) {
          var classname;
          classname = data.classname;
          return this.JVM.JVM_ResolveClass(classname, e.target, __bind(function(cls) {
            var obj, ref;
            obj = new JVM_Object(cls);
            ref = this.heap.allocate(obj);
            return e.target.postMessage({
              'action': 'resource',
              'resource': ref
            });
          }, this));
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
  /*
    A stack frame contains the state of one method invocation. When a method is   
    invoked a new frame is pushed onto the thread's stack.
  */
  this.Frame = (function() {
    function Frame(method, cls) {
      this.cls = cls;
      this.method_stack = method.attributes.Code.code;
      this.op_stack = new Array();
      this.op_stack.peek = function() {
        return this[this.length - 1];
      };
      this.op_stack.push = function(word) {
        if (word === void 0) {
          throw "NullStackException";
        } else if (word instanceof JVM_Object) {
          throw "ObjectOnStackException";
        }
        this[this.length] = word;
        return true;
      };
      this.constant_pool = this.cls.constant_pool;
      this.resolveSelf(this.cls);
      this.name = method.name;
      this.locals = {};
      this.pc = 0;
      this;
    }
    /*
        Execute the next opcode in the method_stack
        If the opcode returns false then execution will pause
      */
    /*execute : (opcodes) ->
      op = @method_stack[@pc]
          
      if(!opcodes[op].do(@)) then return false
      return yes
    */
    Frame.prototype.execute = function(opcodes, t) {
      var op, result;
      op = this.method_stack[this.pc];
      t.log(this.cls.real_name + '-' + this.name + '\t\t' + op + '\t\t' + opcodes[op].description);
      result = opcodes[op]["do"](this);
      ++this.pc;
      return result;
    };
    Frame.prototype.resolveSelf = function(cls) {
      return this.constant_pool[cls.this_class] = cls;
    };
    /*   
    resolveMethod : (cls, name) ->
      cls_ref = @constant_pool[cls]
      method_ref = @constant_pool[name]
    */
    JVM.prototype.JVM_InternedStrings = {};
    /* 
    Additional JVM functions exported from the main VM.
    Add support for native methods interacting with the VM.
    */
    /*
        JavaScript doesn't define an assert function so here's our own.
      */
    JVM.prototype.assert = function(condition, message) {
      if (!condition) {
        throw "AssertException: " + message;
      }
    };
    JVM.prototype.RegisterNatives = function(env, jclass, methods) {
      var JVM_MethodName, name;
      for (name in methods) {
        JVM_MethodName = methods[name].name;
        jclass[name] = JVM.prototype[JVM_MethodName];
      }
      return true;
    };
    JVM.prototype.InitializeSystem = function(initDone) {
      var cls, system;
      system = this.RDA.method_area['native/java/lang/System'];
      cls = this.RDA.method_area['java/lang/System'];
      this.assert(system !== null, "System not loaded before InitializeSystemClass");
      return this.JVM_ResolveClass('javascript/io/JavaScriptPrintStream', __bind(function(outputStream) {
        var method, method_desc, method_id;
        method_id = '<init>';
        method_desc = '(Ljava/lang/String;)V';
        method = this.JVM_ResolveMethod(outputStream, method_id, method_desc);
        return this.JVM_ResolveStringLiteral('terminal', __bind(function(str) {
          return this.JVM_NewObject(outputStream, method, [str], __bind(function(outputStreamObj) {
            /*
                      # JavaScript outputStream needs to be wrapped by a printstream
                      @JVM_ResolveClass('java/io/PrintStream', (printStream) =>
                        method_desc = '(Ljava/io/OutputStream;)V'
                        method = @JVM_ResolveMethod(printStream, method_id, method_desc)
                        @JVM_NewObject(printStream, method, [outputStreamObj], (printStreamObj) =>
                          
                          # set the printStream to out in System
                          @JVM_ExecuteNativeMethod('native/java/lang/System', 'setOut0', [cls, printStreamObj])
                          initDone()
                          )
                      )
                      */            this.JVM_ExecuteNativeMethod('native/java/lang/System', 'setOut0', [cls, outputStreamObj]);
            return initDone();
          }, this));
        }, this));
      }, this));
    };
    /*  
    JVM::InitializeSystemClass = () ->
      @assert( (system = @RDA.method_area['java/lang/System']) isnt null, 
        "System not loaded before InitializeSystemClass")
      #@RDA.createThread('java/lang/System', @JVM_ResolveMethod(system, 'initializeSystemClass', '()V'))
    
      # create file input stream
      fileDescriptorCls = @JVM_ResolveClass('java/io/FileDescriptor')
          
      method_id = '<init>'
      method_desc = '(Ljava/io/FileDescriptor;)V'
      fileOutputStreamCls =  @JVM_ResolveClass('java/io/FileOutputStream')
      bufferedOutputStreamCls =  @JVM_ResolveClass('java/io/BufferedOutputStream')
      printStreamCls =  @JVM_ResolveClass('java/io/PrintStream')
       
       
      method = @JVM_ResolveMethod(fileOutputStreamCls, method_id, method_desc)
      
      fdIn = fileDescriptorCls.fields.in
      
      fileOutputStreamObj = @RDA.heap.allocate(@JVM_NewObject(fileOutputStreamCls, method, [fdIn]))
      
      method_id = '<init>'
      method_desc = '(Ljava/io/OutputStream;I)V'
      method = @JVM_ResolveMethod(bufferedOutputStreamCls, method_id, method_desc)
      # create buffered output stream obj
      bufferedOutputStreamObj = @RDA.heap.allocate(@JVM_NewObject(bufferedOutputStreamCls, method, [fileOutputStreamObj, new CONSTANT_integer(128)] ))
      # create printstream
      method_id = '<init>'
      method_desc = '(Ljava/io/OutputStream;Z)V'
      method = @JVM_ResolveMethod(printStreamCls, method_id, method_desc)
      printStreamObj = @RDA.heap.allocate(@JVM_NewObject(printStreamCls, method, [bufferedOutputStreamObj, new CONSTANT_boolean(1)]))
      # call setOut0
    */
    JVM.prototype.JVM_IHashCode = function() {
      return 1;
    };
    JVM.prototype.JVM_MonitorWait = function() {
      var object;
      object = this.locals[0];
      throw 'NotYetImplementedException';
    };
    true;
    JVM.prototype.JVM_MonitorNotify = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_MonitorNotifyAll = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_Clone = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_InternString = function(env, jstring) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_CurrentTimeMillis = function(env, ignoredJClass) {
      return new CONSTANT_long(new Date().getTime());
    };
    JVM.prototype.JVM_NanoTime = function(env, ignoredJClass) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_ArrayCopy = function(env, srcObj, srcPos, dstObj, destPos, length) {
      var arr, ch, dest, index, src;
      src = env.JVM_FromHeap(srcObj);
      arr = src.slice(srcPos.val, srcPos.val + length.val);
      dest = env.JVM_FromHeap(destObj);
      destPos = dstPos.val;
      for (index in arr) {
        ch = arr[index];
        dest[new Number(index) + destPos] = ch;
      }
      return true;
    };
    JVM.prototype.JVM_InitProperties = function(env, jobject) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_OnExit = function(func) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.GetStaticFieldID = function(cls, fieldname, returnType) {
      return fieldname;
    };
    JVM.prototype.SetStaticObjectField = function(cls, fieldname, stream) {
      return cls.fields[fieldname] = stream;
    };
    JVM.prototype.GetObjectField = function(objectReference, fieldname) {
      var field, obj;
      obj = this.RDA.heap[objectReference.pointer];
      field = obj[fieldname];
      return field;
    };
    JVM.prototype.JVM_GetObjectClass = function(objectReference, callback) {
      var obj;
      if (!callback) {
        throw 'NoFixError';
      }
      obj = this.JVM_FromHeap(objectReference);
      if (this.JVM_FromHeap(obj.clsObject) === null) {
        return this.JVM_ResolveClass('java/lang/Class', __bind(function(cls) {
          var constructor;
          constructor = this.JVM_ResolveMethod(cls, '<init>', '()V');
          obj.clsObject = this.JVM_NewObject(cls, constructor, []);
          return callback(this.RDA.heap.allocate(obj.clsObject));
        }, this));
      }
    };
    JVM.prototype.JVM_Exit = function(code) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_Halt = function(code) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GC = function() {
      throw 'NotYetImplementedException';
    };
    /*
       Returns the number of realtime milliseconds that have elapsed since the
       least-recently-inspected heap object was last inspected by the garbage
       collector.
    
       For simple stop-the-world collectors this value is just the time
       since the most recent collection.  For generational collectors it is the
       time since the oldest generation was most recently collected.  Other
       collectors are free to return a pessimistic estimate of the elapsed time, or
       simply the time since the last full collection was performed.
    
       Note that in the presence of reference objects, a given object that is no
       longer strongly reachable may have to be inspected multiple times before it
       can be reclaimed.
      */
    JVM.prototype.JVM_MaxObjectInspectionAge = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_TraceInstructions = function(bool) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_TraceMethodCalls = function(bool) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_TotalMemory = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_FreeMemory = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_MaxMemory = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_ActiveProcessorCount = function() {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_LoadLibrary = function(name) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_UnloadLibrary = function(handle) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_FindLibraryEntry = function(handle, name) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_IsSupportedJNIVersion = function(version) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_IsNaN = function(double) {
      return isNaN(double);
    };
    JVM.prototype.JVM_FillInStackTrace = function(env, throwable) {
      return console.log('filling in stacktrace!');
    };
    JVM.prototype.JVM_PrintStackTrace = function(env, throwable, printable) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetStackTraceDepth = function(env, throwable) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetStackTraceElement = function(env, throwable, index) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_StartThread = function(env, thread) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_StopThread = function(env, thread, exception) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_IsThreadAlive = function(env, thread) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_SuspendThread = function(env, thread) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_ResumeThread = function(env, thread) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_SetThreadPriority = function(env, thread, prio) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_Yield = function(env, threadClass) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_Sleep = function(env, threadClass, millis) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_CurrentThread = function(env, threadClass) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_CountStackFrames = function(env, thread) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_Interrupt = function(env, thread) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_IsInterrupted = function(env, thread, clearInterrupted) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_HoldsLock = function(env, threadClass, obj) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_DumpAllStacks = function(env, unused) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetAllThreads = function(env, dummy) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_DumpThreads = function(env, threadClass, threads) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_CurrentLoadedClass = function(env) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_CurrentClassLoader = function(env) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetClassContext = function(env) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_ClassDepth = function(env, name) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_ClassLoaderDepth = function(env) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetSystemPackage = function(env, name) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetSystemPackages = function(env) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_AllocateNewObject = function(env, obj, currClass, initClass) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_AllocateNewArray = function(env, obj, currClass, length) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_LatestUserDefinedLoader = function(env) {};
    JVM.prototype.JVM_GetArrayLength = function(env, arr) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetArrayElement = function(env, arr, index) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetPrimitiveArrayElement = function(env, arr, index, wCode) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_SetArrayElement = function(env, arr, index, val) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_SetPrimitiveArrayElement = function(env, arr, index, v, vCode) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_NewArray = function(env, eltClass, length) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_NewMultiArray = function(env, eltClass, dim) {
      throw 'NotYetImplementedException';
    };
    /*
        java.lang.Class and java.lang.ClassLoader
       
        Returns the class in which the code invoking the native method
        belongs.
       
        Note that in JDK 1.1, native methods did not create a frame.
        In 1.2, they do. Therefore native methods like Class.forName
        can no longer look at the current frame for the caller class.
      */
    JVM.prototype.JVM_GetCallerClass = function(env, n) {
      throw 'NotYetImplementedException';
    };
    /*
       Find primitive classes
        utf: class name
      */
    JVM.prototype.JVM_FindPrimitiveClass = function(env, utf) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_ResolveClass = function(clsname, thread, resolved) {
      var cls;
      if (!resolved) {
        resolved = thread;
      }
      if (thread) {
        this.RDA.waiting[clsname] = thread;
      }
      if (clsname instanceof CONSTANT_Class || (clsname.magic_number != null)) {
        this.RDA.notifyAll(clsname.real_name, clsname);
      }
      if (this.RDA.method_area[clsname] === void 0) {
        console.log('Resolve Class ' + clsname);
        return this.load(clsname, true, resolved);
      } else {
        cls = this.RDA.method_area[clsname];
        return resolved(cls);
      }
    };
    JVM.prototype.JVM_ResolveNativeClass = function(nativeName, thread) {
      if (thread) {
        this.RDA.waiting[nativeName] = thread;
      }
      if (this.RDA.method_area[nativeName] === void 0) {
        this.loadNative(nativeName);
      }
      return true;
    };
    JVM.prototype.JVM_ExecuteNativeMethod = function(classname, methodname, args) {
      var nativeCls, nmethod, returnval;
      nativeCls = this.RDA.method_area[classname];
      nmethod = nativeCls[methodname];
      if (args) {
        args.unshift(this);
      } else {
        args = new Array();
        args.push(this);
      }
      returnval = nmethod.apply(nativeCls, args);
      return returnval;
    };
    JVM.prototype.JVM_ResolveStringLiteral = function(literal, callback) {
      var enc;
      enc = 'sun.jnu.encoding';
      return this.JVM_ResolveClass('java/lang/String', __bind(function(cls) {
        var charArray, index, method, method_desc, method_id;
        method_id = '<init>';
        method_desc = '()V';
        method = this.JVM_ResolveMethod(cls, method_id, method_desc);
        if (!this.JVM_InternedStrings[literal]) {
          console.log('Interning a string ("' + literal + '")');
          charArray = new Array();
          for (index in literal) {
            charArray[index] = literal[index];
          }
          return this.JVM_NewObject(cls, method, [], __bind(function(stringobj) {
            this.RDA.heap[stringobj.pointer].count = new CONSTANT_integer(literal.length);
            this.RDA.heap[this.RDA.heap[stringobj.pointer].value.pointer] = charArray;
            console.log('Done interning');
            this.JVM_InternedStrings[literal] = stringobj;
            return callback(stringobj);
          }, this));
        } else {
          return callback(this.JVM_InternedStrings[literal]);
        }
      }, this));
    };
    JVM.prototype.JVM_StringLiteralToBytes = function(literal) {
      var ch, i, re, st;
      i = 0;
      re = [];
      while (i++ < literal.length) {
        ch = literal.charCodeAt(i);
        st = [];
        while (true) {
          st.push(ch & 0xFF);
          ch = ch >> 8;
          if (!ch) {
            break;
          }
        }
        re = re.concat(st.reverse());
      }
      return re;
    };
    JVM.prototype.JVM_InvokeMethod = function(object, method, args) {
      var arg_num, cls, t;
      cls = this.JVM_FromHeap(object).cls;
      t = new Thread(cls, this.RDA, method);
      t.current_frame.locals[0] = object;
      arg_num = args.length;
      while (arg_num > 0) {
        t.current_frame.locals[arg_num] = args[arg_num - 1];
        arg_num--;
      }
      return t.start();
    };
    JVM.prototype.JVM_NewObjectByReference = function(clsname, constructorname, descriptor, args, thread, callback) {
      if (!callback) {
        throw 'NoFixException';
      }
      return this.JVM_ResolveClass(clsname, thread, __bind(function(cls) {
        var method;
        method = this.JVM_ResolveMethod(cls, constructorname, descriptor);
        return callback(this.JVM_NewObject(cls, method, args));
      }, this));
    };
    JVM.prototype.JVM_NewObject = function(cls, constructor, args, objectCreated) {
      var arg_num, locals, obj, objref;
      if (!objectCreated) {
        throw 'bugfix';
      }
      obj = new JVM_Object(cls);
      objref = this.RDA.heap.allocate(obj);
      locals = new Array();
      locals[0] = objref;
      arg_num = args.length;
      while (arg_num > 0) {
        locals[arg_num] = args[arg_num - 1];
        arg_num--;
      }
      return this.RDA.createThread(cls.real_name, constructor, locals, function() {
        return objectCreated(objref);
      });
    };
    JVM.prototype.JVM_ResolveNativeMethod = function(cls, name, type) {
      throw 'NotYetImplementedException';
    };
    /*
      JVM::JVM_ResolveField = (obj, name) ->
        loop
          if obj.fields[name]
            return cls.fields[name]
          obj = cls.get_super()
          assert(cls, 'FieldResolutionException')
      */
    JVM.prototype.JVM_ResolveMethod = function(cls, name, type) {
      var arg, args, descriptor, endarg, i, index, method, nargs;
      if (cls === null) {
        throw 'NullClassException';
      }
      if (cls.methods[name + type] != null) {
        return cls.methods[name + type];
      }
      while (true) {
        for (index in cls.methods) {
          method = cls.methods[index];
          descriptor = cls.constant_pool[method.descriptor_index];
          if (method.name === name && descriptor === type) {
            method.descriptor = descriptor;
            args = descriptor.substring(descriptor.indexOf('(') + 1, descriptor.indexOf(')'));
            method.args = new Array();
            nargs = 0;
            i = 0;
            while (i < args.length) {
              if (args[i] === 'L') {
                arg = args.substring(i, args.indexOf(';', i));
                i = args.indexOf(';', i);
                method.args.push(arg);
              } else if (args[i] === '[') {
                endarg = args.substring(i).search('[B-Z]');
                method.args.push(args.substring(i, endarg + i + 1));
                i += endarg;
              } else {
                method.args.push(args[i]);
              }
              ++nargs;
              ++i;
            }
            method.returntype = descriptor.substring(descriptor.indexOf(')') + 1);
            method.nargs = nargs;
            cls.methods[method.name + descriptor] = method;
            method['belongsTo'] = cls;
            return method;
          }
        }
        if (name === '<clinit>') {
          return false;
        }
        cls = cls.get_super();
        this.assert(cls, 'MethodResolutionException');
      }
      return false;
    };
    JVM.prototype.JVM_InvokeStaticMethod = function(clsname, method_name, descriptor, args, thread) {
      return this.JVM_ResolveClass(clsname, thread, __bind(function(cls) {
        var arg_num, method, t;
        method = this.JVM_ResolveMethod(cls, method_name, descriptor);
        t = new Thread(cls, this.RDA, method);
        arg_num = args.length - 1;
        while (arg_num > -1) {
          t.current_frame.locals[arg_num] = args[arg_num];
          arg_num--;
        }
        return t.start();
      }, this));
    };
    JVM.prototype.JVM_FindClassFromBootLoader = function(env, name) {
      if ((typeof classname !== "undefined" && classname !== null) && classname.length > 0) {
        this.classLoader.postMessage({
          'action': 'find',
          'param': classname
        });
        return this.classLoader.postMessage({
          'action': 'start'
        });
      } else {
        return this.stdout.write(this.helpText());
      }
    };
    JVM.prototype.JVM_FindClassFromClassLoader = function(env, name, init, loader, throwError) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_FindClassFromClass = function(env, name, init, from) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_FindLoadedClass = function(env, loader, name) {
      return this.RDA.method_area[name];
    };
    JVM.prototype.JVM_DefineClass = function(env, name, loader, buf, len, pd) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_DefineClassWithSource = function(env, name, loader, buf, len, pd, source) {
      throw 'NotYetImplementedException';
    };
    /*
        Reflection Support Functions
      */
    JVM.prototype.JVM_GetClassName = function(env, cls) {
      cls = env.JVM_FromHeap(cls.object).cls;
      return env.JVM_ResolveStringLiteral(cls.real_name);
    };
    JVM.prototype.JVM_GetClassInterfaces = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetClassLoader = function(env, cls) {
      return new JVM_Reference(0);
    };
    JVM.prototype.JVM_DesiredAssertionStatus = function(cls) {
      return false;
    };
    JVM.prototype.JVM_IsInterface = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetClassSigners = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_SetClassSigners = function(env, cls, signers) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetProtectionDomain = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_SetProtectionDomain = function(env, cls, protection_domain) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_IsArrayClass = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_IsPrimitiveClass = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetComponentType = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetClassModifiers = function(env, cls) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetDeclaredClasses = function(env, ofClass) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_GetDeclaringClass = function(env, ofClass) {
      throw 'NotYetImplementedException';
    };
    JVM.prototype.JVM_FromHeap = function(reference) {
      return this.RDA.heap[reference.pointer];
    };
    return Frame;
  })();
  this.Console = (function() {
    function Console(stdout, stderr, verbosity) {
      this.stdout = stdout;
      this.stderr = stderr;
      if (verbosity == null) {
        verbosity = 'warn';
      }
      this.tags = {
        1: 'Asciz',
        3: 'Integer',
        4: 'Float',
        5: 'Long',
        6: 'Double',
        7: 'Class',
        8: 'String Reference',
        9: 'Field Reference',
        10: 'Method',
        11: 'Interface Method',
        12: 'NameAndType'
      };
      this.verbosity = this.verbosity_level[verbosity];
      this.progress = 0;
    }
    Console.prototype.println = function(string, level) {
      return this.print('<p>' + string + '</p>', level);
    };
    Console.prototype.print = function(string, level) {
      if (level == null) {
        level = 0;
      }
      if (level <= this.verbosity) {
        return this.stdout.write(string);
      }
    };
    Console.prototype.writeConstant = function(index, tag, value, level) {
      return this.print("<p class='constant'># " + index + " " + this.tags[tag] + " <span class='value'>" + value + "</span></p>", level);
    };
    Console.prototype.verbosity_level = {
      warn: 0,
      info: 1,
      debug: 2
    };
    return Console;
  })();
  this.MethodFactory = (function() {
    function MethodFactory(thread) {
      this.thread = thread;
    }
    MethodFactory.prototype.createFrame = function(method, cls) {
      var frame;
      if (method.access_flags & 0x0100) {
        frame = new NativeFrame(method, cls, null, this.thread);
        this.thread.current_frame = frame;
        this.thread.native_stack.push(frame);
        return frame;
      } else {
        frame = new Frame(method, cls);
        this.thread.current_frame = frame;
        this.thread.jvm_stack.push(frame);
        return frame;
      }
    };
    return MethodFactory;
  })();
  this.JVM_Object = (function() {
    function JVM_Object(cls) {
      var field, fld, supercls;
      this.cls = cls;
      supercls = this.cls.constant_pool[this.cls.super_class];
      if (supercls !== void 0) {
        this.__proto__ = new JVM_Object(supercls);
      }
      this.clsObject = new JVM_Reference(0);
      for (field in this.cls.fields) {
        fld = this.cls.fields[field];
        this[field] = fld;
      }
    }
    JVM_Object.prototype.monitor = {
      aquireLock: function(thread) {
        if (this.owner === thread) {
          this.count++;
        } else if (this.owner !== null) {
          this.waiting.push(thread);
          return false;
        } else {
          this.owner = thread;
          this.count++;
        }
        return true;
      },
      releaseLock: function(thread) {
        var _i, _len, _ref;
        if (this.owner !== thread) {
          return false;
        }
        if (--this.count === 0) {
          this.owner = null;
        }
        _ref = this.waiting;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          thread = _ref[_i];
          this.notify(thread);
        }
        this.waiting.length = 0;
        return true;
      },
      notify: function(thread) {
        return this.RDA.lockAquired(thread);
      },
      owner: null,
      count: 0,
      waiting: new Array()
    };
    return JVM_Object;
  })();
  ({
    compareTo: function(jvmObject) {
      if (this.cls.real_name === jvmObject.cls.real_name) {
        return true;
      } else {
        try {
          return compareTo.__super__.constructor.apply(this, arguments).compareTo(jvmObject);
        } catch (err) {
          return false;
        }
      }
    }
  });
  this.JVM_Reference = (function() {
    function JVM_Reference(pointer) {
      this.pointer = pointer;
    }
    JVM_Reference.prototype.toString = function() {
      return this.pointer;
    };
    return JVM_Reference;
  })();
  JVM_Number = (function() {
    function JVM_Number(val) {
      this.val = val;
    }
    JVM_Number.prototype.valueOf = function() {
      return this.val;
    };
    return JVM_Number;
  })();
  this.CONSTANT_Array = (function() {
    __extends(CONSTANT_Array, Array);
    function CONSTANT_Array(length, type) {
      this.length = length;
      this.type = type;
      CONSTANT_Array.__super__.constructor.call(this, this.length);
    }
    return CONSTANT_Array;
  })();
  this.CONSTANT_Object = (function() {
    function CONSTANT_Object(classname) {
      this.classname = classname;
      this.value = null;
    }
    return CONSTANT_Object;
  })();
  this.CONSTANT_integer = (function() {
    __extends(CONSTANT_integer, JVM_Number);
    function CONSTANT_integer(val, sign) {
      var next;
      if (val == null) {
        val = 0;
      }
      if (sign == null) {
        sign = false;
      }
      if (sign) {
        if ((val & 0x8000) !== 0) {
          next = (~val) + 1 & 0xffff;
          val = next * -1;
        }
      }
      if (isNaN(val)) {
        throw 'UnexpectedNaN';
      }
      CONSTANT_integer.__super__.constructor.call(this, val);
    }
    return CONSTANT_integer;
  })();
  this.CONSTANT_int = (function() {
    __extends(CONSTANT_int, CONSTANT_integer);
    function CONSTANT_int(val, sign) {
      if (val == null) {
        val = 0;
      }
      if (sign == null) {
        sign = false;
      }
      CONSTANT_int.__super__.constructor.call(this, val, sign);
    }
    return CONSTANT_int;
  })();
  this.CONSTANT_float = (function() {
    __extends(CONSTANT_float, JVM_Number);
    function CONSTANT_float(val) {
      if (val == null) {
        val = 0.0;
      }
      CONSTANT_float.__super__.constructor.call(this, val);
    }
    return CONSTANT_float;
  })();
  this.CONSTANT_long = (function() {
    __extends(CONSTANT_long, JVM_Number);
    function CONSTANT_long(val) {
      if (val == null) {
        val = 0;
      }
      CONSTANT_long.__super__.constructor.call(this, val);
    }
    return CONSTANT_long;
  })();
  this.CONSTANT_double = (function() {
    __extends(CONSTANT_double, JVM_Number);
    function CONSTANT_double(val) {
      if (val == null) {
        val = 0.0;
      }
      CONSTANT_double.__super__.constructor.call(this, val);
    }
    return CONSTANT_double;
  })();
  this.CONSTANT_char = (function() {
    function CONSTANT_char(value) {
      this.value = value != null ? value : '\u0000';
      this.value = this.value.charCodeAt();
    }
    return CONSTANT_char;
  })();
  this.CONSTANT_short = (function() {
    __extends(CONSTANT_short, JVM_Number);
    function CONSTANT_short(val) {
      if (val == null) {
        val = 0;
      }
      CONSTANT_short.__super__.constructor.call(this, val);
    }
    return CONSTANT_short;
  })();
  this.CONSTANT_byte = (function() {
    function CONSTANT_byte(value, sign) {
      var next;
      this.value = value != null ? value : 0;
      if (sign == null) {
        sign = false;
      }
      if (sign) {
        if ((this.value & 0x80) !== 0) {
          next = (~this.value) + 1 & 0xff;
          this.value = next * -1;
        }
      }
    }
    return CONSTANT_byte;
  })();
  this.CONSTANT_boolean = (function() {
    function CONSTANT_boolean(value) {
      this.value = value != null ? value : 0;
    }
    return CONSTANT_boolean;
  })();
  this.CONSTANT_String = (function() {
    __extends(CONSTANT_String, String);
    function CONSTANT_String(value) {
      this.value = value != null ? value : '';
    }
    return CONSTANT_String;
  })();
  this.JVM_RECOGNIZED_METHOD_MODIFIERS = {
    JVM_ACC_PUBLIC: 0x0001,
    JVM_ACC_PRIVATE: 0x0002,
    JVM_ACC_PROTECTED: 0x0004,
    JVM_ACC_STATIC: 0x0008,
    JVM_ACC_FINAL: 0x0010,
    JVM_ACC_SYNCHRONIZED: 0x0020,
    JVM_ACC_BRIDGE: 0,
    JVM_ACC_VARARGS: 0,
    JVM_ACC_NATIVE: 0x0100,
    JVM_ACC_ABSTRACT: 0x0400,
    JVM_ACC_STRICT: 0,
    JVM_ACC_SYNTHETIC: 0
  };
  this.JVM_RECOGNIZED_CLASS_MODIFIERS = {
    JVM_ACC_PUBLIC: 0x0001,
    JVM_ACC_FINAL: 0x0010,
    JVM_ACC_SUPER: 0x0020,
    JVM_ACC_INTERFACE: 0x0200,
    JVM_ACC_ABSTRACT: 0x0400
  };
  /*                                        JVM_ACC_ANNOTATION | \
                                          JVM_ACC_ENUM | \
                                          JVM_ACC_SYNTHETIC)
                                          */
  this.JVM_RECOGNIZED_FIELD_MODIFIERS = {
    JVM_ACC_PUBLIC: 0x0000,
    JVM_ACC_PRIVATE: 0x0000,
    JVM_ACC_PROTECTED: 0x0000,
    JVM_ACC_STATIC: 0x0000,
    JVM_ACC_FINAL: 0x0000,
    JVM_ACC_VOLATILE: 0x0000,
    JVM_ACC_TRANSIENT: 0x0000,
    JVM_ACC_ENUM: 0x0000,
    JVM_ACC_SYNTHETIC: 0x0000
  };
  this.FIELD_DESCRIPTORS = {
    'B': 'CONSTANT_byte',
    'C': 'CONSTANT_char',
    'D': 'CONSTANT_double',
    'F': 'CONSTANT_float',
    'I': 'CONSTANT_integer',
    'J': 'CONSTANT_long',
    'L': 'CONSTANT_Class',
    'S': 'CONSTANT_short',
    'Z': 'CONSTANT_boolean',
    '[': 'CONSTANT_Array'
  };
  /*
    Used by the ClassLoader
  */
  this.CONSTANT_Methodref_info = (function() {
    function CONSTANT_Methodref_info(class_index, name_and_type_index) {
      this.class_index = class_index;
      this.name_and_type_index = name_and_type_index;
    }
    return CONSTANT_Methodref_info;
  })();
  this.CONSTANT_InterfaceMethodref_info = (function() {
    function CONSTANT_InterfaceMethodref_info(class_index, name_and_type_index) {
      this.class_index = class_index;
      this.name_and_type_index = name_and_type_index;
    }
    return CONSTANT_InterfaceMethodref_info;
  })();
  this.CONSTANT_Fieldref_info = (function() {
    function CONSTANT_Fieldref_info(class_index, name_and_type_index) {
      this.class_index = class_index;
      this.name_and_type_index = name_and_type_index;
    }
    return CONSTANT_Fieldref_info;
  })();
  this.CONSTANT_NameAndType_info = (function() {
    function CONSTANT_NameAndType_info(name_index, descriptor_index) {
      this.name_index = name_index;
      this.descriptor_index = descriptor_index;
    }
    return CONSTANT_NameAndType_info;
  })();
  this.CONSTANT_Stringref = (function() {
    function CONSTANT_Stringref(string_index) {
      this.string_index = string_index;
    }
    return CONSTANT_Stringref;
  })();
  this.NativeFrame = (function() {
    function NativeFrame(method, cls, env, thread) {
      this.method = method;
      this.cls = cls;
      this.env = env;
      this.thread = thread;
      this.op_stack = new Array();
      this.resolved = true;
      this.clsname = 'native/' + this.cls.real_name;
      this.pc = 0;
      this.returntype = this.method.returntype;
      this.name = this.method.name;
      this.locals = {};
    }
    NativeFrame.prototype.execute = function(opcodes) {
      this.thread.log(this.clsname + '-' + this.name);
      this.thread.resolveNativeClass(this.clsname, function() {
        var arg_num, args, i;
        if (this.locals[0]) {
          this.method['object'] = this.locals[0];
        }
        args = new Array();
        arg_num = this.method.args.length;
        if (this.method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC) {
          i = 0;
          while (i < arg_num) {
            args.push(this.locals[i++]);
          }
        } else {
          i = 1;
          while (i < arg_num + 1) {
            args.push(this.locals[i++]);
          }
        }
        this.thread.executeNativeMethod(this.clsname, this.name, args, function(returnval) {
          if (returnval != null) {
            this.op_stack.push(returnval);
          }
          switch (this.returntype.charAt(0)) {
            case 'B':
            case 'C':
            case 'I':
            case 'Z':
            case 'S':
              return opcodes[172]["do"](this);
            case 'D':
              this.op_stack.push(returnval);
              return opcodes[175]["do"](this);
            case 'F':
              return opcodes[174]["do"](this);
            case 'J':
              this.op_stack.push(returnval);
              return opcodes[173]["do"](this);
            case 'L':
            case '[':
              return opcodes[176]["do"](this);
            default:
              return opcodes[177]["do"](this);
          }
        }, this);
        return false;
      }, this);
      return false;
      /*
          @thread.resolveNativeClass(@clsname, (nativeCls) -> 
            nativeCls['thread'] = @thread
            
            if @locals[0]
              nativeCls['object'] = @locals[0]
              nMethod = nativeCls[@method.name]
          
              args = new Array()
              args.push(@env)
              args.push(nativeCls)
          
              arg_num = @method.args.length
              # store args in locals; arg1 = locals[0] etc
              # static invocation
              if @method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC
                while arg_num > 0
                  args.push(@locals[--arg_num])
              
              else
                while arg_num > 0
                  args.push(@locals[arg_num--])
                # put objectref (this) in new method local 0
                args.push(@locals[0])
              
              # Exectute the Native Method TODO, appropriate arguments
              returnval = nMethod.apply(nativeCls, args)
              
              
          
          , @)
          
          */
    };
    return NativeFrame;
  })();
  this.OpCodes = (function() {
    function OpCodes(thread) {
      this[0] = new OpCode('nop', 'Does nothing', function(frame) {
        return true;
      });
      this[1] = new OpCode('aconst_null', 'Push null object reference', function(frame) {
        return frame.op_stack.push(new JVM_Reference(0));
      });
      this[2] = new OpCode('iconst_m1', 'Push int constant -1', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(-1));
      });
      this[3] = new OpCode('iconst_0', 'Push int constant 0', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(0));
      });
      this[4] = new OpCode('iconst_1', 'Push int constant 1', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(1));
      });
      this[5] = new OpCode('iconst_2', 'Push int constant 2', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(2));
      });
      this[6] = new OpCode('iconst_3', 'Push int constant 3', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(3));
      });
      this[7] = new OpCode('iconst_4', 'Push int constant 4', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(4));
      });
      this[8] = new OpCode('iconst_5', 'Pushes int constant 5 to the frame.op_stack.', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(5));
      });
      this[9] = new OpCode('lconst_0', 'Push long constant 0', function(frame) {
        frame.op_stack.push(new CONSTANT_long(0));
        return frame.op_stack.push(new CONSTANT_long(0));
      });
      this[10] = new OpCode('lconst_1', 'Push long constant 1', function(frame) {
        frame.op_stack.push(new CONSTANT_long(1));
        return frame.op_stack.push(new CONSTANT_long(1));
      });
      this[11] = new OpCode('fconst_0', 'Push float 0', function(frame) {
        return frame.op_stack.push(new CONSTANT_float());
      });
      this[12] = new OpCode('fconst_1', 'Push float 1', function(frame) {
        return frame.op_stack.push(new CONSTANT_float(1.0));
      });
      this[13] = new OpCode('fconst_2', 'Push float 2', function(frame) {
        return frame.op_stack.push(new CONSTANT_float(2.0));
      });
      this[14] = new OpCode('dconst_0', 'Push double 0', function(frame) {
        frame.op_stack.push(new CONSTANT_double(0.0));
        return frame.op_stack.push(new CONSTANT_double(0.0));
      });
      this[15] = new OpCode('dconst_1', 'Push double 1', function(frame) {
        frame.op_stack.push(new CONSTANT_double(1.0));
        return frame.op_stack.push(new CONSTANT_double(1.0));
      });
      this[16] = new OpCode('bipush', 'Push 8 bit signed integer', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(this.getIndexByte(1, frame, thread), false));
      });
      this[17] = new OpCode('sipush', 'Push short', function(frame) {
        var byte1, byte2, short;
        byte1 = this.getIndexByte(1, frame, thread);
        byte2 = this.getIndexByte(1, frame, thread);
        short = (byte1 << 8) | byte2;
        return frame.op_stack.push(new CONSTANT_short(short));
      });
      this[18] = new OpCode('ldc', 'Push item from constant pool', function(frame) {
        var item;
        item = this.getIndexByte(1, frame, thread);
        while (typeof (item = this.fromCP(item, thread)) === 'number') {
          continue;
        }
        if (item.string_index) {
          thread.resolveString(this.fromCP(item.string_index, thread), function(string) {
            return frame.op_stack.push(string);
          }, this);
          return false;
        }
        if (item === void 0) {
          throw 'JVM_Error: Undefined item on stack';
        }
        if (item instanceof Object) {
          thread.allocate(item, function(item) {
            return frame.op_stack.push(item);
          });
          return false;
        }
        return frame.op_stack.push(item);
      });
      this[19] = new OpCode('ldc_w', 'Push item from constant pool (wide index)', function(frame) {
        var item;
        item = this.constructIndex(frame, thread);
        while (typeof (item = this.fromCP(item, thread)) === 'number') {
          continue;
        }
        if (item instanceof JVM_Object) {
          thread.allocate(item, function(item) {
            return frame.op_stack.push(item);
          });
          return false;
        }
        return frame.op_stack.push(item);
      });
      this[20] = new OpCode('ldc2_w', 'Push long or double from constant pool (wide index)', function(frame) {
        var index, item;
        index = this.constructIndex(frame, thread);
        item = this.fromCP(index, thread);
        frame.op_stack.push(item);
        return frame.op_stack.push(item);
      });
      this[21] = new OpCode('iload', 'Load int from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[22] = new OpCode('lload', 'Load long from local variable', function(frame) {
        frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[23] = new OpCode('fload', 'Load float from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[24] = new OpCode('dload', 'Load double from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[25] = new OpCode('aload', 'Load reference from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[26] = new OpCode('iload_0', 'Load int from local variable 0', function(frame) {
        return frame.op_stack.push(frame.locals[0]);
      });
      this[27] = new OpCode('iload_1', 'Load int from local variable 1', function(frame) {
        return frame.op_stack.push(frame.locals[1]);
      });
      this[28] = new OpCode('iload_2', 'Load int from local variable 2', function(frame) {
        return frame.op_stack.push(frame.locals[2]);
      });
      this[29] = new OpCode('iload_3', 'Load int from local variable 3', function(frame) {
        return frame.op_stack.push(frame.locals[3]);
      });
      this[30] = new OpCode('lload_0', 'Load long from local variable 0', function(frame) {
        frame.op_stack.push(frame.locals[0]);
        return frame.op_stack.push(frame.locals[0]);
      });
      this[31] = new OpCode('lload_1', 'Load long from local variable 1', function(frame) {
        frame.op_stack.push(frame.locals[1]);
        return frame.op_stack.push(frame.locals[1]);
      });
      this[32] = new OpCode('lload_2', 'Load long from local variable 2', function(frame) {
        frame.op_stack.push(frame.locals[2]);
        return frame.op_stack.push(frame.locals[2]);
      });
      this[33] = new OpCode('lload_3', 'Load long from local variable 3', function(frame) {
        frame.op_stack.push(frame.locals[3]);
        return frame.op_stack.push(frame.locals[3]);
      });
      this[34] = new OpCode('fload_0', 'Load float from local var 0', function(frame) {
        return frame.op_stack.push(frame.locals[0]);
      });
      this[35] = new OpCode('fload_1', 'Load float from local var 1', function(frame) {
        return frame.op_stack.push(frame.locals[1]);
      });
      this[36] = new OpCode('fload_2', 'Load float from local var 2', function(frame) {
        return frame.op_stack.push(frame.locals[2]);
      });
      this[37] = new OpCode('fload_3', 'Load float from local var 3', function(frame) {
        return frame.op_stack.push(frame.locals[3]);
      });
      this[38] = new OpCode('dload_0', 'Load double from local variable', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[39] = new OpCode('dload_1', 'Load double from local variable 1', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[40] = new OpCode('dload_2', 'Load double from local variable 2', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[41] = new OpCode('dload_3', 'Load double from local variable 3', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[42] = new OpCode('aload_0', 'Load reference from local variable 0', function(frame) {
        return frame.op_stack.push(frame.locals[0]);
      });
      this[43] = new OpCode('aload_1', 'Load reference from local variable 1', function(frame) {
        return frame.op_stack.push(frame.locals[1]);
      });
      this[44] = new OpCode('aload_2', 'Load reference from local variable 2', function(frame) {
        return frame.op_stack.push(frame.locals[2]);
      });
      this[45] = new OpCode('aload_3', 'Load reference from local variable 3', function(frame) {
        return frame.op_stack.push(frame.locals[3]);
      });
      this[46] = new OpCode('iaload', 'Load int from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var int;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          int = array[arrayindex];
          return frame.op_stack.push(int);
        }, this);
        return false;
      });
      this[47] = new OpCode('laload', 'Load long from array', function(frame) {
        var arrayindex, arrayref;
        arrayref = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var long;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          long = array[arrayindex];
          return frame.op_stack.push(long);
        }, this);
        return false;
      });
      this[48] = new OpCode('faload', 'Load float from array', function(frame) {
        var arrayindex, arrayref;
        arrayref = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var float;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          float = array[arrayindex];
          return frame.op_stack.push(float);
        }, this);
        return false;
      });
      this[49] = new OpCode('daload', 'Load double from array', function(frame) {
        var arrayindex, arrayref;
        arrayref = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var double;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          double = array[arrayindex];
          return frame.op_stack.push(double);
        }, this);
        return false;
      });
      this[50] = new OpCode('aaload', 'Load reference from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        thread.getObject(arrayref, function(array) {
          var ref;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          ref = array[arrayindex];
          return frame.op_stack.push(ref);
        }, this);
        return false;
      });
      this[51] = new OpCode('baload', 'Load byte or boolean from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var ba;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          ba = array[arrayindex];
          return frame.op_stack.push(ba);
        }, this);
        return false;
      });
      this[52] = new OpCode('caload', 'Load char from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var ch;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          ch = array[arrayindex];
          return frame.op_stack.push(ch);
        }, this);
        return false;
      });
      this[53] = new OpCode('saload', 'Load short from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var sh;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          sh = array[arrayindex];
          return frame.op_stack.push(sh);
        }, this);
        return false;
      });
      this[54] = new OpCode('istore', 'Store int into local variable', function(frame) {
        var index, int;
        index = this.getIndexByte(1, frame, thread);
        int = frame.op_stack.pop();
        return frame.locals[index] = int;
      });
      this[55] = new OpCode('lstore', 'Store long into local variable', function(frame) {
        var index, long;
        index = this.getIndexByte(1, frame, thread);
        long = frame.op_stack.pop();
        return frame.locals[index] = long;
      });
      this[56] = new OpCode('fstore', 'Store float into local variable', function(frame) {
        var float, index;
        index = this.getIndexByte(1, frame, thread);
        float = frame.op_stack.pop();
        return frame.locals[index] = float;
      });
      this[57] = new OpCode('dstore', 'Store double into local variable', function(frame) {
        var d, d1, index;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        index = this.getIndexByte(1, frame, thread);
        return frame.locals[index] = d;
      });
      this[58] = new OpCode('astore', 'Store reference into local variable', function(frame) {
        var index, objectref;
        index = this.getIndexByte(1, frame, thread);
        objectref = frame.op_stack.pop();
        return frame.locals[index] = objectref;
      });
      this[59] = new OpCode('istore_0', 'Store int from opstack to local variable 0', function(frame) {
        return frame.locals[0] = frame.op_stack.pop();
      });
      this[60] = new OpCode('istore_1', 'Store int from opstack to local variable 1', function(frame) {
        return frame.locals[1] = frame.op_stack.pop();
      });
      this[61] = new OpCode('istore_2', 'Store int from opstack to local variable 2', function(frame) {
        return frame.locals[2] = frame.op_stack.pop();
      });
      this[62] = new OpCode('istore_3', 'Store int from opstack to local variable 3', function(frame) {
        return frame.locals[3] = frame.op_stack.pop();
      });
      this[63] = new OpCode('lstore_0', 'Store long into local variable 0', function(frame) {
        frame.locals[0] = frame.op_stack.pop();
        return frame.locals[1] = frame.op_stack.pop();
      });
      this[64] = new OpCode('lstore_1', 'Store long into local variable 1', function(frame) {
        frame.locals[1] = frame.op_stack.pop();
        return frame.locals[2] = frame.op_stack.pop();
      });
      this[65] = new OpCode('lstore_2', 'Store long into local variable 2', function(frame) {
        frame.locals[2] = frame.op_stack.pop();
        return frame.locals[3] = frame.op_stack.pop();
      });
      this[66] = new OpCode('lstore_3', 'Store long into local variable 3', function(frame) {
        frame.locals[3] = frame.op_stack.pop();
        return frame.locals[4] = frame.op_stack.pop();
      });
      this[67] = new OpCode('fstore_0', 'Store float into local variable 0', function(frame) {
        return frame.locals[0] = frame.op_stack.pop();
      });
      this[68] = new OpCode('fstore_1', 'Store float into local variable 1', function(frame) {
        return frame.locals[1] = frame.op_stack.pop();
      });
      this[69] = new OpCode('fstore_2', 'Store float into local variable 2', function(frame) {
        return frame.locals[2] = frame.op_stack.pop();
      });
      this[70] = new OpCode('fstore_3', 'Store float into local variable 3', function(frame) {
        return frame.locals[3] = frame.op_stack.pop();
      });
      this[71] = new OpCode('dstore_0', 'Store double to local var 0', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[0] = d;
        frame.locals[1] = d1;
        return true;
      });
      this[72] = new OpCode('dstore_1', 'Store double to local var 1', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[1] = d;
        frame.locals[2] = d1;
        return true;
      });
      this[73] = new OpCode('dstore_2', 'Store double to local var 2', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[2] = d;
        frame.locals[3] = d1;
        return true;
      });
      this[74] = new OpCode('dstore_3', 'Store double to local var 3', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[3] = d;
        frame.locals[4] = d1;
        return true;
      });
      this[75] = new OpCode('astore_0', 'Store reference into local var 0', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[0] = objectref;
        return true;
      });
      this[76] = new OpCode('astore_1', 'Store reference into local var 1', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[1] = objectref;
        return true;
      });
      this[77] = new OpCode('astore_2', 'Store reference into local var 2', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[2] = objectref;
        return true;
      });
      this[78] = new OpCode('astore_3', 'Store reference into local var 3', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[3] = objectref;
        return true;
      });
      this[79] = new OpCode('iastore', 'Store into int array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(arrayref, array);
        }, this);
        return false;
      });
      this[80] = new OpCode('lastore', 'Store into long array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(arrayref, array);
        }, this);
        return false;
      });
      this[81] = new OpCode('fastore', 'Store into float array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(arrayref, array);
        }, this);
        return false;
      });
      this[82] = new OpCode('dastore', 'Store double into array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          thread.updateObject(arrayref, array);
          return false;
        }, this);
        return false;
      });
      this[83] = new OpCode('aastore', 'Store reference into Array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex.val > array.length || arrayindex.val < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex.val] = value;
          thread.updateObject(arrayref, array);
          return false;
        }, this);
        return false;
      });
      this[84] = new OpCode('bastore', 'Store into byte or boolean Array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(arrayref, array);
        }, this);
        return false;
      });
      this[85] = new OpCode('castore', 'Store into char array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop().val;
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            throw 'ArrayIndexOutOfBoundsException' + arrayindex + ' ' + array.length;
          }
          array[arrayindex] = value;
          return thread.updateObject(arrayref, array);
        }, this);
        return false;
      });
      this[86] = new OpCode('sastore', 'Store into short array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            throw 'ArrayIndexOutOfBoundsException' + arrayindex + ' ' + array.length;
          }
          array[arrayindex] = value;
          return thread.updateObject(arrayref, array);
        }, this);
        return false;
      });
      this[87] = new OpCode('pop', 'Pops top stack word', function(frame) {
        frame.op_stack.pop();
        return true;
      });
      this[88] = new OpCode('pop2', 'Pops top two operand stack words', function(frame) {
        frame.op_stack.pop();
        frame.op_stack.pop();
        return true;
      });
      this[89] = new OpCode('dup', 'Duplicate top operand stack word', function(frame) {
        return frame.op_stack.push(frame.op_stack.peek());
      });
      this[90] = new OpCode('dup_x1', 'Duplicate top op stack word and put two down', function(frame) {
        var dupword, word1;
        dupword = frame.op_stack.pop();
        word1 = frame.op_stack.pop();
        frame.op_stack.push(dupword);
        frame.op_stack.push(word1);
        return frame.op_stack.push(dupword);
      });
      this[91] = new OpCode('dup_x2', 'Duplicate top op stack word and put three down', function(frame) {
        var dupword, word2, word3;
        dupword = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        word3 = frame.op_stack.pop();
        frame.op_stack.push(dupword);
        frame.op_stack.push(word3);
        frame.op_stack.push(word2);
        return frame.op_stack.push(dupword);
      });
      this[92] = new OpCode('dup2', 'Duplicate top op stack words', function(frame) {
        var word1, word2;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        frame.op_stack.push(word2);
        frame.op_stack.push(word1);
        frame.op_stack.push(word2);
        return frame.op_stack.push(word1);
      });
      this[93] = new OpCode('dup2_x1', 'Duplicate top two op stack words and put three down', function(frame) {
        var word1, word2, word3;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        word3 = frame.op_stack.pop();
        frame.op_stack.push(word2);
        frame.op_stack.push(word1);
        frame.op_stack.push(word3);
        frame.op_stack.push(word2);
        return frame.op_stack.push(word1);
      });
      this[94] = new OpCode('dup2_x2', 'Duplicate top two op stack words and put four down', function(frame) {
        var word1, word2, word3, word4;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        word3 = frame.op_stack.pop();
        word4 = frame.op_stack.pop();
        frame.op_stack.push(word2);
        frame.op_stack.push(word1);
        frame.op_stack.push(word4);
        frame.op_stack.push(word3);
        frame.op_stack.push(word2);
        return frame.op_stack.push(word1);
      });
      this[95] = new OpCode('swap', 'Swap top two operand stack words', function(frame) {
        var word1, word2;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        frame.op_stack.push(word1);
        return frame.op_stack.push(word2);
      });
      this[96] = new OpCode('iadd', 'Pops two values from the stack, adds them and pushes the result.', function(frame) {
        var i1, i2;
        i1 = frame.op_stack.pop().val;
        i2 = frame.op_stack.pop().val;
        if (isNaN(i1) || isNaN(i2)) {
          frame.op_stack.push(new CONSTANT_integer(Number.NaN));
          return true;
        }
        return frame.op_stack.push(new CONSTANT_integer(i1 + i2));
      });
      this[97] = new OpCode('ladd', 'Add long', function(frame) {
        var long1a, long1b, long2a, long2b;
        long1a = frame.op_stack.pop().val;
        long1b = frame.op_stack.pop().val;
        long2a = frame.op_stack.pop().val;
        long2b = frame.op_stack.pop().val;
        if (isNaN(long1a.value) || isNaN(long2a.value)) {
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
          return true;
        }
        frame.op_stack.push(new CONSTANT_long(long1a + long2a));
        return frame.op_stack.push(new CONSTANT_long(long1a + long2a));
      });
      this[98] = new OpCode('fadd', 'Add float', function(frame) {
        var float1, float2, result;
        float1 = frame.op_stack.pop().val;
        float2 = frame.op_stack.pop().val;
        if (isNaN(float1.value) || isNaN(float2.value)) {
          frame.op_stack.push(new CONSTANT_float(Number.NaN));
          return true;
        }
        result = float2.value + float1.value;
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[99] = new OpCode('dadd', 'Add double', function(frame) {
        var da1, da2, db1, db2, result;
        da1 = frame.op_stack.pop().val;
        da2 = frame.op_stack.pop().val;
        db1 = frame.op_stack.pop().val;
        db2 = frame.op_stack.pop().val;
        if (isNaN(float1.value) || isNaN(float2.value)) {
          frame.op_stack.push(new CONSTANT_double(Number.NaN));
          frame.op_stack.push(new CONSTANT_double(Number.NaN));
          return true;
        }
        result = da1 + db1;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[100] = new OpCode('isub', 'Subtract int', function(frame) {
        var i1, i2, result;
        i2 = frame.op_stack.pop().val;
        i1 = frame.op_stack.pop().val;
        result = i1 - i2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[101] = new OpCode('lsub', 'Subtract long', function(frame) {
        var ia1, ia2, ib1, ib2, result;
        ia1 = frame.op_stack.pop().val;
        ia2 = frame.op_stack.pop().val;
        ib1 = frame.op_stack.pop().val;
        ib2 = frame.op_stack.pop().val;
        result = ib1 - ia1;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[102] = new OpCode('fsub', 'Subtract float', function(frame) {
        var f1, f2, result;
        f2 = frame.op_stack.pop().val;
        f1 = frame.op_stack.pop().val;
        result = f1 - f2;
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[103] = new OpCode('dsub', 'Subtract double', function(frame) {
        var d, d1, d2, d3, result;
        d = frame.op_stack.pop().val;
        d1 = frame.op_stack.pop().val;
        d2 = frame.op_stack.pop().val;
        d3 = frame.op_stack.pop().val;
        result = d - d2;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[104] = new OpCode('imul', 'Multiply int', function(frame) {
        var f1, f2, result;
        f2 = frame.op_stack.pop().val;
        f1 = frame.op_stack.pop().val;
        result = f1 * f2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[105] = new OpCode('lmul', 'Multiple long', function(frame) {
        var la1, la2, lb1, lb2, result;
        la1 = frame.op_stack.pop().val;
        la2 = frame.op_stack.pop().val;
        lb1 = frame.op_stack.pop().val;
        lb2 = frame.op_stack.pop().val;
        if (isNan(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
        }
        result = lb1 * la1;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[106] = new OpCode('fmul', 'Multiply float', function(frame) {
        var result, value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        result = value1 * value2;
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_float(Number.NaN));
        }
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[107] = new OpCode('dmul', 'Multiply double', function(frame) {
        var d, d1, d2, d3, result;
        d = frame.op_stack.pop().val;
        d1 = frame.op_stack.pop().val;
        d2 = frame.op_stack.pop().val;
        d3 = frame.op_stack.pop().val;
        result = d * d2;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[108] = new OpCode('idiv', 'Divide int', function(frame) {
        var result, value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_integer(Integer.NaN));
        }
        if (value2 === 0) {
          athrow('ArithmeticException');
        }
        result = value1 / value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[109] = new OpCode('ldiv', 'Divide long', function(frame) {
        var l1, l1a, l2, l2a, result;
        l2 = frame.op_stack.pop();
        l2a = frame.op_stack.pop();
        l1 = frame.op_stack.pop();
        l1a = frame.op_stack.pop();
        if (isNaN(l1) || isNaN(l2)) {
          frame.op_stack.push(new CONSTANT_long(Integer.NaN));
          frame.op_stack.push(new CONSTANT_long(Integer.NaN));
        }
        if (l2 === 0) {
          athrow('ArithmeticException');
        }
        result = l1 / l2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[110] = new OpCode('fdiv', 'Divide float', function(frame) {
        var result, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_float(Integer.NaN));
        }
        if (value2 === 0) {
          athrow('ArithmeticException');
        }
        result = value1 / value2;
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[111] = new OpCode('ddiv', 'Divide Double', function(frame) {
        var d1, d1a, d2, d2a, result;
        d2 = frame.op_stack.pop();
        d2a = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        d1a = frame.op_stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_double(Integer.NaN));
          frame.op_stack.push(new CONSTANT_double(Integer.NaN));
        }
        if (d2 === 0) {
          athrow('ArithmeticException');
        }
        result = d1 / d2;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[112] = new OpCode('irem', 'Remainder int', function(frame) {
        var i1, i2, result;
        i2 = frame.op_stack.pop().val;
        i1 = frame.op_stack.pop().val;
        if (i2 === 0) {
          athrow('ArithmeticException');
        }
        result = i1 - (i1 / i2) * i2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[113] = new OpCode('lrem', 'Remainder long', function(frame) {
        var l1, l2, result;
        l2 = frame.op_stack.pop().val;
        l1 = frame.op_stack.pop().val;
        if (l2 === 0) {
          athrow('ArithmeticException');
        }
        result = l1 - (l1 / l2) * l2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[114] = new OpCode('frem', 'Remainder float', function(frame) {
        return thread.log('frem not implemented');
      });
      this[115] = new OpCode('drem', 'Remainder double', function(frame) {
        return thread.log('drem not implemented');
      });
      this[116] = new OpCode('ineg', 'Negate int', function(frame) {
        var result, value;
        value = frame.op_stack.pop().val;
        result = (~value) + 1;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[117] = new OpCode('lneg', 'Negate long', function(frame) {
        var la, lb, result;
        la = frame.op_stack.pop().val;
        lb = frame.op_stack.pop().val;
        result = (~la) + 1;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[118] = new OpCode('fneg', 'Negate float', function(frame) {
        var result, value;
        value = frame.op_stack.pop().val;
        result = new CONSTANT_double(~value.value + 1);
        return frame.op_stack.push(result);
      });
      this[119] = new OpCode('dneg', 'Negate double', function(frame) {
        var d1, d2, result;
        d1 = frame.op_stack.pop().val;
        d2 = frame.op_stack.pop().val;
        result = new CONSTANT_double(~d1.value + 1);
        frame.op_stack.push(result);
        return frame.op_stack.push(result);
      });
      this[120] = new OpCode('ishl', 'Arithmetic shift left int', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        s = value2 & 0x1f;
        result = value1 << s;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[121] = new OpCode('lshl', 'Arithmetic shift left long', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        s = value2 & 0x3f;
        result = value1 << s;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[122] = new OpCode('ishr', 'Arithmetic shift right int', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        s = value2 & 0x1f;
        result = value1 >> s;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[123] = new OpCode('lshr', 'Arithmetic shift right long', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        s = value2 & 0x3f;
        result = value1 >> s;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[124] = new OpCode('iushr', 'Logical shift right int', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        s = value2 & 0x1f;
        if (value1 > 0) {
          result = value1 >> s;
        } else {
          result = (value1 >> s) + (2 << ~s);
        }
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[125] = new OpCode('lushr', 'Logical shift right long', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        s = value2 & 0x1f;
        if (value1 > 0) {
          result = value1 >> s;
        } else {
          result = (value1 >> s) + (2 << ~s);
        }
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[126] = new OpCode('iand', 'Boolean AND int', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().val;
        value2 = frame.op_stack.pop().val;
        result = value1 & value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[127] = new OpCode('land', 'Boolean ', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        value2 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        result = value1 & value2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[128] = new OpCode('ior', '', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().val;
        value2 = frame.op_stack.pop().val;
        result = value1 | value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[129] = new OpCode('lor', 'Boolean OR long', function(frame) {
        var l1, l2, result;
        l1 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        l2 = frame.op_stack.pop().val;
        frame.op_stack.pop().val;
        result = l1 | l2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[130] = new OpCode('ixor', 'Boolean XOR int', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().val;
        value2 = frame.op_stack.pop().val;
        result = value1 ^ value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[131] = new OpCode('lxor', 'Boolean XOR long', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().val;
        frame.op_stack.pop();
        value2 = frame.op_stack.pop().val;
        frame.op_stack.pop();
        result = value1 ^ value2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[132] = new OpCode('iinc', 'Increment local variable by constant', function(frame) {
        var consta, index, unsigned, variable;
        index = this.getIndexByte(1, frame, thread);
        unsigned = this.getIndexByte(1, frame, thread);
        consta = new CONSTANT_byte(unsigned, true);
        variable = frame.locals[index];
        variable.val = variable.val + consta.value;
        return frame.locals[index] = variable;
      });
      this[133] = new OpCode('i2l', 'Convert int to long', function(frame) {
        var long, value;
        value = frame.op_stack.pop().val;
        long = new CONSTANT_long(value);
        frame.op_stack.push(long);
        return frame.op_stack.push(long);
      });
      this[134] = new OpCode('i2f', 'Convert int to float', function(frame) {
        var float, value;
        value = frame.op_stack.pop().val;
        float = new CONSTANT_float(value);
        return frame.op_stack.push(float);
      });
      this[135] = new OpCode('i2d', 'Convert int to double', function(frame) {
        var double, value;
        value = frame.op_stack.pop().val;
        double = new CONSTANT_double(value);
        return frame.op_stack.push(double);
      });
      this[136] = new OpCode('l2i', 'Convert long to int', function(frame) {
        var int, value;
        value = frame.op_stack.pop().val;
        int = new CONSTANT_integer(value.toFixed());
        return frame.op_stack.push(int);
      });
      this[137] = new OpCode('l2f', 'Convert long to float', function(frame) {
        var float, value;
        value = frame.op_stack.pop().val;
        float = new CONSTANT_float(value);
        return frame.op_stack.push(float);
      });
      this[138] = new OpCode('l2d', 'Convert long to double', function(frame) {
        var double, value;
        value = frame.op_stack.pop().val;
        double = new CONSTANT_double(value);
        return frame.op_stack.push(double);
      });
      this[139] = new OpCode('f2i', 'Convert float to int', function(frame) {
        var float, int;
        float = frame.op_stack.pop().val;
        int = new CONSTANT_integer(float.toFixed());
        return frame.op_stack.push(int);
      });
      this[140] = new OpCode('f2l', 'Convert Float to long', function(frame) {
        var float, long;
        float = frame.op_stack.pop().val;
        long = new CONSTANT_long(float.toFixed());
        frame.op_stack.push(long);
        return frame.op_stack.push(long);
      });
      this[141] = new OpCode('f2d', 'Convert float to double', function(frame) {
        var double, float;
        float = frame.op_stack.pop().val;
        double = new CONSTANT_double(float.value);
        frame.op_stack.push(double);
        return frame.op_stack.push(double);
      });
      this[142] = new OpCode('d2i', 'Convert double to int', function(frame) {
        var double, int;
        double = frame.op_stack.pop().val;
        int = new CONSTANT_integer(float.toFixed());
        return frame.op_stack.push(int);
      });
      this[143] = new OpCode('d2l', 'Convert double to long', function(frame) {
        var double, long;
        double = frame.op_stack.pop().val;
        frame.op_stack.pop();
        long = new CONSTANT_float(long.toFixed());
        frame.op_stack.push(long);
        return frame.op_stack.push(long);
      });
      this[144] = new OpCode('d2f', 'Convert double to float', function(frame) {
        var double, float;
        double = frame.op_stack.pop().val;
        frame.op_stack.pop();
        float = new CONSTANT_float(double);
        return frame.op_stack.push(float);
      });
      this[145] = new OpCode('i2b', 'Convert int to byte', function(frame) {
        var byte, int;
        int = frame.op_stack.pop().val;
        byte = new CONSTANT_byte(int);
        return frame.op_stack.push(byte);
      });
      this[146] = new OpCode('i2c', 'Convert int to char', function(frame) {
        var char, int;
        int = frame.op_stack.pop().val;
        char = new CONSTANT_char(int);
        return frame.op_stack.push(char);
      });
      this[147] = new OpCode('i2s', 'Convert int to short', function(frame) {
        var int, short;
        int = frame.op_stack.pop().val;
        short = new CONSTANT_short(int);
        return frame.op_stack.push(short);
      });
      this[148] = new OpCode('lcmp', 'Compare long', function(frame) {
        var value1a, value1b, value2a, value2b;
        value2a = frame.op_stack.pop().val;
        value2b = frame.op_stack.pop().val;
        value1a = frame.op_stack.pop().val;
        value1b = frame.op_stack.pop().val;
        if (value1a > value2a) {
          return frame.op_stack.push(1);
        } else if (value1a === value2a) {
          return frame.op_stack.push(0);
        } else if (value1a < value2a) {
          return frame.op_stack.push(-1);
        }
      });
      this[149] = new OpCode('fcmpl', 'Compare float, push -1 for NaN', function(frame) {
        var value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        if (isNaN(value1) || isNaN(value2)) {
          return frame.op_stack.push(-1);
        } else if (value1 > value2) {
          return frame.op_stack.push(1);
        } else if (value1 === value2) {
          return frame.op_stack.push(0);
        } else if (value1 < value2) {
          return frame.op_stack.push(-1);
        }
      });
      this[150] = new OpCode('fcmpg', 'Compare float, push 1 for NaN', function(frame) {
        var value1, value2;
        value2 = frame.op_stack.pop().val;
        value1 = frame.op_stack.pop().val;
        if (isNaN(value1) || isNaN(value2)) {
          return frame.op_stack.push(1);
        } else if (value1 > value2) {
          return frame.op_stack.push(1);
        } else if (value1 === value2) {
          return frame.op_stack.push(0);
        } else if (value1 < value2) {
          return frame.op_stack.push(-1);
        }
      });
      this[151] = new OpCode('dcmpl', 'Compare double, push -1 for NaN', function(frame) {
        var value1a, value1b, value2a, value2b;
        value2a = frame.op_stack.pop().val;
        value2b = frame.op_stack.pop().val;
        value1a = frame.op_stack.pop().val;
        value1b = frame.op_stack.pop().val;
        if (isNaN(value1a) || isNaN(value2a)) {
          return frame.op_stack.push(-1);
        } else if (value1a > value2a) {
          return frame.op_stack.push(1);
        } else if (value1a === value2a) {
          return frame.op_stack.push(0);
        } else if (value1a < value2a) {
          return frame.op_stack.push(-1);
        }
      });
      this[152] = new OpCode('dcmpg', 'Compare double, push 1 for NaN', function(frame) {
        var value1a, value1b, value2a, value2b;
        value2a = frame.op_stack.pop().val;
        value2b = frame.op_stack.pop().val;
        value1a = frame.op_stack.pop().val;
        value1b = frame.op_stack.pop().val;
        if (isNaN(value1a) || isNaN(value2a)) {
          return frame.op_stack.push(1);
        } else if (value1a > value2a) {
          return frame.op_stack.push(1);
        } else if (value1a === value2a) {
          return frame.op_stack.push(0);
        } else if (value1a < value2a) {
          return frame.op_stack.push(-1);
        }
      });
      this[153] = new OpCode('ifeq', 'Branch if value is 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() === 0) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[154] = new OpCode('ifne', 'Branch if value isnt 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop().val !== 0) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[155] = new OpCode('iflt', 'Branch if value < 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() < 0) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[156] = new OpCode('ifge', 'Branch if value >= 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() >= 0) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[157] = new OpCode('ifgt', 'Branch if value > 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() > 0) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[158] = new OpCode('ifle', 'Branch if value <= 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() <= 0) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[159] = new OpCode('if_icmpeq', 'Branch if int1 == int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 === value2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[160] = new OpCode('if_icmpne', 'Branch if int1 != int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 !== value2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[161] = new OpCode('if_icmplt', 'Branch if int1 < int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 < value2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[162] = new OpCode('if_icmpge', 'Branch if int1 >= int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 >= value2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[163] = new OpCode('if_icmpgt', 'Branch if int1 > int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 > value2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[164] = new OpCode('if_icmple', 'Branch if int1 <= int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 <= value2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[165] = new OpCode('if_acmpeq', 'Branch if ref1 === ref2', function(frame) {
        var branch, ref1, ref2;
        ref2 = frame.op_stack.pop();
        ref1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (ref1 === ref2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[166] = new OpCode('if_acmpne', 'Branch if ref1 !== ref2', function(frame) {
        var branch, ref1, ref2;
        ref2 = frame.op_stack.pop();
        ref1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (ref1 !== ref2) {
          frame.pc -= 3;
          frame.pc += branch;
        }
        return true;
      });
      this[167] = new OpCode('goto', 'Branch always', function(frame) {
        var offset;
        offset = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        frame.pc -= 3;
        return frame.pc += offset;
      });
      this[168] = new OpCode('jsr', 'Jump to subroutine', function(frame) {
        var offset;
        frame.op_stack.push(frame.pc);
        offset = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        frame.pc -= 3;
        return frame.pc += offset;
      });
      this[169] = new OpCode('ret', 'Return from subroutine', function(frame) {
        var index;
        index = this.getByteIndex(1);
        return frame.pc = frame.locals[index];
      });
      this[170] = new OpCode('tableswitch', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[171] = new OpCode('lookupswitch', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[172] = new OpCode('ireturn', 'Return an int', function(frame) {
        var invoker, ireturn;
        ireturn = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(ireturn);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[173] = new OpCode('lreturn', 'Return long from method', function(frame) {
        var invoker, retlong;
        retlong = frame.op_stack.pop();
        frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(retlong);
        invoker.op_stack.push(retlong);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[174] = new OpCode('freturn', 'Return float from method', function(frame) {
        var invoker, retfloat;
        retfloat = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(retfloat);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[175] = new OpCode('dreturn', 'Return double from method', function(frame) {
        var invoker, retdouble;
        retdouble = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(retdouble);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[176] = new OpCode('areturn', 'Return reference', function(frame) {
        var invoker, returnref;
        returnref = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        if (invoker === void 0) {
          return true;
        }
        invoker.op_stack.push(returnref);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[177] = new OpCode('return', 'Return void from method', function(frame) {
        var invoker;
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        thread.current_frame = invoker;
        if (thread.current_frame != null) {
          thread.pc = thread.current_frame.pc;
          thread.current_class = invoker.cls;
        }
        return true;
      });
      this[178] = new OpCode('getstatic', 'Fetch static field from class', function(frame) {
        var class_field_ref, class_ref, field_name, field_name_type, ref;
        ref = this.constructIndex(frame, thread);
        class_field_ref = this.fromCP(ref, thread);
        class_ref = this.fromCP(class_field_ref.class_index, thread);
        field_name_type = this.fromCP(class_field_ref.name_and_type_index, thread);
        field_name = this.fromCP(field_name_type.name_index, thread);
        thread.resolveClass(class_ref, function(cls) {
          thread.getStatic(cls, field_name, function(value) {
            return frame.op_stack.push(value);
          });
          return false;
        }, this);
        return false;
      });
      this[179] = new OpCode('putstatic', 'Set static field in class', function(frame) {
        var class_field_ref, class_ref, field_name, field_name_type, ref;
        ref = this.constructIndex(frame, thread);
        class_field_ref = this.fromCP(ref, thread);
        class_ref = this.fromCP(class_field_ref.class_index, thread);
        field_name_type = this.fromCP(class_field_ref.name_and_type_index, thread);
        field_name = this.fromCP(field_name_type.name_index, thread);
        thread.resolveClass(class_ref, function(cls) {
          var value;
          value = frame.op_stack.pop();
          thread.setStatic(cls, field_name, value);
          return false;
        }, this);
        return false;
      });
      this[180] = new OpCode('getfield', 'Get a field from an object', function(frame) {
        var fieldname, fieldref, index, nameandtype, objectref;
        objectref = frame.op_stack.pop();
        if (this.isNull(objectref)) {
          athrow('NullPointerException');
        }
        index = this.constructIndex(frame, thread);
        fieldref = this.fromCP(index, thread);
        nameandtype = this.fromCP(fieldref.name_and_type_index, thread);
        fieldname = this.fromCP(nameandtype.name_index, thread);
        thread.getObjectField(objectref, fieldname, function(field) {
          return frame.op_stack.push(field);
        }, this);
        return false;
      });
      this[181] = new OpCode('putfield', 'Set a field in an object', function(frame) {
        var fieldname, fieldref, index, nameandtype, objectref, value;
        value = frame.op_stack.pop();
        objectref = frame.op_stack.pop();
        if (this.isNull(objectref)) {
          athrow('NullPointerException');
        }
        index = this.constructIndex(frame, thread);
        fieldref = this.fromCP(index, thread);
        nameandtype = this.fromCP(fieldref.name_and_type_index, thread);
        fieldname = this.fromCP(nameandtype.name_index, thread);
        thread.setObjectField(objectref, fieldname, value);
        return false;
      });
      this[182] = new OpCode('invokevirtual', 'Invoke instance method; dispatch based on class', function(frame) {
        var classname, descriptor, index, method_name, methodnameandtype, methodref;
        index = this.constructIndex(frame, thread);
        methodref = this.fromCP(index, thread);
        classname = this.fromCP(methodref.class_index, thread);
        methodnameandtype = this.fromCP(methodref.name_and_type_index, thread);
        method_name = this.fromCP(methodnameandtype.name_index, thread);
        descriptor = this.fromCP(methodnameandtype.descriptor_index, thread);
        thread.resolveMethod(method_name, classname, descriptor, function(method) {
          var arg_num, newframe, objectref;
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC) {
            athrow('IncompatibleClassChangeError');
          }
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_ABSTRACT) {
            objectref = frame.locals[0];
            thread.getObject(objectref, function(object) {
              thread.resolveMethod(method_name, object.cls.real_name, descriptor, function(method) {
                var arg_num, newframe;
                newframe = thread.createFrame(method, method.belongsTo);
                thread.current_class = method.belongsTo;
                arg_num = method.nargs;
                while (arg_num > 0) {
                  newframe.locals[arg_num--] = frame.op_stack.pop();
                }
                newframe.locals[0] = objectref;
                if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_SYNCHRONIZED) {
                  thread.aquireLock(objectref);
                }
                return true;
              }, this);
              return false;
            }, this);
            return false;
          } else {
            newframe = thread.createFrame(method, method.belongsTo);
            thread.current_class = method.belongsTo;
            arg_num = method.nargs;
            while (arg_num > 0) {
              newframe.locals[arg_num--] = frame.op_stack.pop();
            }
            objectref = frame.op_stack.pop();
            newframe.locals[0] = objectref;
            if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_SYNCHRONIZED) {
              thread.aquireLock(objectref);
            }
            return true;
          }
        }, this);
        return false;
      });
      this[183] = new OpCode('invokespecial', 'Invoke instance method', function(frame) {
        var classname, descriptor, method_name, method_name_and_type, methodref;
        methodref = this.fromCP(this.constructIndex(frame, thread), thread);
        classname = this.fromCP(methodref.class_index, thread);
        method_name_and_type = this.fromCP(methodref.name_and_type_index, thread);
        method_name = this.fromCP(method_name_and_type.name_index, thread);
        descriptor = this.fromCP(method_name_and_type.descriptor_index, thread);
        thread.resolveMethod(method_name, classname, descriptor, function(method) {
          var arg_num, newframe, objectref;
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC) {
            athrow('IncompatibleClassChangeError');
          }
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_ABSTRACT) {
            athrow('AbstractMethodError');
          }
          newframe = thread.createFrame(method, method.belongsTo);
          thread.current_class = method.belongsTo;
          arg_num = method.nargs;
          while (arg_num > 0) {
            newframe.locals[arg_num--] = frame.op_stack.pop();
          }
          objectref = frame.op_stack.pop();
          if (this.isNull(objectref)) {
            athrow('NullPointerException');
          }
          return newframe.locals[0] = objectref;
        }, this);
        return false;
      });
      this[184] = new OpCode('invokestatic', 'Invoke class (static) method', function(frame) {
        var classname, descriptor, method_name, method_name_and_type, methodref;
        methodref = this.fromCP(this.constructIndex(frame, thread), thread);
        classname = this.fromCP(methodref.class_index, thread);
        method_name_and_type = this.fromCP(methodref.name_and_type_index, thread);
        method_name = this.fromCP(method_name_and_type.name_index, thread);
        descriptor = this.fromCP(method_name_and_type.descriptor_index, thread);
        thread.resolveMethod(method_name, classname, descriptor, function(method) {
          var arg_num, newframe, _results;
          if (!(method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC)) {
            athrow('IncompatibleClassChangeError');
          }
          newframe = thread.createFrame(method, method.belongsTo);
          thread.current_class = method.belongsTo;
          arg_num = method.nargs;
          _results = [];
          while (arg_num > 0) {
            _results.push(newframe.locals[--arg_num] = frame.op_stack.pop());
          }
          return _results;
        }, this);
        return false;
      });
      this[185] = new OpCode('invokeinterface', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[186] = new OpCode('xxxunusedxxx', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[187] = new OpCode('new', 'Create new Object', function(frame) {
        var clsref, index;
        index = this.constructIndex(frame, thread);
        clsref = this.fromCP(index, thread);
        thread.resolveClass(clsref, function(cls) {
          if (cls.access_flags & JVM_RECOGNIZED_CLASS_MODIFIERS.JVM_ACC_INTERFACE || cls.access_flags & JVM_RECOGNIZED_CLASS_MODIFIERS.JVM_ACC_ABSTRACT) {
            athrow('InstantiationException');
          }
          thread.allocateNew(cls.real_name, function(objectref) {
            return frame.op_stack.push(objectref);
          }, this);
          return false;
        }, this);
        return false;
      });
      this[188] = new OpCode('newarray', 'Create a new array', function(frame) {
        var arr, atype, count, t;
        atype = this.getIndexByte(1, frame, thread);
        count = frame.op_stack.pop();
        if (count < 0) {
          athrow('NegativeArraySizeException');
        }
        switch (atype) {
          case 4:
            t = 'Z';
            break;
          case 5:
            t = 'C';
            break;
          case 6:
            t = 'F';
            break;
          case 7:
            t = 'D';
            break;
          case 8:
            t = 'B';
            break;
          case 9:
            t = 'S';
            break;
          case 10:
            t = 'I';
            break;
          case 11:
            t = 'J';
        }
        if (typeof count !== 'number') {
          count = count.val;
        }
        arr = new Array(count);
        while (count-- > 0) {
          arr[count] = 0;
        }
        arr.type = t;
        thread.log("new array with size" + count);
        thread.allocate(arr, function(arrayref) {
          return frame.op_stack.push(arrayref);
        });
        return false;
      });
      this[189] = new OpCode('anewarray', 'Create new array of reference', function(frame) {
        var classname, count;
        classname = this.constructIndex(frame, thread);
        count = frame.op_stack.pop();
        if (count < 0) {
          athrow('NegativeArraySizeException');
        }
        thread.resolveClass(classname, function(cls) {
          var arr;
          if (typeof count !== 'number') {
            count = count.val;
          }
          arr = new Array();
          arr.count = count;
          arr.type = 'L' + cls.real_name;
          while (count-- > 0) {
            arr[count] = new JVM_Reference(0);
          }
          thread.allocate(arr, function(arrayref) {
            return frame.op_stack.push(arrayref);
          });
          return false;
        }, this);
        return false;
      });
      this[190] = new OpCode('arraylength', 'Get length of array', function(frame) {
        var arrayref;
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          return frame.op_stack.push(array.length);
        }, this);
        return false;
      });
      this[191] = new OpCode('athrow', 'Throw exception or error', function(frame) {
        var caught, objectref, _results;
        objectref = frame.op_stack.pop();
        if (this.isNull(ojectref)) {
          athrow("NullPointerException");
        }
        caught = false;
        _results = [];
        while (!caught) {
          thread.current_frame.att;
          thread.jvm_stack.pop();
          _results.push(thread.current_frame = thread.jvm_stack.peek());
        }
        return _results;
      });
      this[192] = new OpCode('checkcast', 'Check if object is of a given type', function(frame) {
        var clsindex, objectref;
        objectref = frame.op_stack.peek();
        clsindex = this.constructIndex(frame, thread);
        thread.getObject(objectref, function(S) {
          if (this.isNull(S)) {
            return true;
          }
          thread.resolveClass(clsindex, function(T) {
            if (T.real_name === S.cls.real_name) {
              frame.op_stack.push(objectref);
              return true;
              return athrow('ClassCastException');
            }
          }, this);
          return false;
        }, this);
        return false;
      });
      this[193] = new OpCode('instanceof', 'Check if object is an instance of class', function(frame) {
        var clsindex, objectref;
        objectref = frame.op_stack.pop();
        clsindex = this.fromCP(this.constructIndex(frame, thread), thread);
        thread.resolveClass(clsindex, function(cls) {
          thread.getObject(objectref, function(object) {
            if (cls.real_name === object.cls.real_name) {
              return frame.op_stack.push(1);
            } else {
              return frame.op_stack.push(0);
            }
          }, this);
          return false;
        }, this);
        return false;
      });
      this[194] = new OpCode('monitorenter', 'Enter monitor for object', function(frame) {
        var object;
        object = frame.op_stack.pop();
        thread.aquireLock(object);
        return false;
      });
      this[195] = new OpCode('monitorexit', '', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        thread.releaseLock(objectref);
        return false;
      });
      this[196] = new OpCode('wide', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[197] = new OpCode('multianewarray', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[198] = new OpCode('ifnull', 'Branch if null', function(frame) {
        var branch, value;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        value = frame.op_stack.pop();
        if (this.isNull(value)) {
          frame.pc -= 3;
          frame.pc += branch.val;
        }
        return true;
      });
      this[199] = new OpCode('ifnonnull', 'Branch if non-null', function(frame) {
        var branch, value;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        value = frame.op_stack.pop();
        if (!this.isNull(value)) {
          frame.pc -= 3;
          frame.pc += branch.val;
        }
        return true;
      });
      this[200] = new OpCode('goto_w', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[201] = new OpCode('jsr_w', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[202] = new OpCode('breakpoint', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[203] = new OpCode('', '', function(frame) {}, true);
      this[204] = new OpCode('', '', function(frame) {}, true);
      this[205] = new OpCode('', '', function(frame) {}, true);
      this[206] = new OpCode('', '', function(frame) {}, true);
      this[207] = new OpCode('', '', function(frame) {}, true);
      this[208] = new OpCode('', '', function(frame) {}, true);
      this[209] = new OpCode('', '', function(frame) {}, true);
      this[210] = new OpCode('', '', function(frame) {}, true);
      this[211] = new OpCode('', '', function(frame) {}, true);
      this[212] = new OpCode('', '', function(frame) {}, true);
      this[213] = new OpCode('', '', function(frame) {}, true);
      this[214] = new OpCode('', '', function(frame) {}, true);
      this[215] = new OpCode('', '', function(frame) {}, true);
      this[216] = new OpCode('', '', function(frame) {}, true);
      this[217] = new OpCode('', '', function(frame) {}, true);
      this[218] = new OpCode('', '', function(frame) {}, true);
      this[219] = new OpCode('', '', function(frame) {}, true);
      this[220] = new OpCode('', '', function(frame) {}, true);
      this[221] = new OpCode('', '', function(frame) {}, true);
      this[222] = new OpCode('', '', function(frame) {}, true);
      this[223] = new OpCode('', '', function(frame) {}, true);
      this[224] = new OpCode('', '', function(frame) {}, true);
      this[225] = new OpCode('', '', function(frame) {}, true);
      this[226] = new OpCode('', '', function(frame) {}, true);
      this[227] = new OpCode('', '', function(frame) {}, true);
      this[228] = new OpCode('', '', function(frame) {}, true);
      this[229] = new OpCode('', '', function(frame) {}, true);
      this[230] = new OpCode('', '', function(frame) {}, true);
      this[231] = new OpCode('', '', function(frame) {}, true);
      this[232] = new OpCode('', '', function(frame) {}, true);
      this[233] = new OpCode('', '', function(frame) {}, true);
      this[234] = new OpCode('', '', function(frame) {}, true);
      this[235] = new OpCode('', '', function(frame) {}, true);
      this[236] = new OpCode('', '', function(frame) {}, true);
      this[237] = new OpCode('', '', function(frame) {}, true);
      this[238] = new OpCode('', '', function(frame) {}, true);
      this[239] = new OpCode('', '', function(frame) {}, true);
      this[240] = new OpCode('', '', function(frame) {}, true);
      this[241] = new OpCode('', '', function(frame) {}, true);
      this[242] = new OpCode('', '', function(frame) {}, true);
      this[243] = new OpCode('', '', function(frame) {}, true);
      this[244] = new OpCode('', '', function(frame) {}, true);
      this[245] = new OpCode('', '', function(frame) {}, true);
      this[246] = new OpCode('', '', function(frame) {}, true);
      this[247] = new OpCode('', '', function(frame) {}, true);
      this[248] = new OpCode('', '', function(frame) {}, true);
      this[249] = new OpCode('', '', function(frame) {}, true);
      this[250] = new OpCode('', '', function(frame) {}, true);
      this[251] = new OpCode('', '', function(frame) {}, true);
      this[252] = new OpCode('', '', function(frame) {}, true);
      this[253] = new OpCode('', '', function(frame) {}, true);
      this[254] = new OpCode('impdep1', '', function(frame) {}, true);
      this[255] = new OpCode('impdep2', '', function(frame) {}, true);
    }
    return OpCodes;
  })();
  OpCode = (function() {
    function OpCode(mnemonic, description, _do) {
      this.mnemonic = mnemonic;
      this.description = description;
      this["do"] = _do;
      this;
    }
    OpCode.prototype.isNull = function(objectref) {
      return objectref === null || objectref === void 0 || objectref.pointer === 0;
    };
    OpCode.prototype.getIndexByte = function(index, frame, thread) {
      index = frame.method_stack[frame.pc + index];
      frame.pc++;
      return index;
    };
    OpCode.prototype.fromCP = function(index, thread) {
      var item;
      item = thread.current_class.constant_pool[index];
      while (typeof item === 'number') {
        item = thread.current_class.constant_pool[item];
      }
      return item;
    };
    OpCode.prototype.constructIndex = function(frame, thread) {
      var indexbyte1, indexbyte2;
      indexbyte1 = this.getIndexByte(1, frame, thread);
      indexbyte2 = this.getIndexByte(1, frame, thread);
      return indexbyte1 << 8 | indexbyte2;
    };
    OpCode.prototype.fromHeap = function(ref, thread) {
      return thread.getObject(ref);
    };
    OpCode.prototype.athrow = function(exception) {
      throw exception;
    };
    return OpCode;
  })();
  this.InternalJNI = (function() {
    function InternalJNI(JVM) {
      this.JVM = JVM;
    }
    InternalJNI.prototype.RegisterNatives = function(jclass, methods) {
      var method, name, _results;
      _results = [];
      for (name in methods) {
        method = methods[name];
        _results.push(jclass.methods[name] = this.JVM[method]);
      }
      return _results;
    };
    InternalJNI.prototype.GetObjectClass = function() {};
    return InternalJNI;
  })();
  this.Settings = {
    classpath: 'compiler/',
    workerpath: 'jvm/workers'
  };
  this.required_classes_length = 5;
  this.ClassLoader = (function() {
    ClassLoader.prototype.classReader = 1;
    ClassLoader.prototype.stack = new Array;
    ClassLoader.prototype.ps_id = 0;
    ClassLoader.prototype.required_classes = ['java/lang/Class', 'java/lang/String', 'java/lang/System', 'javascript/io/JavaScriptPrintStream'];
    ClassLoader.prototype.initNum = 0;
    ClassLoader.prototype.initcb = 0;
    ClassLoader.prototype.loaded_classes = {};
    /*
      Constructor 
      Set runtime data area and grab console from global scope
      */
    function ClassLoader(initcb, initDone) {
      this.initcb = initcb;
      this.initDone = initDone;
      this.init = __bind(this.init, this);
      this.console = {
        debug: function(message) {
          return console.log(message);
        },
        print: function(message) {
          return console.log(message);
        }
      };
    }
    /*
        To be called on instanstiation.
        Seperate to Constructor so that the JVM can resolve required classes and 
        their native counterparts. 
      */
    ClassLoader.prototype.init = function() {
      var cls;
      cls = this.required_classes[this.initNum];
      if (cls) {
        this.initNum++;
        this.initcb(this.find(cls), this.init);
      } else {
        this.initDone();
      }
      return true;
    };
    ClassLoader.prototype.findNative = function(name) {
      var req, _native;
      _native = null;
      req = new XMLHttpRequest();
      req.open('GET', Settings.classpath + "/" + name + ".js", false);
      req.send(null);
      if (req.status === 200) {
        try {
          eval("_native = (" + req.responseText + ")");
        } catch (err) {
          console.log("" + name);
          throw err;
        }
        _native = new _native();
        return _native;
      } else {
        throw 'NoClassDefFoundError';
      }
    };
    /*
      Finds a class on the classpath
      */
    ClassLoader.prototype.find = function(class_name) {
      var classReader, req, _class;
      if ((this.loaded_classes[class_name] != null)) {
        return this.loaded_classes[class_name];
      }
      if (typeof class_name === 'undefined') {
        return;
      }
      req = new XMLHttpRequest();
      req.open('GET', "" + Settings.classpath + "/rt/" + class_name + ".class", false);
      req.overrideMimeType('text/plain; charset=x-user-defined');
      req.send(null);
      if (req.status !== 200) {
        req.open('GET', "" + Settings.classpath + "/" + class_name + ".class", false);
        req.overrideMimeType('text/plain; charset=x-user-defined');
        req.send(null);
        if (req.status !== 200) {
          throw 'NoClassDefFoundError';
        }
      }
      classReader = new ClassReader(req.responseText);
      _class = classReader.parse();
      _class.constant_pool[_class.super_class] = this.find(_class.get_super(), false);
      this.loaded_classes[_class.get_name()] = _class;
      return _class;
    };
    return ClassLoader;
  })();
  /*
  ClassReader
  */
  ClassReader = (function() {
    function ClassReader(stream) {
      this.binaryReader = new jDataView(stream);
      this.binaryReader._littleEndian = false;
      this.console = {
        debug: function() {
          return true;
        },
        writeConstant: function() {
          return true;
        }
      };
    }
    ClassReader.prototype.parse = function() {
      var _class;
      _class = new CONSTANT_Class();
      this.parseClassVars(_class);
      this.parseConstantPool(_class);
      this.parseFileVars(_class);
      this.parseInterfaces(_class);
      this.parseFields(_class);
      this.parseMethods(_class);
      return _class;
    };
    ClassReader.prototype.read = function(length) {
      switch (length) {
        case 1:
          return this.binaryReader.getUint8();
        case 2:
          return this.binaryReader.getUint16();
        case 4:
          return this.binaryReader.getUint32();
        default:
          return this.binaryReader.seek(this.binaryReader.tell() + length);
      }
    };
    ClassReader.prototype.readDouble = function() {
      return this.binaryReader.getFloat32();
    };
    ClassReader.prototype.readString = function(length) {
      return this.binaryReader.getString(length);
    };
    ClassReader.prototype.readTag = function() {
      return this.read(1);
    };
    ClassReader.prototype.readConstant = function(tag) {
      switch (tag) {
        case 1:
          return this.readString(this.read(2));
        case 3:
          return new CONSTANT_integer(this.binaryReader.getUint32());
        case 4:
          return new CONSTANT_float(this.binaryReader.getUint32());
        case 5:
          return new CONSTANT_long(this.binaryReader.getFloat64());
        case 6:
          return new CONSTANT_double(this.binaryReader.getFloat64());
        case 7:
          return this.read(2);
        case 8:
          return new CONSTANT_Stringref(this.read(2));
        case 9:
          return new CONSTANT_Fieldref_info(this.read(2), this.read(2));
        case 10:
          return new CONSTANT_Methodref_info(this.read(2), this.read(2));
        case 12:
          return new CONSTANT_NameAndType_info(this.read(2), this.read(2));
        case 11:
          return this.read(4);
        default:
          throw "UnknownConstantException, Offset : " + this.binaryReader.tell();
      }
    };
    ClassReader.prototype.parseClassVars = function(_class) {
      var valid;
      this.console.debug('magic number: ' + (_class.magic_number = this.read(4)), 2);
      valid = _class.magic_number.toString(16) & 0xCAFEBABE;
      if (valid !== 0) {
        alert("Not JavaClass");
      }
      this.console.debug('minor version: ' + (_class.minor_version = this.read(2)), 2);
      this.console.debug('major version: ' + (_class.major_version = this.read(2)), 2);
      return true;
    };
    ClassReader.prototype.parseConstantPool = function(_class) {
      var constant, i, tag;
      _class.constant_pool_count = this.read(2);
      i = 0;
      this.console.debug("Constant Pool Count : " + _class.constant_pool_count, 2);
      while (++i < _class.constant_pool_count) {
        tag = this.readTag();
        constant = this.readConstant(tag);
        _class.constant_pool[i] = constant;
        this.console.writeConstant(i, tag, constant, 2);
        if (tag === 5 || tag === 6) {
          i++;
        } else if (tag === 7) {
          if (constant !== _class.this_class) {
            _class.dependancies.push(constant);
          }
        }
      }
      return true;
    };
    ClassReader.prototype.parseFileVars = function(_class) {
      this.console.debug('access flags: ' + (_class.access_flags = this.read(2)), 2);
      this.console.debug('this class: ' + (_class.this_class = this.read(2)), 2);
      _class.super_class = this.read(2);
      this.console.debug('super class: ' + _class.super_class, 2);
      _class.real_name = _class.constant_pool[_class.constant_pool[_class.this_class]];
      return true;
    };
    ClassReader.prototype.parseInterfaces = function(_class) {
      var i;
      this.console.debug('interface count: ' + (_class.interfaces_count = this.read(2)), 2);
      i = -1;
      while (++i < _class.interfaces_count) {
        this.console.debug(_class.interfaces[i] = this.read(2), 2);
      }
      return true;
    };
    ClassReader.prototype.parseFields = function(_class) {
      var field, i;
      this.console.debug('fields count: ' + (_class.fields_count = this.read(2)), 2);
      i = -1;
      while (++i < _class.fields_count) {
        field = this.readFieldInfo(_class);
        _class.fields[field[1].real_name] = field[0];
      }
      return true;
    };
    ClassReader.prototype.parseMethods = function(_class) {
      var i, method;
      this.console.debug('method count: ' + (_class.method_count = this.read(2)), 2);
      i = -1;
      while (++i < _class.method_count) {
        method = this.readMethodInfo(_class);
        _class.methods[i] = method;
      }
      return true;
    };
    ClassReader.prototype.parseAttributes = function(_class) {
      return _class.attributes_count(this.read(2));
    };
    ClassReader.prototype.readMethodInfo = function(_class) {
      var attr, i, method_info;
      method_info = {};
      this.console.debug('  access flags: ' + (method_info.access_flags = this.read(2)), 2);
      this.console.debug('  name index: ' + (method_info.name_index = this.read(2)), 2);
      method_info.name = _class.constant_pool[method_info.name_index];
      this.console.debug('  descriptor index: ' + (method_info.descriptor_index = this.read(2)), 2);
      this.console.debug('  atrribute count: ' + (method_info.attribute_count = this.read(2)), 2);
      method_info.attributes = new Array(method_info.attribute_count);
      i = 0;
      while (i++ < method_info.attribute_count) {
        attr = this.readAttribute(_class);
        method_info.attributes[attr.real_name] = attr;
      }
      return method_info;
    };
    ClassReader.prototype.readAttribute = function(_class) {
      var attribute_length, attribute_name, real_name;
      attribute_name = this.read(2);
      attribute_length = this.read(4);
      real_name = _class.constant_pool[attribute_name];
      this.console.debug('    attribute name: ' + real_name, 2);
      this.console.debug('    attribute length: ' + attribute_length, 2);
      if (real_name === 'Code') {
        return this.readCodeAttribute(_class, attribute_name, attribute_length);
      } else {
        this.read(attribute_length);
        return {};
      }
    };
    ClassReader.prototype.readCodeAttribute = function(_class, name_index, length) {
      var code_attribute, code_length, i;
      code_attribute = {};
      code_attribute.attribute_name_index = name_index;
      code_attribute.real_name = _class.constant_pool[name_index];
      code_attribute.attribute_length = length;
      code_attribute.max_stack = this.read(2);
      code_attribute.max_locals = this.read(2);
      code_attribute.code_length = this.read(4);
      code_attribute.code = {};
      code_length = code_attribute.code_length;
      i = -1;
      while (++i < code_length) {
        this.console.debug('      ' + (code_attribute.code[i] = this.read(1)), 2);
      }
      code_attribute.exception_table_length = this.read(2);
      this.read(code_attribute.exception_table_length * 8);
      code_attribute.attributes_count = this.read(2);
      code_attribute.attributes = new Array(code_attribute.attributes_count);
      i = -1;
      while (++i < code_attribute.attributes_count) {
        code_attribute.attributes[i] = this.readAttribute(_class);
      }
      return code_attribute;
    };
    ClassReader.prototype.readFieldInfo = function(_class) {
      var c, descriptor, field_info, i;
      field_info = {};
      this.console.debug('  access flags: ' + (field_info.access_flags = this.read(2)), 2);
      this.console.debug('  name index: ' + (field_info.name_index = this.read(2)), 2);
      this.console.debug('  descriptor index: ' + (field_info.descriptor_index = this.read(2)), 2);
      this.console.debug('  atrribute count: ' + (field_info.attribute_count = this.read(2)), 2);
      field_info.attributes = new Array(field_info.attribute_count);
      field_info.real_name = _class.constant_pool[field_info.name_index];
      i = 0;
      while (i++ < field_info.attribute_count) {
        field_info.attributes[i] = this.readAttribute(_class);
      }
      descriptor = _class.constant_pool[field_info.descriptor_index];
      if (descriptor === 'I') {
        c = new CONSTANT_integer();
      }
      if (descriptor === 'J') {
        c = new CONSTANT_long();
      }
      if (descriptor === 'F') {
        c = new CONSTANT_float();
      }
      if (descriptor === 'D') {
        c = new CONSTANT_double();
      }
      if (descriptor === 'S') {
        c = new CONSTANT_short();
      }
      if (descriptor === 'Z') {
        c = new CONSTANT_boolean();
      }
      if (descriptor === 'C') {
        c = new CONSTANT_char();
      }
      if (descriptor === 'B') {
        c = new CONSTANT_byte();
      }
      if (descriptor.charAt(0) === 'L') {
        c = new JVM_Reference(0);
      }
      if (descriptor.charAt(0) === '[') {
        c = new JVM_Reference(0);
      }
      return [c, field_info];
    };
    return ClassReader;
  })();
  /*
  Represents a Java Class file. Also provides Class verification methods.
  @returns {JavaClass}
  */
  this.CONSTANT_Class = (function() {
    __extends(CONSTANT_Class, JVM_Object);
    function CONSTANT_Class() {
      this.magic_number = 0;
      this.minor_version = 0;
      this.major_version = 0;
      this.constant_pool_count = 0;
      this.constant_pool = [];
      this.access_flags = 0;
      this.this_class = 0;
      this.super_class = 0;
      this.interfaces_count = 0;
      this.interfaces = [];
      this.fields_count = 0;
      this.fields = {};
      this.methods_count = 0;
      this.methods = {};
      this.attributes_count = 0;
      this.attributes = [];
      this.dependancies = [];
      this.real_name = 'None';
    }
    CONSTANT_Class.prototype.get_super = function() {
      var cls;
      cls = this.constant_pool[this.super_class];
      while (typeof cls === 'number') {
        cls = this.constant_pool[cls];
      }
      return cls;
    };
    CONSTANT_Class.prototype.get_name = function() {
      var super_ref;
      super_ref = this.constant_pool[this.this_class];
      return this.constant_pool[super_ref];
    };
    CONSTANT_Class.prototype.set_method_count = function(count) {
      this.methods_count = parseInt(count, 16);
      this.methods = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_constant_pool_count = function(count) {
      this.constant_pool_count = parseInt(count, 16);
      this.constant_pool = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_interfaces_count = function(count) {
      this.interfaces_count = parseInt(count, 16);
      this.interfaces = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_fields_count = function(count) {
      this.fields_count = parseInt(count, 16);
      this.fields = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_attributes_count = function(count) {
      this.attributes_count = parseInt(count, 16);
      this.attributes = new Array(parseInt(count, 16));
      return count;
    };
    return CONSTANT_Class;
  })();
  /*
  `
  compatibility = {
  ArrayBuffer: typeof ArrayBuffer !== 'undefined',
  DataView: typeof DataView !== 'undefined' && 'getFloat64' in DataView.prototype
  }
  
  jDataView = function (buffer, byteOffset, byteLength, littleEndian) {
  this._buffer = buffer;
  
  // Handle Type Errors
  if (!(compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) &&
  !(typeof buffer === 'string')) {
  throw new TypeError("Type error");
  }
  
  // Check parameters and existing functionnalities
  this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
  this._isDataView = compatibility.DataView && this._isArrayBuffer;
  
  // Default Values
  this._littleEndian = littleEndian === undefined ? true : littleEndian;
  
  var bufferLength = this._isArrayBuffer ? buffer.byteLength : buffer.length;
  if (byteOffset == undefined) {
  byteOffset = 0;
  }
  
  if (byteLength == undefined) {
  byteLength = bufferLength - byteOffset;
  }
  
  if (!this._isDataView) {
  // Do additional checks to simulate DataView
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (typeof byteLength !== 'number') {
  throw new TypeError("Type error");
  }
  if (typeof byteOffset < 0) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  if (typeof byteLength < 0) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  }
  
  // Instanciate
  if (this._isDataView) {
  this._view = new DataView(buffer, byteOffset, byteLength);
  this._start = 0;
  }
  this._start = byteOffset;
  if (byteOffset >= bufferLength) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  this._offset = 0;
  this.length = byteLength;
  };
  
  jDataView.createBuffer = function () {
  if (typeof ArrayBuffer !== 'undefined') {
  var buffer = new ArrayBuffer(arguments.length);
  var view = new Int8Array(buffer);
  for (var i = 0; i < arguments.length; ++i) {
  view[i] = arguments[i];
  }
  return buffer;
  }
  
  return String.fromCharCode.apply(null, arguments);
  };
  
  jDataView.prototype = {
  
  // Helpers
  
  getString: function (length, byteOffset) {
  var value;
  
  // Handle the lack of byteOffset
  if (byteOffset === undefined) {
  byteOffset = this._offset;
  }
  
  // Error Checking
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (length < 0 || byteOffset + length > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  if (this._isArrayBuffer) {
  // Use Int8Array and String.fromCharCode to extract a string
  var int8array = new Int8Array(this._buffer, this._start + byteOffset, length);
  var stringarray = [];
  for (var i = 0; i < length; ++i) {
  stringarray[i] = int8array[i];
  }
  value = String.fromCharCode.apply(null, stringarray);
  } else {
  value = this._buffer.substr(this._start + byteOffset, length);
  }
  
  this._offset = byteOffset + length;
  return value;
  },
  
  getChar: function (byteOffset) {
  var value, size = 1;
  
  // Handle the lack of byteOffset
  if (byteOffset === undefined) {
  byteOffset = this._offset;
  }
  
  if (this._isArrayBuffer) {
  // Use Int8Array and String.fromCharCode to extract a string
  value = String.fromCharCode(this.getUint8(byteOffset));
  } else {
  // Error Checking
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (byteOffset + size > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  value = this._buffer.charAt(this._start + byteOffset);
  this._offset = byteOffset + size;
  }
  
  return value;
  },
  
  tell: function () {
  return this._offset;
  },
  
  seek: function (byteOffset) {
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (byteOffset < 0 || byteOffset > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  this._offset = byteOffset;
  },
  
  // Compatibility functions on a String Buffer
  
  _endianness: function (offset, pos, max, littleEndian) {
  return offset + (littleEndian ? max - pos - 1 : pos);
  },
  
  _getFloat64: function (offset, littleEndian) {
  var b0 = this._getUint8(this._endianness(offset, 0, 8, littleEndian)),
  b1 = this._getUint8(this._endianness(offset, 1, 8, littleEndian)),
  b2 = this._getUint8(this._endianness(offset, 2, 8, littleEndian)),
  b3 = this._getUint8(this._endianness(offset, 3, 8, littleEndian)),
  b4 = this._getUint8(this._endianness(offset, 4, 8, littleEndian)),
  b5 = this._getUint8(this._endianness(offset, 5, 8, littleEndian)),
  b6 = this._getUint8(this._endianness(offset, 6, 8, littleEndian)),
  b7 = this._getUint8(this._endianness(offset, 7, 8, littleEndian)),
  
  sign = 1 - (2 * (b0 >> 7)),
  exponent = ((((b0 << 1) & 0xff) << 3) | (b1 >> 4)) - (Math.pow(2, 10) - 1),
  
  // Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
  mantissa = ((b1 & 0x0f) * Math.pow(2, 48)) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32))
  + (b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;
  
  if (mantissa == 0 && exponent == -(Math.pow(2, 10) - 1)) {
  return 0.0;
  }
  
  if (exponent == -1023) { // Denormalized
  return sign * mantissa * Math.pow(2, -1022 - 52);
  }
  
  return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
  },
  
  _getFloat32: function (offset, littleEndian) {
  var b0 = this._getUint8(this._endianness(offset, 0, 4, littleEndian)),
  b1 = this._getUint8(this._endianness(offset, 1, 4, littleEndian)),
  b2 = this._getUint8(this._endianness(offset, 2, 4, littleEndian)),
  b3 = this._getUint8(this._endianness(offset, 3, 4, littleEndian)),
  
  sign = 1 - (2 * (b0 >> 7)),
  exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127,
  mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
  return 0.0;
  }
  
  if (exponent == -127) { // Denormalized
  return sign * mantissa * Math.pow(2, -126 - 23);
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  },
  
  _getInt32: function (offset, littleEndian) {
  var b = this._getUint32(offset, littleEndian);
  return b > Math.pow(2, 31) - 1 ? b - Math.pow(2, 32) : b;
  },
  
  _getUint32: function (offset, littleEndian) {
  var b3 = this._getUint8(this._endianness(offset, 0, 4, littleEndian)),
  b2 = this._getUint8(this._endianness(offset, 1, 4, littleEndian)),
  b1 = this._getUint8(this._endianness(offset, 2, 4, littleEndian)),
  b0 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));
  
  return (b3 * Math.pow(2, 24)) + (b2 << 16) + (b1 << 8) + b0;
  },
  
  _getInt16: function (offset, littleEndian) {
  var b = this._getUint16(offset, littleEndian);
  return b > Math.pow(2, 15) - 1 ? b - Math.pow(2, 16) : b;
  },
  
  _getUint16: function (offset, littleEndian) {
  var b1 = this._getUint8(this._endianness(offset, 0, 2, littleEndian)),
  b0 = this._getUint8(this._endianness(offset, 1, 2, littleEndian));
  
  return (b1 << 8) + b0;
  },
  
  _getInt8: function (offset) {
  var b = this._getUint8(offset);
  return b > Math.pow(2, 7) - 1 ? b - Math.pow(2, 8) : b;
  },
  
  _getUint8: function (offset) {
  if (this._isArrayBuffer) {
  return new Uint8Array(this._buffer, this._start + offset, 1)[0];
  } else {
  return this._buffer.charCodeAt(this._start + offset) & 0xff;
  }
  }
  };
  
  // Create wrappers
  
  var dataTypes = {
  'Int8': 1,
  'Int16': 2,
  'Int32': 4,
  'Uint8': 1,
  'Uint16': 2,
  'Uint32': 4,
  'Float32': 4,
  'Float64': 8
  };
  
  for (var type in dataTypes) {
  // Bind the variable type
  (function (type) {
  var size = dataTypes[type];
  
  // Create the function
  jDataView.prototype['get' + type] = 
  function (byteOffset, littleEndian) {
  var value;
  
  // Handle the lack of endianness
  if (littleEndian == undefined) {
  littleEndian = this._littleEndian;
  }
  
  // Handle the lack of byteOffset
  if (byteOffset === undefined) {
  byteOffset = this._offset;
  }
  
  // Dispatch on the good method
  if (this._isDataView) {
  // DataView: we use the direct method
  value = this._view['get' + type](byteOffset, littleEndian);
  }
  // ArrayBuffer: we use a typed array of size 1 if the alignment is good
  // ArrayBuffer does not support endianess flag (for size > 1)
  else if (this._isArrayBuffer && byteOffset % size == 0 && (size == 1 || littleEndian)) {
  value = new self[type + 'Array'](this._buffer, byteOffset, 1)[0];
  }
  else {
  // Error Checking
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (byteOffset + size > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  value = this['_get' + type](this._start + byteOffset, littleEndian);
  }
  
  // Move the internal offset forward
  this._offset = byteOffset + size;
  
  return value;
  };
  })(type);
  }`*/
  compatibility = {
    ArrayBuffer: typeof ArrayBuffer !== "undefined",
    DataView: typeof DataView !== "undefined" && "getFloat64" in DataView.prototype
  };
  jDataView = function(buffer, byteOffset, byteLength, littleEndian) {
    var bufferLength;
    this._buffer = buffer;
    if (!(compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) && (typeof buffer !== "string")) {
      throw new TypeError("Type error");
    }
    this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
    this._isDataView = compatibility.DataView && this._isArrayBuffer;
    this._littleEndian = (littleEndian === undefined ? true : littleEndian);
    bufferLength = (this._isArrayBuffer ? buffer.byteLength : buffer.length);
    if (byteOffset === undefined) {
      byteOffset = 0;
    }
    if (byteLength === undefined) {
      byteLength = bufferLength - byteOffset;
    }
    if (!this._isDataView) {
      if (typeof byteOffset !== "number") {
        throw new TypeError("Type error");
      }
      if (typeof byteLength !== "number") {
        throw new TypeError("Type error");
      }
      if (typeof byteOffset < 0) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
      if (typeof byteLength < 0) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
    }
    if (this._isDataView) {
      this._view = new DataView(buffer, byteOffset, byteLength);
      this._start = 0;
    }
    this._start = byteOffset;
    if (byteOffset >= bufferLength) {
      throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
    }
    this._offset = 0;
    return this.length = byteLength;
  };
  jDataView.createBuffer = function() {
    var buffer, i, view;
    if (typeof ArrayBuffer !== "undefined") {
      buffer = new ArrayBuffer(arguments.length);
      view = new Int8Array(buffer);
      i = 0;
      while (i < arguments.length) {
        view[i] = arguments[i];
        ++i;
      }
      return buffer;
    }
    return String.fromCharCode.apply(null, arguments);
  };
  jDataView.prototype = {
    getString: function(length, byteOffset) {
      var i, int8array, stringarray, value;
      value = void 0;
      if (byteOffset === undefined) {
        byteOffset = this._offset;
      }
      if (typeof byteOffset !== "number") {
        throw new TypeError("Type error");
      }
      if (length < 0 || byteOffset + length > this.length) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
      if (this._isArrayBuffer) {
        int8array = new Int8Array(this._buffer, this._start + byteOffset, length);
        stringarray = [];
        i = 0;
        while (i < length) {
          stringarray[i] = int8array[i];
          ++i;
        }
        value = String.fromCharCode.apply(null, stringarray);
      } else {
        value = this._buffer.substr(this._start + byteOffset, length);
      }
      this._offset = byteOffset + length;
      return value;
    },
    getChar: function(byteOffset) {
      var size, value;
      value = void 0;
      size = 1;
      if (byteOffset === undefined) {
        byteOffset = this._offset;
      }
      if (this._isArrayBuffer) {
        value = String.fromCharCode(this.getUint8(byteOffset));
      } else {
        if (typeof byteOffset !== "number") {
          throw new TypeError("Type error");
        }
        if (byteOffset + size > this.length) {
          throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
        }
        value = this._buffer.charAt(this._start + byteOffset);
        this._offset = byteOffset + size;
      }
      return value;
    },
    tell: function() {
      return this._offset;
    },
    seek: function(byteOffset) {
      if (typeof byteOffset !== "number") {
        throw new TypeError("Type error");
      }
      if (byteOffset < 0 || byteOffset > this.length) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
      return this._offset = byteOffset;
    },
    _endianness: function(offset, pos, max, littleEndian) {
      return offset + (littleEndian ? max - pos - 1 : pos);
    },
    _getFloat64: function(offset, littleEndian) {
      var b0, b1, b2, b3, b4, b5, b6, b7, exponent, mantissa, sign;
      b0 = this._getUint8(this._endianness(offset, 0, 8, littleEndian));
      b1 = this._getUint8(this._endianness(offset, 1, 8, littleEndian));
      b2 = this._getUint8(this._endianness(offset, 2, 8, littleEndian));
      b3 = this._getUint8(this._endianness(offset, 3, 8, littleEndian));
      b4 = this._getUint8(this._endianness(offset, 4, 8, littleEndian));
      b5 = this._getUint8(this._endianness(offset, 5, 8, littleEndian));
      b6 = this._getUint8(this._endianness(offset, 6, 8, littleEndian));
      b7 = this._getUint8(this._endianness(offset, 7, 8, littleEndian));
      sign = 1 - (2 * (b0 >> 7));
      exponent = (((b0 << 1) & 0xff) << 3) | (b1 >> 4) - (Math.pow(2, 10) - 1);
      mantissa = (b1 & 0x0f) * Math.pow(2, 48) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32)) + (b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;
      if (mantissa === 0 && exponent === -(Math.pow(2, 10) - 1)) {
        return 0.0;
      }
      if (exponent === -1023) {
        return sign * mantissa * Math.pow(2, -1022 - 52);
      }
      return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
    },
    _getFloat32: function(offset, littleEndian) {
      var b0, b1, b2, b3, exponent, mantissa, sign;
      b0 = this._getUint8(this._endianness(offset, 0, 4, littleEndian));
      b1 = this._getUint8(this._endianness(offset, 1, 4, littleEndian));
      b2 = this._getUint8(this._endianness(offset, 2, 4, littleEndian));
      b3 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));
      sign = 1 - (2 * (b0 >> 7));
      exponent = ((b0 << 1) & 0xff) | (b1 >> 7) - 127;
      mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;
      if (mantissa === 0 && exponent === -127) {
        return 0.0;
      }
      if (exponent === -127) {
        return sign * mantissa * Math.pow(2, -126 - 23);
      }
      return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
    },
    _getInt32: function(offset, littleEndian) {
      var b;
      b = this._getUint32(offset, littleEndian);
      if (b > Math.pow(2, 31) - 1) {
        return b - Math.pow(2, 32);
      } else {
        return b;
      }
    },
    _getUint32: function(offset, littleEndian) {
      var b0, b1, b2, b3;
      b3 = this._getUint8(this._endianness(offset, 0, 4, littleEndian));
      b2 = this._getUint8(this._endianness(offset, 1, 4, littleEndian));
      b1 = this._getUint8(this._endianness(offset, 2, 4, littleEndian));
      b0 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));
      return (b3 * Math.pow(2, 24)) + (b2 << 16) + (b1 << 8) + b0;
    },
    _getInt16: function(offset, littleEndian) {
      var b;
      b = this._getUint16(offset, littleEndian);
      if (b > Math.pow(2, 15) - 1) {
        return b - Math.pow(2, 16);
      } else {
        return b;
      }
    },
    _getUint16: function(offset, littleEndian) {
      var b0, b1;
      b1 = this._getUint8(this._endianness(offset, 0, 2, littleEndian));
      b0 = this._getUint8(this._endianness(offset, 1, 2, littleEndian));
      return (b1 << 8) + b0;
    },
    _getInt8: function(offset) {
      var b;
      b = this._getUint8(offset);
      if (b > Math.pow(2, 7) - 1) {
        return b - Math.pow(2, 8);
      } else {
        return b;
      }
    },
    _getUint8: function(offset) {
      if (this._isArrayBuffer) {
        return new Uint8Array(this._buffer, this._start + offset, 1)[0];
      } else {
        return this._buffer.charCodeAt(this._start + offset) & 0xff;
      }
    }
  };
  dataTypes = {
    Int8: 1,
    Int16: 2,
    Int32: 4,
    Uint8: 1,
    Uint16: 2,
    Uint32: 4,
    Float32: 4,
    Float64: 8
  };
  _fn = function(type) {
    var size;
    size = dataTypes[type];
    return jDataView.prototype["get" + type] = function(byteOffset, littleEndian) {
      var value;
      value = void 0;
      if (littleEndian === undefined) {
        littleEndian = this._littleEndian;
      }
      if (byteOffset === undefined) {
        byteOffset = this._offset;
      }
      if (this._isDataView) {
        value = this._view["get" + type](byteOffset, littleEndian);
      } else if (this._isArrayBuffer && byteOffset % size === 0 && (size === 1 || littleEndian)) {
        value = new self[type + "Array"](this._buffer, byteOffset, 1)[0];
      } else {
        if (typeof byteOffset !== "number") {
          throw new TypeError("Type error");
        }
        if (byteOffset + size > this.length) {
          throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
        }
        value = this["_get" + type](this._start + byteOffset, littleEndian);
      }
      this._offset = byteOffset + size;
      return value;
    };
  };
  for (type in dataTypes) {
    _fn(type);
  }
}).call(this);
