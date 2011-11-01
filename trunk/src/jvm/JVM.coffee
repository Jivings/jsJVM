###
The core of the Java Virtual Machine
Defined in Global Scope.
###

class this.JVM
  
  constructor : (params) ->
    @VERSION_ID = "0.10"
    @JAVA_VERSION = "1.6.0_22"
    
    @stdin = params['stdin']
    @stdout = params['stdout']
    @stderr = params['stderr']
    @verbosity = params['verbosity']
    document.console = new Console(stdout, stderr)
    if params.version 
      @stdout.write "JS-JVM version '#{@VERSION_ID}' \njava version #{@JAVA_VERSION}"
    else if params.help
      @stdout.write @helpText()
    else    
      @classLoader = new ClassLoader();
    
  # Push classes to the classloader stack. Return self for chaining or return helptext if no classname supplied
  load : (classname) ->
    if @classLoader? 
      if classname? && classname.length > 0
        @classLoader.find(classname)
        @classLoader.start()
        this
      else 
        @stdout.write @helpText()
  
  helpText : ->
    "Usage: java [-options] class [args...] \n" +
    "          (to execute a class) \n" +
    "where options include:\n" +
    "   -version        print product version and exit\n" +
    "   -verbose -v     enable verbose output\n" +
    "   -vv             enable debug output\n" +
    "   -? -help        show this help message\n" +
    "See http://www.ivings.org.uk/hg/js-jvm for more details."
