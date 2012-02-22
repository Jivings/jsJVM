(function() {
  this.MethodFactory = (function() {
    function MethodFactory(thread) {
      this.thread = thread;
    }
    MethodFactory.prototype.createFrame = function(method, cls) {
      var frame;
      if (method.access_flags & 0x0100) {
        frame = new NativeFrame(method, cls, null, this.thread);
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
