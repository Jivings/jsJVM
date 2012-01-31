         
  class this.JVM_Object
    constructor : (@cls) ->
      
      supercls = @cls.get_super()
      if supercls != undefined
        @__proto__ = new JVM_Object(supercls)
        
      
      for field of @cls.fields
        fld = @cls.fields[field]
        @[field] = fld
      
    monitor : { 
        aquireLock : (thread) ->
          console.log('Aquiring a lock')
          if @owner is thread
            console.log('Thread already has lock')
            @count++
          else if @owner isnt null
            @waiting.push(thread)
            return false
          else 
            @owner = thread
            @count++
          yes
            
        releaseLock : (thread) ->
          if @owner isnt thread
            return false
            
          @owner = null
          @count = 0
          for thread in @waiting
            @notify thread
          @waiting.length = 0
          yes
        
        notify : (thread) ->
          thread.continue()
          
          
        owner : null
        count : 0
        waiting : new Array()
      }
    compareTo : (jvmObject) ->
      if @cls.real_name is jvmObject.cls.real_name
        return true
      else 
        try 
          return super.compareTo(jvmObject)
        catch err
          return false
      
  class this.JVM_Reference
    constructor : (@pointer) ->
    toString : () ->
      return @pointer
          
  class JVM_Number
    constructor : (@val) ->
    valueOf : () ->
      return @val
    
  class this.CONSTANT_Array extends Array
    constructor : (@length, @type) ->
      super @length
      
  class this.CONSTANT_Object
    constructor : (@classname) ->
      @value = null
      
  class this.CONSTANT_integer extends JVM_Number
    constructor : (val = 0, sign = false) ->
      if sign
        #signbit = val >> 15
        #signed = val & 0x7fff
        unsigned = val >> 0
        signed = (~unsigned)&0xffff
        signed += 1
        if unsigned is 1
          val = 0 - signed
        else 
          val = signed
        
      super val    
      
  class this.CONSTANT_float extends JVM_Number
    constructor : (val = 0.0) ->
      super val
      
  class this.CONSTANT_long extends JVM_Number
    constructor : (val = 0) ->
      super val
  
  class this.CONSTANT_double extends JVM_Number
    constructor : (val = 0.0) ->
      super val
  
  class this.CONSTANT_char
    constructor : (@value = '\u0000') ->
      @value = @value.charCodeAt();
  
  class this.CONSTANT_short
    constructor : (@value = 0) ->
    
  class this.CONSTANT_byte 
    constructor : (@value = 0) ->
    
  class this.CONSTANT_boolean
    constructor : (@value = 0) ->
   
  class this.CONSTANT_String extends String
    constructor : (@value = '') ->
         
  JVM::JVM_InternedStrings = {}
  ### 
  Additional JVM functions exported from the main VM.
  Add support for native methods interacting with the VM.
  ###
    
  ###
    JavaScript doesn't define an assert function so here's our own.
  ###
  JVM::assert = (condition, message) ->
    if not(condition)
      throw "AssertException: #{message}"

  # Register Global JVM methods to jclass for runtime access.
  JVM::RegisterNatives = (env, jclass, methods) -> 
    for name of methods 
      JVM_MethodName = methods[name].name
      jclass[name] = JVM::[JVM_MethodName]
    yes
    
    
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
    
    
  # Our own Java Data Structures. These provide an extra 'type' var to allow 
  # our typeless language to still follow strict Java typing.
 
     
  # Objects

  JVM::JVM_IHashCode = () -> 
    return 1
    
  JVM::JVM_MonitorWait = () -> 
    # Object will reside in locals[0]
    object = @locals[0]
    
  yes
  
  JVM::JVM_MonitorNotify = () -> yes
  JVM::JVM_MonitorNotifyAll = () -> yes
  JVM::JVM_Clone = () -> yes

  # java.lang.String

  JVM::JVM_InternString = (env, jstring) ->


  # java.lang.System

  JVM::JVM_CurrentTimeMillis = (env, ignoredJClass) ->
    return new CONSTANT_long(new Date().getTime())
    
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

  JVM::GetObjectField = (objectReference, fieldname) ->
    obj = @RDA.heap[objectReference.pointer]
    field = obj[fieldname]
    return field
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
      console.log('Resolve Class ' + clsname)
      # tell the RDA that this thread is currently waiting
      @RDA.waiting[clsname] = thread
     
      # request the ClassLoader loads the class this thread needs and say we are waiting
      @load(clsname, true)
      # return null so opcode knows to pause execution
      return null
     
    # actually resolve the class reference so this doesn't need to occur next time
    cls = @RDA.method_area[clsname] 
    if thread != undefined
      thread.current_class.constant_pool[index] = cls
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
    
  JVM::JVM_ResolveStringLiteral = (literal) ->
    enc = 'sun.jnu.encoding'
    cls = @JVM_ResolveClass('java/lang/String')
    method_id = '<init>'
    method_desc = '()V'
    method = @JVM_ResolveMethod(cls, method_id, method_desc)
    
    # for index of cls.constant_pool
    #  ref = cls.constant_pool[index]
    # if ref instanceof CONSTANT_Stringref
    #   literal = cls.constant_pool[ref.string_index]
    if !@JVM_InternedStrings[literal]
      console.log('Interning a string ('+literal+')')
      #asBytes = @JVM_StringLiteralToBytes(literal)
      #byteArray = @RDA.heap.allocate(asBytes)      
      charArray = new Array()
      for index of literal
        charArray[index] = literal[index]
      
      charArray = @RDA.heap.allocate(charArray)
      stringobj = @JVM_NewObject(cls, method, [])
      stringobj.count = literal.length
      stringobj.value = charArray
      console.log('Done interning')
      @JVM_InternedStrings[literal] = stringobj
    
    return @RDA.heap.allocate(@JVM_InternedStrings[literal])
      #cls.constant_pool[ref.string_index] = @JVM_InternedStrings[literal]
    
    
  JVM::JVM_StringLiteralToBytes = (literal) ->
    i = 0
    re = []
    while i++ < literal.length
      ch = literal.charCodeAt(i)
      st = []
      loop
        st.push( ch & 0xFF )
        ch = ch >> 8
        break if !ch
      re = re.concat( st.reverse() );  
    return re 
     
  JVM::JVM_InvokeMethod = (object, method, args) ->
    cls = @JVM_FromHeap(object).cls
    t = new Thread(cls, @RDA, method) 
    t.current_frame.locals[0] = object
    arg_num = args.length
    while arg_num > 0
      t.current_frame.locals[arg_num] = args[arg_num-1]
      arg_num--
        
    t.start()
  
  JVM::JVM_NewObjectByReference = (clsname, constructorname, descriptor, args, thread) ->
    if (cls = @JVM_ResolveClass(clsname, thread)) == null
      return
    method = @JVM_ResolveMethod(cls, constructorname, descriptor)
    return @RDA.heap.allocate(@JVM_NewObject(cls, method, args))
  
  JVM::JVM_NewObject = (cls, constructor, args) ->  
    obj = new JVM_Object(cls)    
    objref = @RDA.heap.allocate(obj)
    t = new Thread(cls, @RDA, constructor)    
    
    t.current_frame.locals[0] = objref
    
    arg_num = args.length
    while arg_num > 0
      t.current_frame.locals[arg_num] = args[arg_num-1]
      arg_num--
        
    t.start()
    return obj
    
    
  
  JVM::JVM_ResolveNativeMethod = (cls, name, type) ->
  
  ###
  JVM::JVM_ResolveField = (obj, name) ->
    loop
      if obj.fields[name]
        return cls.fields[name]
      obj = cls.get_super()
      assert(cls, 'FieldResolutionException')
  ###    
  
  JVM::JVM_ResolveMethod = (cls, name, type) ->
    if cls.methods[name+type]?
      return cls.methods[name+type]
    loop  
      for index of cls.methods
        method = cls.methods[index]
        descriptor = cls.constant_pool[method.descriptor_index]
        if method.name is name and descriptor is type
          method.descriptor = descriptor
          # resolve the method return type and arguments
          args = descriptor.substring(descriptor.indexOf('(')+1, descriptor.indexOf(')'))
          method.args = new Array()
          nargs = 0
          i = 0
          while i < args.length
            if args[i] is 'L'
              arg = args.substring(i, args.indexOf(';', i))
              i = args.indexOf(';', i)
              method.args.push(arg)
            else if args[i] is '['
              endarg = args.substring(i).search('[B-Z]')
              method.args.push(args.substring(i, endarg+i+1))
              i += endarg
            else
              method.args.push(args[i])
            ++nargs
            ++i
            
          method.returntype = descriptor.substring(descriptor.indexOf(')')+1)
          method.nargs = nargs
          cls.methods[method.name + descriptor] = method
          method['belongsTo'] = cls
          return method
      if name is '<clinit>'
        return false
      cls = cls.get_super()
      @assert(cls, 'MethodResolutionException')
    no
  # Find a class from a boot class loader. Returns NULL if class not found.
   
  
  JVM::JVM_InvokeStaticMethod = (clsname, method_name, descriptor, args, thread) ->
    if(cls = @JVM_ResolveClass(clsname, thread)) == null
      return false
    method = @JVM_ResolveMethod(cls, method_name, descriptor)
    
    t = new Thread(cls, @RDA, method) 
    arg_num = args.length-1
    while arg_num > -1
      t.current_frame.locals[arg_num] = args[arg_num]
      arg_num--
        
    t.start() 
    
  
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
    return env.RDA.heap.allocate(@JVM_ClassLoader)

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

  JVM::JVM_FromHeap = (reference) ->
    return @RDA.heap[reference.pointer]
      
  class this.JVM_ClassLoader
  JVM::JVM_ClassLoader = new JVM_ClassLoader()

	
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
    'B'   :   'CONSTANT_byte'
    'C'   :   'CONSTANT_char'
    'D'   :   'CONSTANT_double'
    'F'   :   'CONSTANT_float'
    'I'   :   'CONSTANT_integer'
    'J'   :   'CONSTANT_long'
    'L'   :   'CONSTANT_Class'
    'S'   :   'CONSTANT_short'
    'Z'   :   'CONSTANT_boolean'
    '['   :   'CONSTANT_Array'
  }
  
  
                                            
                                          

