###
The core of the Java Virtual Machine
Defined in Global Scope.
###

scopedJVM = 0

class this.JVM
  ###
    Initialise JVM options
  ###
  
  constructor : (params) ->
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
      @RDA = new RDA();
      # Create ClassLoader
      @classLoader = new Worker('http://localhost/js-jvm/trunk/bin/js/classloader/ClassLoader.js')
      @classLoader.onmessage = @message
      # Start the Runtime Environment
      @ps_id = setInterval((() ->  scopedJVM.start(scopedJVM.RDA)), 100)
      @JNI = new InternalJNI()
      

  ###
  Push classes to the classloader stack. Return self for chaining or return helptext if no classname supplied
  ###
  load : (classname) ->
    if @classLoader? 
      if classname? && classname.length > 0
        @classLoader.postMessage({ 'action' : 'find' , 'param' : classname })
        @classLoader.postMessage({ 'action' : 'start' })
      else 
        @stdout.write @helpText()
    this
   
  ### 
  Main OPCODE loop 
  ### 
  start : (RDA) ->
    
    #if((thread = RDA.threads[1])?)
    #  thread.execute()
              
    this
 
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
        scopedJVM.console.println(data.param)
      when 'class'
        scopedJVM.RDA.addClass(e.data.classname, e.data._class)
        scopedJVM.console.println "Loaded #{ e.data.classname }", 1
        scopedJVM.RDA.clinit(e.data._class)
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
  
