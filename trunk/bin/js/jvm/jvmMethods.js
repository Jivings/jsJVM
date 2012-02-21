(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
    return this.JVM_ResolveClass('javascript/io/JavaScriptOutputStream', __bind(function(outputStream) {
      var method, method_desc, method_id;
      method_id = '<init>';
      method_desc = '(Ljava/lang/String;)V';
      method = this.JVM_ResolveMethod(outputStream, method_id, method_desc);
      return this.JVM_ResolveStringLiteral('terminal', __bind(function(str) {
        return this.JVM_NewObject(outputStream, method, [str], __bind(function(outputStreamObj) {
          return this.JVM_ResolveClass('java/io/PrintStream', __bind(function(printStream) {
            method_desc = '(Ljava/io/OutputStream;)V';
            method = this.JVM_ResolveMethod(printStream, method_id, method_desc);
            return this.JVM_NewObject(printStream, method, [outputStreamObj], __bind(function(printStreamObj) {
              this.JVM_ExecuteNativeMethod('native/java/lang/System', 'setOut0', [cls, printStreamObj]);
              return initDone();
            }, this));
          }, this));
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
  JVM.prototype.JVM_ArrayCopy = function(env, ignoredClass, length, dstPos, destObj, srcPos, srcObj) {
    var arr, ch, dest, destPos, index, src;
    src = env.JVM_FromHeap(srcObj);
    arr = src.slice(srcPos.valueOf(), srcPos.valueOf() + length.valueOf());
    dest = env.JVM_FromHeap(destObj);
    destPos = dstPos.valueOf();
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
      var charArray, index, method, method_desc, method_id, stringobj;
      method_id = '<init>';
      method_desc = '()V';
      method = this.JVM_ResolveMethod(cls, method_id, method_desc);
      if (!this.JVM_InternedStrings[literal]) {
        console.log('Interning a string ("' + literal + '")');
        charArray = new Array();
        for (index in literal) {
          charArray[index] = literal[index];
        }
        charArray = this.RDA.heap.allocate(charArray);
        return stringobj = this.JVM_NewObject(cls, method, [], __bind(function() {
          stringobj.count = literal.length;
          stringobj.value = charArray;
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
}).call(this);
