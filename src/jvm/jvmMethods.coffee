         
  
         
  #JVM::JVM_InternedStrings = {}
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
    
  JVM::InitializeSystem = (initDone) ->
    system = @RDA.method_area['native/java/lang/System']
    cls = @RDA.method_area['java/lang/System']
    @assert( system isnt null, 
      "System not loaded before InitializeSystemClass")
      
    @JVM_ResolveClass('javascript/io/JavaScriptPrintStream', (outputStream) =>
      method_id = '<init>'
      method_desc = '(Ljava/lang/String;)V'
      method = @JVM_ResolveMethod(outputStream, method_id, method_desc)
      @JVM_ResolveStringLiteral('terminal', (str) => 
        @JVM_NewObject(outputStream, method, [str], (outputStreamObj) =>
          ###
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
          ###
          @JVM_ExecuteNativeMethod('native/java/lang/System', 'setOut0', [cls, outputStreamObj])
          initDone()
        )
      )
    )
    
    
    
    
  ###  
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
  ###  
    
  # Our own Java Data Structures. These provide an extra 'type' var to allow 
  # our typeless language to still follow strict Java typing.
 
     
  # Objects

  JVM::JVM_IHashCode = () -> 
    return 1
    
  JVM::JVM_MonitorWait = () -> 
    # Object will reside in locals[0]
    object = @locals[0]
    throw 'NotYetImplementedException'
    
  yes
  
  JVM::JVM_MonitorNotify = () -> 
    throw 'NotYetImplementedException'
  JVM::JVM_MonitorNotifyAll = () -> 
    throw 'NotYetImplementedException'
  JVM::JVM_Clone = () -> 
    throw 'NotYetImplementedException'
  # java.lang.String

  JVM::JVM_InternString = (env, jstring) ->
    throw 'NotYetImplementedException'

  # java.lang.System

  JVM::JVM_CurrentTimeMillis = (env, ignoredJClass) ->
    return new CONSTANT_long(new Date().getTime())
    
  JVM::JVM_NanoTime = (env, ignoredJClass) ->
    throw 'NotYetImplementedException'

  JVM::JVM_ArrayCopy = (env, srcObj, srcPos, dstObj, destPos, length) ->
     src = env.JVM_FromHeap(srcObj)
     arr = src.slice(srcPos.val, srcPos.val + length.val)
     dest = env.JVM_FromHeap(destObj)
     destPos = dstPos.val
     for index, ch of arr
        dest[new Number(index)+destPos] = ch
     yes

  JVM::JVM_InitProperties = (env, jobject) ->
    throw 'NotYetImplementedException'
  # java.io.File

  JVM::JVM_OnExit = (func) ->
    throw 'NotYetImplementedException'
    
  JVM::GetStaticFieldID = (cls, fieldname, returnType) ->
    # TODO should be a field id!
    return fieldname
    
  JVM::SetStaticObjectField = (cls,fieldname,stream) ->
    cls.fields[fieldname] = stream

  JVM::GetObjectField = (objectReference, fieldname) ->
    obj = @RDA.heap[objectReference.pointer]
    field = obj[fieldname]
    return field
  # java.lang.Runtime

  JVM::JVM_GetObjectClass = (objectReference, callback) ->
    if !callback
      throw 'NoFixError'
    obj = @JVM_FromHeap(objectReference)
    if @JVM_FromHeap(obj.clsObject) is null
      # this will always resolve
      @JVM_ResolveClass('java/lang/Class', (cls)=>
        constructor = @JVM_ResolveMethod(cls, '<init>', '()V')
        obj.clsObject = @JVM_NewObject(cls, constructor, [])
        callback(@RDA.heap.allocate(obj.clsObject))
      )
    

  
  JVM::JVM_Exit = (code) ->
    throw 'NotYetImplementedException'
  JVM::JVM_Halt = (code) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GC = () ->
    throw 'NotYetImplementedException'
  ###
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
  ###

  JVM::JVM_MaxObjectInspectionAge = () ->
    throw 'NotYetImplementedException'
  JVM::JVM_TraceInstructions = (bool) ->
    throw 'NotYetImplementedException'
  JVM::JVM_TraceMethodCalls = (bool) ->
    throw 'NotYetImplementedException'
  JVM::JVM_TotalMemory = () ->
    throw 'NotYetImplementedException'
  JVM::JVM_FreeMemory = () ->
    throw 'NotYetImplementedException'
  JVM::JVM_MaxMemory = () ->
    throw 'NotYetImplementedException'
  JVM::JVM_ActiveProcessorCount = () ->
    throw 'NotYetImplementedException'
  JVM::JVM_LoadLibrary = (name) ->
    throw 'NotYetImplementedException'
  JVM::JVM_UnloadLibrary = (handle) ->
    throw 'NotYetImplementedException'
  JVM::JVM_FindLibraryEntry = (handle, name) ->
    throw 'NotYetImplementedException'
  JVM::JVM_IsSupportedJNIVersion = (version) ->
    throw 'NotYetImplementedException'

  # java.lang.Float and java.lang.Double

  JVM::JVM_IsNaN = (double) ->
    return isNaN(double)

  # java.lang.Throwable

  JVM::JVM_FillInStackTrace = (env, throwable) ->
    console.log('filling in stacktrace!')

  JVM::JVM_PrintStackTrace = (env, throwable, printable) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetStackTraceDepth = (env, throwable) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetStackTraceElement = (env, throwable, index) ->
    throw 'NotYetImplementedException'
  # java.lang.Thread

  JVM::JVM_StartThread = (env, thread) ->
    throw 'NotYetImplementedException'
  JVM::JVM_StopThread = (env, thread, exception) ->
    throw 'NotYetImplementedException'
  JVM::JVM_IsThreadAlive = (env, thread) ->
    throw 'NotYetImplementedException'
  JVM::JVM_SuspendThread = (env, thread) ->
    throw 'NotYetImplementedException'
  JVM::JVM_ResumeThread = (env, thread) ->
    throw 'NotYetImplementedException'
  JVM::JVM_SetThreadPriority = (env, thread, prio) ->
    throw 'NotYetImplementedException'
  JVM::JVM_Yield = (env, threadClass) ->
    throw 'NotYetImplementedException'
  JVM::JVM_Sleep = (env, threadClass, millis) ->
    throw 'NotYetImplementedException'
  JVM::JVM_CurrentThread = (env, threadClass) ->
    throw 'NotYetImplementedException'
  JVM::JVM_CountStackFrames = (env, thread) ->
    throw 'NotYetImplementedException'
  JVM::JVM_Interrupt = (env, thread) ->
    throw 'NotYetImplementedException'
  JVM::JVM_IsInterrupted = (env, thread, clearInterrupted) ->
    throw 'NotYetImplementedException'
  JVM::JVM_HoldsLock  = (env, threadClass, obj) ->
    throw 'NotYetImplementedException'
  JVM::JVM_DumpAllStacks = (env, unused) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetAllThreads = (env, dummy) ->
    throw 'NotYetImplementedException'
  # getStackTrace() and getAllStackTraces() method 
  JVM::JVM_DumpThreads = (env, threadClass, threads) ->
    throw 'NotYetImplementedException'
  # java.lang.SecurityManager

  JVM::JVM_CurrentLoadedClass = (env) ->
    throw 'NotYetImplementedException'
  JVM::JVM_CurrentClassLoader = (env) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetClassContext = (env) ->
    throw 'NotYetImplementedException'
  JVM::JVM_ClassDepth = (env, name) ->
    throw 'NotYetImplementedException'
  JVM::JVM_ClassLoaderDepth = (env) ->
    throw 'NotYetImplementedException'
  # java.lang.Package
    
  JVM::JVM_GetSystemPackage = (env, name) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetSystemPackages = (env) ->
    throw 'NotYetImplementedException'
  # java.io.ObjectInputStream

  JVM::JVM_AllocateNewObject = (env, obj, currClass, initClass) ->
    throw 'NotYetImplementedException'
  JVM::JVM_AllocateNewArray = (env, obj, currClass, length) ->
    throw 'NotYetImplementedException'
  JVM::JVM_LatestUserDefinedLoader = (env) ->

  # java.lang.reflect.Array

  JVM::JVM_GetArrayLength = (env, arr) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetArrayElement = (env, arr, index) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetPrimitiveArrayElement = (env, arr, index, wCode) ->
    throw 'NotYetImplementedException'
  JVM::JVM_SetArrayElement = (env, arr, index, val) ->
    throw 'NotYetImplementedException'
  JVM::JVM_SetPrimitiveArrayElement = (env, arr, index, v, vCode) ->
    throw 'NotYetImplementedException'
  JVM::JVM_NewArray = (env, eltClass, length) ->
    throw 'NotYetImplementedException'
  JVM::JVM_NewMultiArray = (env, eltClass, dim) ->
    throw 'NotYetImplementedException'

  ###
    java.lang.Class and java.lang.ClassLoader
   
    Returns the class in which the code invoking the native method
    belongs.
   
    Note that in JDK 1.1, native methods did not create a frame.
    In 1.2, they do. Therefore native methods like Class.forName
    can no longer look at the current frame for the caller class.
  ###
   
  JVM::JVM_GetCallerClass = (env, n) ->
    throw 'NotYetImplementedException'
  ###
   Find primitive classes
    utf: class name
  ###

  JVM::JVM_FindPrimitiveClass = (env, utf) ->
    throw 'NotYetImplementedException'
  # Link the class

  JVM::JVM_ResolveClass = (clsname, thread, resolved) ->
    # sometimes thread doesn't get passed
    if !resolved then resolved = thread
    # tell the RDA that this thread is currently waiting
    if thread then @RDA.waiting[clsname] = thread
          
    # if a class, resolution done      
    if (clsname instanceof CONSTANT_Class or clsname.magic_number?)
      @RDA.notifyAll(clsname.real_name, clsname)
    
    # if a string then we need to resolve 
    # if already in the method_area, then return that instance. 
    if @RDA.method_area[clsname] == undefined
      console.log('Resolve Class ' + clsname)
      # request the ClassLoader loads the class this thread needs and say we are waiting
      @load(clsname, true, resolved)
    
    else 
      # actually resolve the class reference so this doesn't need to occur next time
      cls = @RDA.method_area[clsname] 
      resolved(cls)
    
  JVM::JVM_ResolveNativeClass = (nativeName, thread) ->
    
    if thread then @RDA.waiting[nativeName] = thread
    
    if @RDA.method_area[nativeName] == undefined
      @loadNative(nativeName)
    yes
  
  JVM::JVM_ExecuteNativeMethod = (classname, methodname, args) ->
    nativeCls = @RDA.method_area[classname]
    nmethod = nativeCls[methodname]
    if args
      args.unshift(this)
    else 
      args = new Array()
      args.push(this)
    returnval = nmethod.apply(nativeCls, args)
    return returnval
  
  JVM::JVM_ResolveStringLiteral = (literal, callback) ->
    enc = 'sun.jnu.encoding'
    # will always resolve as String is needed to pass arguments to the JVM
    @JVM_ResolveClass('java/lang/String', (cls) =>
      method_id = '<init>'
      method_desc = '()V'
      method = @JVM_ResolveMethod(cls, method_id, method_desc)
      
      # if this String is not already interned, then create it.
      if !@JVM_InternedStrings[literal]
        console.log('Interning a string ("'+literal+'")')
        #asBytes = @JVM_StringLiteralToBytes(literal)
        #byteArray = @RDA.heap.allocate(asBytes)      
        charArray = new Array()
        for index of literal
          charArray[index] = literal[index]
        
          #        charArray = @RDA.heap.allocate(charArray)
        @JVM_NewObject(cls, method, [], (stringobj) =>
          # manually edit some important fields
          @RDA.heap[stringobj.pointer].count = new CONSTANT_integer(literal.length)
          @RDA.heap[@RDA.heap[stringobj.pointer].value.pointer] = charArray
          
          #@RDA.heap[stringobj.pointer].value = charArray
          console.log('Done interning')
          @JVM_InternedStrings[literal] = stringobj
          callback(stringobj)
        )
      else
        callback(@JVM_InternedStrings[literal])
    )    
    
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
  
  JVM::JVM_NewObjectByReference = (clsname, constructorname, descriptor, args, thread, callback) ->
    if !callback then throw 'NoFixException' #TODO remove
    @JVM_ResolveClass(clsname, thread, (cls) =>
      method = @JVM_ResolveMethod(cls, constructorname, descriptor)
      callback(@JVM_NewObject(cls, method, args))
    )
  
  JVM::JVM_NewObject = (cls, constructor, args, objectCreated) ->  
    if !objectCreated #TODO remove test code
      throw 'bugfix'
      
    obj = new JVM_Object(cls)    
    objref = @RDA.heap.allocate(obj)
    
    locals = new Array()
    locals[0] = objref
    
    arg_num = args.length
    while arg_num > 0
      locals[arg_num] = args[arg_num-1]
      arg_num--
        
    @RDA.createThread(cls.real_name, constructor, locals, () ->
      objectCreated(objref)
    )
       
  
  JVM::JVM_ResolveNativeMethod = (cls, name, type) ->
    throw 'NotYetImplementedException'  
  ###
  JVM::JVM_ResolveField = (obj, name) ->
    loop
      if obj.fields[name]
        return cls.fields[name]
      obj = cls.get_super()
      assert(cls, 'FieldResolutionException')
  ###    
  
  JVM::JVM_ResolveMethod = (cls, name, type) ->
    
    if cls is null
      throw 'NullClassException'
      
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
    @JVM_ResolveClass(clsname, thread, (cls) =>
      
      method = @JVM_ResolveMethod(cls, method_name, descriptor)
      
      t = new Thread(cls, @RDA, method) 
      arg_num = args.length-1
      while arg_num > -1
        t.current_frame.locals[arg_num] = args[arg_num]
        arg_num--
          
      t.start()
    ) 
    
  
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
    throw 'NotYetImplementedException'
  # Find a class from a given class.
   
  JVM::JVM_FindClassFromClass = (env, name, init, from) ->
    throw 'NotYetImplementedException'
  # Find a loaded class cached by the VM 

  JVM::JVM_FindLoadedClass = (env, loader, name) ->
    return @RDA.method_area[name]

  # Define a class 

  JVM::JVM_DefineClass = (env, name, loader, buf, len, pd) ->
    throw 'NotYetImplementedException'
  # Define a class with a source (added in JDK1.5) 

  JVM::JVM_DefineClassWithSource = (env, name, loader, buf, len, pd, source) ->
    throw 'NotYetImplementedException'

  ###
    Reflection Support Functions
  ###
      
  JVM::JVM_GetClassName  = (env, cls) ->
    cls = env.JVM_FromHeap(cls.object).cls
    return env.JVM_ResolveStringLiteral(cls.real_name)

  JVM::JVM_GetClassInterfaces = (env, cls) ->
    throw 'NotYetImplementedException'

  JVM::JVM_GetClassLoader = (env, cls) ->
    # return null
    return new JVM_Reference(0)
    
  JVM::JVM_DesiredAssertionStatus = (cls) ->
    return false
  
  JVM::JVM_IsInterface = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetClassSigners = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_SetClassSigners = (env, cls, signers) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetProtectionDomain = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_SetProtectionDomain = (env, cls, protection_domain) ->
    throw 'NotYetImplementedException'
  JVM::JVM_IsArrayClass = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_IsPrimitiveClass = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetComponentType = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetClassModifiers = (env, cls) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetDeclaredClasses = (env, ofClass) ->
    throw 'NotYetImplementedException'
  JVM::JVM_GetDeclaringClass = (env, ofClass) ->
    throw 'NotYetImplementedException'
  JVM::JVM_FromHeap = (reference) ->
    return @RDA.heap[reference.pointer]
      
  #class this.JVM_ClassLoader
  #JVM::JVM_ClassLoader = new JVM_ClassLoader()

	
  
  
  
                                            
                                          

