###
The core of the Java Virtual Machine
Defined in Global Scope.
###

scopedJVM = 0

class this.JVM
  ###
    Initialise JVM options
  ###
  
  constructor : (params, @debugWindow) ->
    scopedJVM = this
    @VERSION_ID = "0.10"
    @JAVA_VERSION = "1.6.0_22"
    
    @stdin = params['stdin']
    @stdout = params['stdout']
    @stderr = params['stderr']
    @verbosity = params['verbosity']
    @console = new Console(stdout, stderr, @verbosity)
    if params.version 
      @stdout.write "JS-JVM version '#{@VERSION_ID}' \njava version #{@JAVA_VERSION}"
    else if params.help
      @stdout.write @helpText()
    else    
      # Create Runtime Data Area
      @RDA = new RDA()
      @RDA.JVM = @
      
      (@classLoader = new ClassLoader(@loaded, @loadedNative)).init()
      @InitializeSystemClass()
      # Create ClassLoader WORKER TODO
      #@classLoader = new Worker('http://localhost/js-jvm/trunk/bin/js/classloader/ClassLoader.js')
      #@classLoader.onmessage = @message
      
      @JNI = new InternalJNI(@)
      

  ###
  Push classes to the classloader stack. Return self for chaining or return helptext if no classname supplied
  When the RDA requests a class to be loaded, a callback method will be provided. 
  This is so that opcode execution can continue after the class is loaded.
  ###
  load : (classname, bool) ->
    if @classLoader? 
      if classname? && classname.length > 0
        @classLoader.postMessage({ 'classname' : classname , 'waitingThreads': bool })
        
      else 
        @stdout.write @helpText()
    this
    
  loadNative : (classname) ->
    @classLoader.findNative(classname)
  
  loadedNative : (classname, nativedata) ->
    if nativedata != null
      scopedJVM.RDA.addNative(classname, nativedata)
      #console.log('Loaded class ['+classname+']')
      scopedJVM.RDA.notifyAll(classname)
   
  loaded : (classname, classdata, waitingThreads) ->
    if(classdata != null)
      scopedJVM.RDA.addClass(classname, classdata)
      #console.log('Loaded class ['+classname+']')
    
    if(waitingThreads) 
      scopedJVM.RDA.notifyAll(classname)
 
  end : () ->
    if @callback?
      @callback() 

  ###
  Retrieves messages from Workers and performs relevent actions.
  Hack 'scopedJVM' needed because this is treated as a callback method and thus 
  expected scope is completely lost 
  ###
  message : (e) ->
    switch e.data.action
      when 'log'
        scopedJVM.console.println(e.data.message)
      when 'class'
        scopedJVM.RDA.addClass(e.data.classname, e.data._class)
        #scopedJVM.console.println "Loaded #{ e.data.classname }", 1
       
        #scopedJVM.RDA.clinit(e.data._class)
        # notify any threads waiting on this class
        if(e.data.waitingThreads) 
          scopedJVM.RDA.notifyAll(e.data.classname)
      else 
        alert e.data


  
  
  ###
  Print help text
  ###
  helpText : ->
    "Usage: java [-options] class [args...] \n" +
    "          (to execute a class) \n" +
    "where options include:\n" +
    "   -version        print product version and exit\n" +
    "   -verbose -v     enable verbose output\n" +
    "   -vv             enable debug output\n" +
    "   -? -help        show this help message\n" +
    "See http://www.ivings.org.uk/hg/js-jvm for more details."

  setCallBack : (@callback) ->
    this
    
  
