###
The core of the Java Virtual Machine
Defined in Global Scope.
###

class this.JVM
  ###
    Initialise JVM options
  ###
  constructor : (params) ->
    @VERSION_ID = "0.10"
    @JAVA_VERSION = "1.6.0_22"
    
    @stdin = params['stdin']
    @stdout = params['stdout']
    @stderr = params['stderr']
    @verbosity = params['verbosity']
    document.console = new Console(stdout, stderr, @verbosity)
    if params.version 
      @stdout.write "JS-JVM version '#{@VERSION_ID}' \njava version #{@JAVA_VERSION}"
    else if params.help
      @stdout.write @helpText()
    else    
      # Create Runtime Data Area
      @RDA = new RDA();
      # Create ClassLoader
      @classLoader = new ClassLoader(@RDA);

  ###
  Push classes to the classloader stack. Return self for chaining or return helptext if no classname supplied
  ###
  load : (classname) ->
    if @classLoader? 
      if classname? && classname.length > 0
        @classLoader.find(classname)
        @classLoader.start(@)
      else 
        @stdout.write @helpText()
    this
  
  start : (main_class) ->
    
  
  end : () ->
    if @callback?
      @callback() 
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
  
