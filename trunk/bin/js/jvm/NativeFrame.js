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
      this.returntype = this.method.returntype;
      this.name = this.method.name;
      this.locals = {};
    }
    NativeFrame.prototype.execute = function(pc, opcodes) {
      var arg_num, args, nMethod, nativeCls, returnval;
      nativeCls = this.thread.RDA.method_area[this.clsname];
      if (nativeCls === void 0) {
        this.env.JVM_ResolveNativeClass(this.cls, this.thread);
        return false;
      }
      nativeCls['thread'] = this.thread;
      if (this.locals[0]) {
        nativeCls['object'] = this.locals[0];
      }
      nMethod = nativeCls[this.method.name];
      if (nMethod === void 0) {
        this.env.JVM_ResolveNativeMethod(this.cls, this.method.name);
        return false;
      }
      args = new Array();
      args.push(this.env);
      args.push(nativeCls);
      arg_num = this.method.args.length;
      if (this.method.access_flags & this.thread.RDA.JVM.JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC) {
        while (arg_num > 0) {
          args.push(this.locals[--arg_num]);
        }
      } else {
        while (arg_num > 0) {
          args.push(this.locals[arg_num--]);
        }
        args.push(this.locals[0]);
      }
      returnval = nMethod.apply(nativeCls, args);
      if (returnval != null) {
        this.op_stack.push(returnval);
      }
      switch (this.returntype.charAt(0)) {
        case 'B':
        case 'C':
        case 'I':
        case 'Z':
        case 'S':
          return opcodes[172]["do"](this);
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
