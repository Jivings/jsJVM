(function() {
  /*
  The core of the Java Virtual Machine
  Defined in Global Scope.
  */
  var scopedJVM;
  scopedJVM = 0;
  this.JVM = (function() {
    /*
        Initialise JVM options
      */    function JVM(params, debugWindow) {
      this.debugWindow = debugWindow;
      scopedJVM = this;
      this.VERSION_ID = "0.10";
      this.JAVA_VERSION = "1.6.0_22";
      this.stdin = params['stdin'];
      this.stdout = params['stdout'];
      this.stderr = params['stderr'];
      this.verbosity = params['verbosity'];
      this.console = new Console(stdout, stderr, this.verbosity);
      if (params.version) {
        this.stdout.write("JS-JVM version '" + this.VERSION_ID + "' \njava version " + this.JAVA_VERSION);
      } else if (params.help) {
        this.stdout.write(this.helpText());
      } else {
        this.RDA = new RDA();
        this.RDA.JVM = this;
        (this.classLoader = new ClassLoader(this.loaded, this.loadedNative)).init();
        this.InitializeSystemClass();
        this.JNI = new InternalJNI(this);
      }
    }
    /*
      Push classes to the classloader stack. Return self for chaining or return helptext if no classname supplied
      When the RDA requests a class to be loaded, a callback method will be provided. 
      This is so that opcode execution can continue after the class is loaded.
      */
    JVM.prototype.load = function(classname, bool) {
      if (this.classLoader != null) {
        if ((classname != null) && classname.length > 0) {
          this.classLoader.postMessage({
            'classname': classname,
            'waitingThreads': bool
          });
        } else {
          this.stdout.write(this.helpText());
        }
      }
      return this;
    };
    JVM.prototype.loadNative = function(classname) {
      return this.classLoader.findNative(classname);
    };
    JVM.prototype.loadedNative = function(classname, nativedata) {
      if (nativedata !== null) {
        scopedJVM.RDA.addNative(classname, nativedata);
        return scopedJVM.RDA.notifyAll(classname);
      }
    };
    JVM.prototype.loaded = function(classname, classdata, waitingThreads) {
      if (classdata !== null) {
        scopedJVM.RDA.addClass(classname, classdata);
      }
      if (waitingThreads) {
        return scopedJVM.RDA.notifyAll(classname);
      }
    };
    JVM.prototype.end = function() {
      if (this.callback != null) {
        return this.callback();
      }
    };
    /*
      Retrieves messages from Workers and performs relevent actions.
      Hack 'scopedJVM' needed because this is treated as a callback method and thus 
      expected scope is completely lost 
      */
    JVM.prototype.message = function(e) {
      switch (e.data.action) {
        case 'log':
          return scopedJVM.console.println(e.data.message);
        case 'class':
          scopedJVM.RDA.addClass(e.data.classname, e.data._class);
          if (e.data.waitingThreads) {
            return scopedJVM.RDA.notifyAll(e.data.classname);
          }
          break;
        default:
          return alert(e.data);
      }
    };
    /*
      Print help text
      */
    JVM.prototype.helpText = function() {
      return "Usage: java [-options] class [args...] \n" + "          (to execute a class) \n" + "where options include:\n" + "   -version        print product version and exit\n" + "   -verbose -v     enable verbose output\n" + "   -vv             enable debug output\n" + "   -? -help        show this help message\n" + "See http://www.ivings.org.uk/hg/js-jvm for more details.";
    };
    JVM.prototype.setCallBack = function(callback) {
      this.callback = callback;
      return this;
    };
    return JVM;
  })();
}).call(this);
