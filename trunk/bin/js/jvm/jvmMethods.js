(function() {
  this.JVM_Object = (function() {
    function JVM_Object(cls) {
      var field, fld;
      this.cls = cls;
      this.fields = {};
      for (field in this.cls.fields) {
        fld = this.cls.fields[field];
        this.fields[fld.info.real_name] = fld.value;
      }
      this.methods = this.cls.methods;
    }
    return JVM_Object;
  })();
  this.JVM_Reference = (function() {
    function JVM_Reference(pointer) {
      this.pointer = pointer;
    }
    return JVM_Reference;
  })();
  this.CONSTANT_Array = (function() {
    function CONSTANT_Array(type) {
      this.type = type;
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
  this.CONSTANT_Integer = (function() {
    function CONSTANT_Integer(val) {
      if (val == null) {
        val = 0;
      }
      this.value = new Number(val);
    }
    return CONSTANT_Integer;
  })();
  this.CONSTANT_Float = (function() {
    function CONSTANT_Float(val) {
      if (val == null) {
        val = 0.0;
      }
      this.value = new Number(val);
    }
    return CONSTANT_Float;
  })();
  this.CONSTANT_Long = (function() {
    function CONSTANT_Long(val) {
      if (val == null) {
        val = 0;
      }
      this.value = new Number(val);
    }
    return CONSTANT_Long;
  })();
  this.CONSTANT_Double = (function() {
    function CONSTANT_Double(val) {
      if (val == null) {
        val = 0;
      }
      this.value = new Number(val);
    }
    return CONSTANT_Double;
  })();
  this.CONSTANT_Char = (function() {
    function CONSTANT_Char(value) {
      this.value = value != null ? value : '\u0000';
      this.value = this.value.charCodeAt();
    }
    return CONSTANT_Char;
  })();
  this.CONSTANT_Short = (function() {
    function CONSTANT_Short(value) {
      this.value = value != null ? value : 0;
    }
    return CONSTANT_Short;
  })();
  this.CONSTANT_Byte = (function() {
    function CONSTANT_Byte(value) {
      this.value = value != null ? value : 0;
    }
    return CONSTANT_Byte;
  })();
  this.CONSTANT_Boolean = (function() {
    function CONSTANT_Boolean(value) {
      this.value = value != null ? value : false;
    }
    return CONSTANT_Boolean;
  })();
  /* 
  Additional JVM functions exported from the main VM.
  Add support for native methods interacting with the VM.
  */
  JVM.prototype.RegisterNatives = function(env, jclass, methods) {
    var JVM_MethodName, name;
    for (name in methods) {
      JVM_MethodName = methods[name][1];
      jclass["native"][name] = JVM.prototype[JVM_MethodName];
    }
    return true;
  };
  JVM.prototype.Array = function() {
    var type;
    return type = "";
  };
  JVM.prototype.Reference = function() {
    var ref;
    return ref = 0;
  };
  JVM.prototype.JVM_IHashCode = function() {
    return true;
  };
  JVM.prototype.JVM_MonitorWait = function() {
    return true;
  };
  JVM.prototype.JVM_MonitorNotify = function() {
    return true;
  };
  JVM.prototype.JVM_MonitorNotifyAll = function() {
    return true;
  };
  JVM.prototype.JVM_Clone = function() {
    return true;
  };
  JVM.prototype.JVM_InternString = function(env, jstring) {};
  JVM.prototype.JVM_CurrentTimeMillis = function(env, ignoredJClass) {
    return new CONSTANT_Long(new Date().getTime());
  };
  JVM.prototype.JVM_NanoTime = function(env, ignoredJClass) {};
  JVM.prototype.JVM_ArrayCopy = function(env, ignoredClass, srcObj, srcPos, destObj, dstPos, length) {};
  JVM.prototype.JVM_InitProperties = function(env, jobject) {};
  JVM.prototype.JVM_OnExit = function(func) {};
  JVM.prototype.JVM_Exit = function(code) {};
  JVM.prototype.JVM_Halt = function(code) {};
  JVM.prototype.JVM_GC = function() {};
  /*
     Returns the number of real-time milliseconds that have elapsed since the
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
  JVM.prototype.JVM_MaxObjectInspectionAge = function() {};
  JVM.prototype.JVM_TraceInstructions = function(bool) {};
  JVM.prototype.JVM_TraceMethodCalls = function(bool) {};
  JVM.prototype.JVM_TotalMemory = function() {};
  JVM.prototype.JVM_FreeMemory = function() {};
  JVM.prototype.JVM_MaxMemory = function() {};
  JVM.prototype.JVM_ActiveProcessorCount = function() {};
  JVM.prototype.JVM_LoadLibrary = function(name) {};
  JVM.prototype.JVM_UnloadLibrary = function(handle) {};
  JVM.prototype.JVM_FindLibraryEntry = function(handle, name) {};
  JVM.prototype.JVM_IsSupportedJNIVersion = function(version) {};
  JVM.prototype.JVM_IsNaN = function(double) {
    return isNaN(double);
  };
  JVM.prototype.JVM_FillInStackTrace = function(env, throwable) {
    return console.log('filling in stacktrace!');
  };
  JVM.prototype.JVM_PrintStackTrace = function(env, throwable, printable) {};
  JVM.prototype.JVM_GetStackTraceDepth = function(env, throwable) {};
  JVM.prototype.JVM_GetStackTraceElement = function(env, throwable, index) {};
  JVM.prototype.JVM_StartThread = function(env, thread) {};
  JVM.prototype.JVM_StopThread = function(env, thread, exception) {};
  JVM.prototype.JVM_IsThreadAlive = function(env, thread) {};
  JVM.prototype.JVM_SuspendThread = function(env, thread) {};
  JVM.prototype.JVM_ResumeThread = function(env, thread) {};
  JVM.prototype.JVM_SetThreadPriority = function(env, thread, prio) {};
  JVM.prototype.JVM_Yield = function(env, threadClass) {};
  JVM.prototype.JVM_Sleep = function(env, threadClass, millis) {};
  JVM.prototype.JVM_CurrentThread = function(env, threadClass) {};
  JVM.prototype.JVM_CountStackFrames = function(env, thread) {};
  JVM.prototype.JVM_Interrupt = function(env, thread) {};
  JVM.prototype.JVM_IsInterrupted = function(env, thread, clearInterrupted) {};
  JVM.prototype.JVM_HoldsLock = function(env, threadClass, obj) {};
  JVM.prototype.JVM_DumpAllStacks = function(env, unused) {};
  JVM.prototype.JVM_GetAllThreads = function(env, dummy) {};
  JVM.prototype.JVM_DumpThreads = function(env, threadClass, threads) {};
  JVM.prototype.JVM_CurrentLoadedClass = function(env) {};
  JVM.prototype.JVM_CurrentClassLoader = function(env) {};
  JVM.prototype.JVM_GetClassContext = function(env) {};
  JVM.prototype.JVM_ClassDepth = function(env, name) {};
  JVM.prototype.JVM_ClassLoaderDepth = function(env) {};
  JVM.prototype.JVM_GetSystemPackage = function(env, name) {};
  JVM.prototype.JVM_GetSystemPackages = function(env) {};
  JVM.prototype.JVM_AllocateNewObject = function(env, obj, currClass, initClass) {};
  JVM.prototype.JVM_AllocateNewArray = function(env, obj, currClass, length) {};
  JVM.prototype.JVM_LatestUserDefinedLoader = function(env) {};
  JVM.prototype.JVM_GetArrayLength = function(env, arr) {};
  JVM.prototype.JVM_GetArrayElement = function(env, arr, index) {};
  JVM.prototype.JVM_GetPrimitiveArrayElement = function(env, arr, index, wCode) {};
  JVM.prototype.JVM_SetArrayElement = function(env, arr, index, val) {};
  JVM.prototype.JVM_SetPrimitiveArrayElement = function(env, arr, index, v, vCode) {};
  JVM.prototype.JVM_NewArray = function(env, eltClass, length) {};
  JVM.prototype.JVM_NewMultiArray = function(env, eltClass, dim) {};
  /*
      java.lang.Class and java.lang.ClassLoader
     
      Returns the class in which the code invoking the native method
      belongs.
     
      Note that in JDK 1.1, native methods did not create a frame.
      In 1.2, they do. Therefore native methods like Class.forName
      can no longer look at the current frame for the caller class.
    */
  JVM.prototype.JVM_GetCallerClass = function(env, n) {};
  /*
     Find primitive classes
      utf: class name
    */
  JVM.prototype.JVM_FindPrimitiveClass = function(env, utf) {};
  JVM.prototype.JVM_ResolveClass = function(env, cls) {};
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
  JVM.prototype.JVM_FindClassFromClassLoader = function(env, name, init, loader, throwError) {};
  JVM.prototype.JVM_FindClassFromClass = function(env, name, init, from) {};
  JVM.prototype.JVM_FindLoadedClass = function(env, loader, name) {
    return this.RDA.method_area[name];
  };
  JVM.prototype.JVM_DefineClass = function(env, name, loader, buf, len, pd) {};
  JVM.prototype.JVM_DefineClassWithSource = function(env, name, loader, buf, len, pd, source) {};
  /*
      Reflection Support Functions
    */
  JVM.prototype.JVM_GetClassName = function(env, cls) {
    return cls.get_name();
  };
  JVM.prototype.JVM_GetClassInterfaces = function(env, cls) {};
  JVM.prototype.JVM_GetClassLoader = function(env, cls) {};
  JVM.prototype.JVM_IsInterface = function(env, cls) {};
  JVM.prototype.JVM_GetClassSigners = function(env, cls) {};
  JVM.prototype.JVM_SetClassSigners = function(env, cls, signers) {};
  JVM.prototype.JVM_GetProtectionDomain = function(env, cls) {};
  JVM.prototype.JVM_SetProtectionDomain = function(env, cls, protection_domain) {};
  JVM.prototype.JVM_IsArrayClass = function(env, cls) {};
  JVM.prototype.JVM_IsPrimitiveClass = function(env, cls) {};
  JVM.prototype.JVM_GetComponentType = function(env, cls) {};
  JVM.prototype.JVM_GetClassModifiers = function(env, cls) {};
  JVM.prototype.JVM_GetDeclaredClasses = function(env, ofClass) {};
  JVM.prototype.JVM_GetDeclaringClass = function(env, ofClass) {};
  JVM.prototype.JVM_RECOGNIZED_METHOD_MODIFIERS = {
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
  JVM.prototype.JVM_RECOGNIZED_CLASS_MODIFIERS = {
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
  JVM.prototype.JVM_RECOGNIZED_FIELD_MODIFIERS = {
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
  JVM.prototype.FIELD_DESCRIPTORS = {
    'B': CONSTANT_Byte,
    'C': CONSTANT_Char,
    'D': CONSTANT_Double,
    'F': CONSTANT_Float,
    'I': CONSTANT_Integer,
    'J': CONSTANT_Long,
    'L': CONSTANT_Class,
    'S': CONSTANT_Short,
    '[': CONSTANT_Array
  };
}).call(this);
