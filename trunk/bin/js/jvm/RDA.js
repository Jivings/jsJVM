(function() {
  /*
  Runtime Data Area of the JVM. Stores all class, method and stack data.
  */  this.RDA = (function() {
    function RDA() {
      this.waiting = new Array();
      this.method_area = {};
      this.heap = {
        permgen: {},
        oldgen: {},
        younggen: {},
        id: 0
      };
      this.heap.allocate = function(object) {
        var ref;
        ref = ++this.id;
        this[ref] = object;
        return new JVM_Reference(ref);
      };
      this.threads = new Array();
    }
    RDA.prototype.addClass = function(classname, raw_class) {
      this.method_area[classname] = raw_class;
      this.clinit(classname, raw_class);
      if (raw_class.methods['main'] != null) {
        return this.createThread(classname, 'main');
      }
    };
    RDA.prototype.createThread = function(mainClassName, method) {
      var t, that, thread_id;
      that = this;
      t = new Thread(this.method_area[mainClassName], this, method);
      this.threads.push(t);
      thread_id = this.threads.length - 1;
      t.start(function() {
        return that.threads.splice(thread_id, thread_id + 1);
      });
      return this;
    };
    RDA.prototype.clinit = function(classname, raw_class) {
      var clsini, t;
      clsini = raw_class.methods['<clinit>'];
      if (clsini != null) {
        t = new Thread(raw_class, this, '<clinit>');
        t.start();
      }
      return true;
    };
    RDA.prototype.notifyAll = function(notifierName) {
      var lock, thread, _ref;
      _ref = this.waiting;
      for (lock in _ref) {
        thread = _ref[lock];
        if (lock === notifierName) {
          thread['continue'](notifierName);
        }
      }
      return true;
    };
    return RDA;
  })();
  this.Thread = (function() {
    function Thread(_class, RDA, startMethod) {
      this.RDA = RDA;
      this.opcodes = new OpCodes(this);
      this.methodFactory = new MethodFactory(this, this.RDA.JVM);
      this.current_class = _class;
      this.methods = this.current_class.methods;
      this.pc = 0;
      this.jvm_stack = new Array();
      this.jvm_stack.peek = function() {
        return this[this.length - 1];
      };
      this.native_stack = new Array();
      this.native_stack.peek = function() {
        return this[this.length - 1];
      };
      this.current_frame = this.createFrame(this.methods[startMethod], this.current_class);
      this;
    }
    Thread.prototype.createFrame = function(method, cls) {
      return this.methodFactory.createFrame(method, cls);
    };
    Thread.prototype.start = function(destroy) {
      while (this.current_frame != null) {
        if (!this.current_frame.execute(this.pc, this.opcodes)) {
          return false;
        }
        this.pc++;
      }
      return true;
    };
    Thread.prototype.resolveClass = function(index) {
      var name;
      name = this.current_class.constant_pool[index];
      if (this.RDA.method_area[name] === void 0) {
        this.RDA.waiting[name] = this;
        this.index = index;
        this.RDA.JVM.load(name, true);
        return null;
      }
      return this.RDA.method_area[name];
    };
    /*
      Called when waiting threads are notified by the RDA. Will continue opcode 
      loop
      */
    Thread.prototype["continue"] = function(name) {
      this.current_class.constant_pool[this.index] = this.RDA.method_area[name];
      return this.start();
    };
    /*
      Called when a method is invoked. Allocates a section of 
      memory to the method and begins bytecode execution.
      When the method is finished, it is removed from memory.
      */
    Thread.prototype.execute = function() {
      return true;
    };
    return Thread;
  })();
  /*
  A stack frame contains the state of one method invocation. When a method is invoked, 
  a new frame is pushed onto the threads stack.
  */
  this.Frame = (function() {
    function Frame(method, cls) {
      this.cls = cls;
      this.method_stack = method.attributes.Code.code;
      this.op_stack = new Array();
      this.op_stack.peek = function() {
        return this[this.length - 1];
      };
      this.constant_pool = this.cls.constant_pool;
      this.resolveSelf(this.cls);
      this.name = method.name;
      this.locals = {};
      this;
    }
    Frame.prototype.execute = function(pc, opcodes) {
      var op;
      this.pc = pc;
      op = this.method_stack[this.pc];
      if (!opcodes[op]["do"](this)) {
        return false;
      }
      return true;
    };
    Frame.prototype.resolveSelf = function(cls) {
      return this.constant_pool[cls.this_class] = cls;
    };
    Frame.prototype.resolveMethod = function(cls, name) {
      var cls_ref, method_ref;
      cls_ref = this.constant_pool[cls];
      return method_ref = this.constant_pool[name];
    };
    return Frame;
  })();
}).call(this);
