### 
Additional JVM functions exported from the main VM.
Add support for native methods interacting with the VM.
###

# Objects

JVM.JVM_IHashCode = () -> yes
JVM.JVM_MonitorWait = () -> yes
JVM.JVM_MonitorNotify = () -> yes
JVM.JVM_MonitorNotifyAll = () -> yes
JVM.JVM_Clone = () -> yes

# java.lang.String

JVM.JVM_InternString = (env, jstring) ->


# java.lang.System

JVM.JVM_CurrentTimeMillis = (env, ignoredJClass) ->

JVM.JVM_NanoTime = (env, ignoredJClass) ->

JVM.JVM_ArrayCopy = (env, ignoredClass, srcObj, srcPos, destObj, dstPos, length) ->

JVM.JVM_InitProperties = (env, jobject) ->

# java.io.File

JVM.JVM_OnExit = (func) ->


# java.lang.Runtime

JVM.JVM_Exit = (code) ->

JVM.JVM_Halt = (code) ->

JVM.JVM_GC = () ->

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

JVM.JVM_MaxObjectInspectionAge = () ->

JVM.JVM_TraceInstructions = (bool) ->

JVM.JVM_TraceMethodCalls = (bool) ->

JVM.JVM_TotalMemory = () ->

JVM.JVM_FreeMemory = () ->

JVM.JVM_MaxMemory = () ->

JVM.JVM_ActiveProcessorCount = () ->

JVM.JVM_LoadLibrary = (name) ->

JVM.JVM_UnloadLibrary = (handle) ->

JVM.JVM_FindLibraryEntry = (handle, name) ->

JVM.JVM_IsSupportedJNIVersion = (version) ->


# java.lang.Float and java.lang.Double

JVM.JVM_IsNaN = (double) ->
  return isNaN(double)

# java.lang.Throwable

JVM.JVM_FillInStackTrace = (env, throwable) ->

JVM.JVM_PrintStackTrace = (env, throwable, printable) ->

JVM.JVM_GetStackTraceDepth = (env, throwable) ->

JVM.JVM_GetStackTraceElement = (env, throwable, index) ->

# java.lang.Thread

JVM.JVM_StartThread = (env, thread) ->

JVM.JVM_StopThread = (env, thread, exception) ->

JVM.JVM_IsThreadAlive = (env, thread) ->

JVM.JVM_SuspendThread = (env, thread) ->

JVM.JVM_ResumeThread = (env, thread) ->

JVM.JVM_SetThreadPriority = (env, thread, prio) ->

JVM.JVM_Yield = (env, threadClass) ->

JVM.JVM_Sleep = (env, threadClass, millis) ->

JVM.JVM_CurrentThread = (env, threadClass) ->

JVM.JVM_CountStackFrames = (env, thread) ->

JVM.JVM_Interrupt = (env, thread) ->

JVM.JVM_IsInterrupted = (env, thread, clearInterrupted) ->

JVM.JVM_HoldsLock  = (env, threadClass, obj) ->

JVM.JVM_DumpAllStacks = (env, unused) ->

JVM.JVM_GetAllThreads = (env, dummy) ->

# getStackTrace() and getAllStackTraces() method 
JVM.JVM_DumpThreads = (env, threadClass, threads) ->

# java.lang.SecurityManager

JVM.JVM_CurrentLoadedClass = (env) ->

JVM.JVM_CurrentClassLoader = (env) ->

JVM.JVM_GetClassContext = (env) ->

JVM.JVM_ClassDepth = (env, name) ->

JVM.JVM_ClassLoaderDepth = (env) ->

# java.lang.Package
  
JVM.JVM_GetSystemPackage = (env, name) ->

JVM.JVM_GetSystemPackages = (env) ->

# java.io.ObjectInputStream

JVM.JVM_AllocateNewObject = (env, obj, currClass, initClass) ->

JVM.JVM_AllocateNewArray = (env, obj, currClass, length) ->

JVM.JVM_LatestUserDefinedLoader = (env) ->

# java.lang.reflect.Array

JVM.JVM_GetArrayLength = (env, arr) ->

JVM.JVM_GetArrayElement = (env, arr, index) ->

JVM.JVM_GetPrimitiveArrayElement = (env, arr, index, wCode) ->

JVM.JVM_SetArrayElement = (env, arr, index, val) ->

JVM.JVM_SetPrimitiveArrayElement = (env, arr, index, v, vCode) ->

JVM.JVM_NewArray = (env, eltClass, length) ->

JVM.JVM_NewMultiArray = (env, eltClass, dim) ->


###
  java.lang.Class and java.lang.ClassLoader
 
  Returns the class in which the code invoking the native method
  belongs.
 
  Note that in JDK 1.1, native methods did not create a frame.
  In 1.2, they do. Therefore native methods like Class.forName
  can no longer look at the current frame for the caller class.
###
 
JVM.JVM_GetCallerClass = (env, n) ->

###
 Find primitive classes
  utf: class name
###

JVM.JVM_FindPrimitiveClass = (env, utf) ->

# Link the class

JVM.JVM_ResolveClass = (env, cls) ->

# Find a class from a boot class loader. Returns NULL if class not found.
 
JVM.JVM_FindClassFromBootLoader = (env, name) ->
  if classname? && classname.length > 0
    @classLoader.postMessage({ 'action' : 'find' , 'param' : classname })
    @classLoader.postMessage({ 'action' : 'start' })
  else 
    @stdout.write @helpText()

# Find a class from a given class loader. Throw ClassNotFoundException
# or NoClassDefFoundError depending on the value of the last
# argument.

JVM.JVM_FindClassFromClassLoader = (env, name, init, loader, throwError) ->

# Find a class from a given class.
 
JVM.JVM_FindClassFromClass = (env, name, init, from) ->

# Find a loaded class cached by the VM 

JVM.JVM_FindLoadedClass = (env, loader, name) ->
  reutrn @RDA.method_area[name]

# Define a class 

JVM.JVM_DefineClass = (env, name, loader, buf, len, pd) ->

# Define a class with a source (added in JDK1.5) 

JVM.JVM_DefineClassWithSource = (env, name, loader, buf, len, pd, source) ->


###
  Reflection Support Functions
###

JVM.JVM_GetClassName  = (env, cls) ->
  return cls.get_name()

JVM.JVM_GetClassInterfaces = (env, cls) ->


JVM.JVM_GetClassLoader = (env, cls) ->

JVM.JVM_IsInterface = (env, cls) ->

JVM.JVM_GetClassSigners = (env, cls) ->

JVM.JVM_SetClassSigners = (env, cls, signers) ->

JVM.JVM_GetProtectionDomain = (env, cls) ->

JVM.JVM_SetProtectionDomain = (env, cls, protection_domain) ->

JVM.JVM_IsArrayClass = (env, cls) ->

JVM.JVM_IsPrimitiveClass = (env, cls) ->

JVM.JVM_GetComponentType = (env, cls) ->

JVM.JVM_GetClassModifiers = (env, cls) ->

JVM.JVM_GetDeclaredClasses = (env, ofClass) ->

JVM.JVM_GetDeclaringClass = (env, ofClass) ->



	
JVM.JVM_RECOGNIZED_METHOD_MODIFIERS = {
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
###
#define JVM_RECOGNIZED_CLASS_MODIFIERS (JVM_ACC_PUBLIC | \
                                        JVM_ACC_FINAL | \
                                        JVM_ACC_SUPER | \
                                        JVM_ACC_INTERFACE | \
                                        JVM_ACC_ABSTRACT | \
                                        JVM_ACC_ANNOTATION | \
                                        JVM_ACC_ENUM | \
                                        JVM_ACC_SYNTHETIC)

#define JVM_RECOGNIZED_FIELD_MODIFIERS (JVM_ACC_PUBLIC | \
                                        JVM_ACC_PRIVATE | \
                                        JVM_ACC_PROTECTED | \
                                        JVM_ACC_STATIC | \
                                        JVM_ACC_FINAL | \
                                        JVM_ACC_VOLATILE | \
                                        JVM_ACC_TRANSIENT | \
                                        JVM_ACC_ENUM | \
                                        JVM_ACC_SYNTHETIC)
                                        ###
