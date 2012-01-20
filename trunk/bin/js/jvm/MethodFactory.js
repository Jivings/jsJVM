(function() {
  this.MethodFactory = (function() {
    function MethodFactory(thread, JVM_env) {
      this.thread = thread;
      this.JVM_env = JVM_env;
      this.method_modifiers = this.JVM_env.JVM_RECOGNIZED_METHOD_MODIFIERS;
    }
    MethodFactory.prototype.createFrame = function(method, cls) {
      var frame;
      if (method.access_flags & this.method_modifiers.JVM_ACC_NATIVE) {
        frame = new NativeFrame(method, cls, this.JVM_env, this.thread);
        this.thread.current_frame = frame;
        this.thread.native_stack.push(frame);
        return frame;
      } else {
        frame = new Frame(method, cls);
        this.thread.current_frame = frame;
        this.thread.jvm_stack.push(frame);
        return frame;
      }
    };
    return MethodFactory;
  })();
}).call(this);
