(function() {
  this.NativeFrame = (function() {
    function NativeFrame(method, cls, env, thread) {
      this.method = method;
      this.cls = cls;
      this.env = env;
      this.thread = thread;
      this.op_stack = new Array();
      this.resolved = true;
      this.clsname = 'native/' + this.cls.real_name;
      this.args = this.method.args;
      this.returntype = this.method.returntype;
      this.name = this.method.name;
      this.locals = {};
    }
    NativeFrame.prototype.execute = function(pc, opcodes) {
      var nMethod, nativeCls, returnval;
      nativeCls = this.thread.RDA.method_area[this.clsname];
      if (nativeCls === void 0) {
        this.env.JVM_ResolveNativeClass(this.cls, this.thread);
        return false;
      }
      nMethod = nativeCls[this.method.name];
      if (nMethod === void 0) {
        this.env.JVM_ResolveNativeMethod(this.cls, this.method.name);
        return false;
      }
      returnval = nMethod.call(nativeCls, this.env, nativeCls, this.args);
      if (returnval != null) {
        this.op_stack.push(returnval);
      }
      switch (this.returntype) {
        case 'B':
        case 'C':
        case 'I':
        case 'Z':
        case 'S':
          return opcodes[171]["do"](this);
        case 'D':
          this.op_stack.push(returnval);
          return opcodes[175]["do"](this);
        case 'F':
          return opcodes[174]["do"](this);
        case 'J':
          this.op_stack.push(returnval);
          return opcodes[173]["do"](this);
        case 'L':
        case '[':
          return opcodes[176]["do"](this);
        default:
          return opcodes[177]["do"](this);
      }
    };
    return NativeFrame;
  })();
}).call(this);
