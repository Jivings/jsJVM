(function() {
  var JVM_Number;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  this.JVM_Object = (function() {
    function JVM_Object(cls) {
      var field, fld;
      this.cls = cls;
      this.fields = {};
      for (field in this.cls.fields) {
        fld = this.cls.fields[field];
        this.fields[fld.info.real_name] = fld;
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
    __extends(CONSTANT_Integer, JVM_Number);
    function CONSTANT_Integer(val) {
      if (val == null) {
        val = 0;
      }
      CONSTANT_Integer.__super__.constructor.call(this, val);
    }
    return CONSTANT_Integer;
  })();
  this.CONSTANT_Float = (function() {
    __extends(CONSTANT_Float, JVM_Number);
    function CONSTANT_Float(val) {
      if (val == null) {
        val = 0.0;
      }
      CONSTANT_Float.__super__.constructor.call(this, val);
    }
    return CONSTANT_Float;
  })();
  this.CONSTANT_Long = (function() {
    __extends(CONSTANT_Long, JVM_Number);
    function CONSTANT_Long(val) {
      if (val == null) {
        val = 0;
      }
      CONSTANT_Long.__super__.constructor.call(this, val);
    }
    return CONSTANT_Long;
  })();
  this.CONSTANT_Double = (function() {
    __extends(CONSTANT_Double, JVM_Number);
    function CONSTANT_Double(val) {
      if (val == null) {
        val = 0.0;
      }
      CONSTANT_Double.__super__.constructor.call(this, val);
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
      this.value = value != null ? value : 0;
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
  JVM.prototype.GetStaticFieldID = function(env, cls, fieldname, returnType) {
    return fieldname;
  };
  JVM.prototype.SetStaticObjectField = function(env, cls, fieldId, stream) {
    return cls.fields[fieldId].value = stream;
  };
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
}).call(this);
