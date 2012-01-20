
  class this.JVM_Object
    constructor : (@cls) ->
      @fields = {}
      for field of @cls.fields
        fld = @cls.fields[field]
        @fields[fld.info.real_name] = fld
      @methods = @cls.methods
      
  class this.JVM_Reference
    constructor : (@pointer) ->
          
  class JVM_Number
    constructor : (@val) ->
    valueOf : () ->
      return @val
    
  class this.CONSTANT_Array
    constructor : (@type) ->
      
  class this.CONSTANT_Object
    constructor : (@classname) ->
      @value = null
      
  class this.CONSTANT_Integer extends JVM_Number
    constructor : (val = 0) ->
      super val    
      
  class this.CONSTANT_Float extends JVM_Number
    constructor : (val = 0.0) ->
      super val
      
  class this.CONSTANT_Long extends JVM_Number
    constructor : (val = 0) ->
      super val
  
  class this.CONSTANT_Double extends JVM_Number
    constructor : (val = 0.0) ->
      super val
  
  class this.CONSTANT_Char
    constructor : (@value = '\u0000') ->
      @value = @value.charCodeAt();
  
  class this.CONSTANT_Short
    constructor : (@value = 0) ->
    
  class this.CONSTANT_Byte 
    constructor : (@value = 0) ->
    
  class this.CONSTANT_Boolean
    constructor : (@value = 0) ->
         
  ### 
  Additional JVM functions exported from the main VM.
  Add support for native methods interacting with the VM.
  ###
  
  # Register Global JVM methods to jclass for runtime access.
  JVM::RegisterNatives = (env, jclass, methods) -> 
    for name of methods 
      JVM_MethodName = methods[name].name
      jclass[name] = JVM::[JVM_MethodName]
    yes
    
    
  # Our own Java Data Structures. These provide an extra 'type' var to allow 
  # our typeless language to still follow strict Java typing.
  
  JVM::Array = () ->
    type = ""
  
  JVM::Reference = () ->
    ref = 0
    
  # Objects

  JVM::JVM_IHashCode = () -> yes
  JVM::JVM_MonitorWait = () -> yes
  JVM::JVM_MonitorNotify = () -> yes
  JVM::JVM_MonitorNotifyAll = () -> yes
  JVM::JVM_Clone = () -> yes

  # java.lang.String

  JVM::JVM_InternString = (env, jstring) ->


  # java.lang.System

  JVM::JVM_CurrentTimeMillis = (env, ignoredJClass) ->
    return new CONSTANT_Long(new Date().getTime())
    
  JVM::JVM_NanoTime = (env, ignoredJClass) ->

  JVM::JVM_ArrayCopy = (env, ignoredClass, srcObj, srcPos, destObj, dstPos, length) ->

  JVM::JVM_InitProperties = (env, jobject) ->

  # java.io.File

  JVM::JVM_OnExit = (func) ->

  JVM::GetStaticFieldID = (env, cls, fieldname, returnType) ->
    # TODO should be a field id!
    return fieldname
    
  JVM::SetStaticObjectField = (env,cls,fieldId,stream) ->
    cls.fields[fieldId].value = stream

  # java.lang.Runtime

  JVM::JVM_Exit = (code) ->

  JVM::JVM_Halt = (code) ->

  JVM::JVM_GC = () ->

  ###
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
  ###

  JVM::JVM_MaxObjectInspectionAge = () ->

  JVM::JVM_TraceInstructions = (bool) ->

  JVM::JVM_TraceMethodCalls = (bool) ->

  JVM::JVM_TotalMemory = () ->

  JVM::JVM_FreeMemory = () ->

  JVM::JVM_MaxMemory = () ->

  JVM::JVM_ActiveProcessorCount = () ->

  JVM::JVM_LoadLibrary = (name) ->

  JVM::JVM_UnloadLibrary = (handle) ->

  JVM::JVM_FindLibraryEntry = (handle, name) ->

  JVM::JVM_IsSupportedJNIVersion = (version) ->


  # java.lang.Float and java.lang.Double

  JVM::JVM_IsNaN = (double) ->
    return isNaN(double)

  # java.lang.Throwable

  JVM::JVM_FillInStackTrace = (env, throwable) ->
    console.log('filling in stacktrace!')

  JVM::JVM_PrintStackTrace = (env, throwable, printable) ->

  JVM::JVM_GetStackTraceDepth = (env, throwable) ->

  JVM::JVM_GetStackTraceElement = (env, throwable, index) ->

  # java.lang.Thread

  JVM::JVM_StartThread = (env, thread) ->

  JVM::JVM_StopThread = (env, thread, exception) ->

  JVM::JVM_IsThreadAlive = (env, thread) ->

  JVM::JVM_SuspendThread = (env, thread) ->

  JVM::JVM_ResumeThread = (env, thread) ->

  JVM::JVM_SetThreadPriority = (env, thread, prio) ->

  JVM::JVM_Yield = (env, threadClass) ->

  JVM::JVM_Sleep = (env, threadClass, millis) ->

  JVM::JVM_CurrentThread = (env, threadClass) ->

  JVM::JVM_CountStackFrames = (env, thread) ->

  JVM::JVM_Interrupt = (env, thread) ->

  JVM::JVM_IsInterrupted = (env, thread, clearInterrupted) ->

  JVM::JVM_HoldsLock  = (env, threadClass, obj) ->

  JVM::JVM_DumpAllStacks = (env, unused) ->

  JVM::JVM_GetAllThreads = (env, dummy) ->

  # getStackTrace() and getAllStackTraces() method 
  JVM::JVM_DumpThreads = (env, threadClass, threads) ->

  # java.lang.SecurityManager

  JVM::JVM_CurrentLoadedClass = (env) ->

  JVM::JVM_CurrentClassLoader = (env) ->

  JVM::JVM_GetClassContext = (env) ->

  JVM::JVM_ClassDepth = (env, name) ->

  JVM::JVM_ClassLoaderDepth = (env) ->

  # java.lang.Package
    
  JVM::JVM_GetSystemPackage = (env, name) ->

  JVM::JVM_GetSystemPackages = (env) ->

  # java.io.ObjectInputStream

  JVM::JVM_AllocateNewObject = (env, obj, currClass, initClass) ->

  JVM::JVM_AllocateNewArray = (env, obj, currClass, length) ->

  JVM::JVM_LatestUserDefinedLoader = (env) ->

  # java.lang.reflect.Array

  JVM::JVM_GetArrayLength = (env, arr) ->

  JVM::JVM_GetArrayElement = (env, arr, index) ->

  JVM::JVM_GetPrimitiveArrayElement = (env, arr, index, wCode) ->

  JVM::JVM_SetArrayElement = (env, arr, index, val) ->

  JVM::JVM_SetPrimitiveArrayElement = (env, arr, index, v, vCode) ->

  JVM::JVM_NewArray = (env, eltClass, length) ->

  JVM::JVM_NewMultiArray = (env, eltClass, dim) ->


  ###
    java.lang.Class and java.lang.ClassLoader
   
    Returns the class in which the code invoking the native method
    belongs.
   
    Note that in JDK 1.1, native methods did not create a frame.
    In 1.2, they do. Therefore native methods like Class.forName
    can no longer look at the current frame for the caller class.
  ###
   
  JVM::JVM_GetCallerClass = (env, n) ->

  ###
   Find primitive classes
    utf: class name
  ###

  JVM::JVM_FindPrimitiveClass = (env, utf) ->

  # Link the class

  JVM::JVM_ResolveClass = (clsname, thread) ->
    index = clsname
    # resolve index until we get a String or Class 
    while typeof clsname is 'number'
      clsname = thread.current_class.constant_pool[clsname]
    # if a class, resolution done      
    if clsname instanceof CONSTANT_Class
      return clsname
      
    # if a string then we need to resolve 
    # if already in the method_area, then return that instance. 
    if @RDA.method_area[clsname] == undefined
      
      # tell the RDA that this thread is currently waiting
      @RDA.waiting[clsname] = thread
     
      # request the ClassLoader loads the class this thread needs and say we are waiting
      @load(clsname, true)
      # return null so opcode knows to pause execution
      return null
     
    # actually resolve the class reference so this doesn't need to occur next time
    cls = @RDA.method_area[clsname] 
    cls.constant_pool[index] = cls
    return @RDA.method_area[clsname]
   
  JVM::JVM_ResolveNativeClass = (cls, thread) ->
    name = cls.real_name
    nativeName = 'native/' + name
    if @RDA.method_area[name].native == undefined
      @RDA.waiting[nativeName] = thread
      @loadNative(name)
      return null
      
    _native = @RDA.method_area[nativeName]
    return _native
    
        
  JVM::JVM_ResolveNativeMethod = (cls, name, type) ->
  
  
  JVM::JVM_ResolveMethod = (cls, name, type) ->
    if cls.methods[name+type]?
      return cls.methods[name+type]
      
    for index of cls.methods
      method = cls.methods[index]
      descriptor = method.descriptor = cls.constant_pool[method.descriptor_index]
      if method.name is name and descriptor = type
        # resolve the method return type and arguments
        args = descriptor.substring(descriptor.indexOf('(')+1, descriptor.indexOf(')'))
        method.args = new Array()
        nargs = 0
        count = 0
        for index in args
          if index is 'L'
            arg = args.substring(count, args.indexOf(';', count))
            count = args.indexOf(';', count)
            method.args.push(arg)
          else
            method.args.push(index)
          ++nargs
          ++count
          if count == args.length then break
        method.returntype = descriptor.substring(descriptor.indexOf(')')+1)
        method.nargs = nargs
        cls.methods[method.name + descriptor] = method
        return method

  # Find a class from a boot class loader. Returns NULL if class not found.
   
  
    
  JVM::JVM_FindClassFromBootLoader = (env, name) ->
    if classname? && classname.length > 0
      @classLoader.postMessage({ 'action' : 'find' , 'param' : classname })
      @classLoader.postMessage({ 'action' : 'start' })
    else 
      @stdout.write @helpText()

  # Find a class from a given class loader. Throw ClassNotFoundException
  # or NoClassDefFoundError depending on the value of the last
  # argument.

  JVM::JVM_FindClassFromClassLoader = (env, name, init, loader, throwError) ->

  # Find a class from a given class.
   
  JVM::JVM_FindClassFromClass = (env, name, init, from) ->

  # Find a loaded class cached by the VM 

  JVM::JVM_FindLoadedClass = (env, loader, name) ->
    return @RDA.method_area[name]

  # Define a class 

  JVM::JVM_DefineClass = (env, name, loader, buf, len, pd) ->

  # Define a class with a source (added in JDK1.5) 

  JVM::JVM_DefineClassWithSource = (env, name, loader, buf, len, pd, source) ->


  ###
    Reflection Support Functions
  ###

  JVM::JVM_GetClassName  = (env, cls) ->
    return cls.get_name()

  JVM::JVM_GetClassInterfaces = (env, cls) ->


  JVM::JVM_GetClassLoader = (env, cls) ->

  JVM::JVM_IsInterface = (env, cls) ->

  JVM::JVM_GetClassSigners = (env, cls) ->

  JVM::JVM_SetClassSigners = (env, cls, signers) ->

  JVM::JVM_GetProtectionDomain = (env, cls) ->

  JVM::JVM_SetProtectionDomain = (env, cls, protection_domain) ->

  JVM::JVM_IsArrayClass = (env, cls) ->

  JVM::JVM_IsPrimitiveClass = (env, cls) ->

  JVM::JVM_GetComponentType = (env, cls) ->

  JVM::JVM_GetClassModifiers = (env, cls) ->

  JVM::JVM_GetDeclaredClasses = (env, ofClass) ->

  JVM::JVM_GetDeclaringClass = (env, ofClass) ->



	
  JVM::JVM_RECOGNIZED_METHOD_MODIFIERS = {
    JVM_ACC_PUBLIC        :   0x0001
    JVM_ACC_PRIVATE       :   0x0002
    JVM_ACC_PROTECTED     :   0x0004
    JVM_ACC_STATIC        : 	0x0008
    JVM_ACC_FINAL         :  	0x0010
    JVM_ACC_SYNCHRONIZED  : 	0x0020
    JVM_ACC_BRIDGE        :   0
    JVM_ACC_VARARGS       :   0
    JVM_ACC_NATIVE        :	  0x0100
    JVM_ACC_ABSTRACT      : 	0x0400
    JVM_ACC_STRICT        :   0
    JVM_ACC_SYNTHETIC     :   0
  }
  
  JVM::JVM_RECOGNIZED_CLASS_MODIFIERS = {
    JVM_ACC_PUBLIC    : 0x0001
    JVM_ACC_FINAL     : 0x0010
    JVM_ACC_SUPER     : 0x0020
    JVM_ACC_INTERFACE : 0x0200
    JVM_ACC_ABSTRACT  : 0x0400
  }
  ###                                        JVM_ACC_ANNOTATION | \
                                          JVM_ACC_ENUM | \
                                          JVM_ACC_SYNTHETIC)
                                          ###

  JVM::JVM_RECOGNIZED_FIELD_MODIFIERS = {
    JVM_ACC_PUBLIC    : 0x0000
    JVM_ACC_PRIVATE   : 0x0000
    JVM_ACC_PROTECTED : 0x0000
    JVM_ACC_STATIC    : 0x0000
    JVM_ACC_FINAL     : 0x0000
    JVM_ACC_VOLATILE  : 0x0000
    JVM_ACC_TRANSIENT : 0x0000
    JVM_ACC_ENUM      : 0x0000
    JVM_ACC_SYNTHETIC : 0x0000
  }
  
  JVM::FIELD_DESCRIPTORS = {
    'B'   :   'CONSTANT_Byte'
    'C'   :   'CONSTANT_Char'
    'D'   :   'CONSTANT_Double'
    'F'   :   'CONSTANT_Float'
    'I'   :   'CONSTANT_Integer'
    'J'   :   'CONSTANT_Long'
    'L'   :   'CONSTANT_Class'
    'S'   :   'CONSTANT_Short'
    '['   :   'CONSTANT_Array'
  }
                                          
                                          

