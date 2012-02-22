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
      this.pc = 0;
      this.returntype = this.method.returntype;
      this.name = this.method.name;
      this.locals = {};
    }
    NativeFrame.prototype.execute = function(opcodes) {
      this.thread.log(this.clsname + '-' + this.name);
      return this.thread.resolveNativeClass(this.clsname, function() {
        var arg_num, args, i;
        if (this.locals[0]) {
          this.method['object'] = this.locals[0];
        }
        args = new Array();
        arg_num = this.method.args.length;
        i = 0;
        while (i < arg_num) {
          args.push(this.locals[i++]);
        }
        return this.thread.executeNativeMethod(this.clsname, this.name, args, function(returnval) {
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
        }, this);
      }, this);
      /*
          @thread.resolveNativeClass(@clsname, (nativeCls) -> 
            nativeCls['thread'] = @thread
            
            if @locals[0]
              nativeCls['object'] = @locals[0]
              nMethod = nativeCls[@method.name]
          
              args = new Array()
              args.push(@env)
              args.push(nativeCls)
          
              arg_num = @method.args.length
              # store args in locals; arg1 = locals[0] etc
              # static invocation
              if @method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC
                while arg_num > 0
                  args.push(@locals[--arg_num])
              
              else
                while arg_num > 0
                  args.push(@locals[arg_num--])
                # put objectref (this) in new method local 0
                args.push(@locals[0])
              
              # Exectute the Native Method TODO, appropriate arguments
              returnval = nMethod.apply(nativeCls, args)
              
              
          
          , @)
          
          */
    };
    return NativeFrame;
  })();
}).call(this);
