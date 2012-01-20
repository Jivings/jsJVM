class this.MethodFactory

  constructor : (@thread, @JVM_env) ->
    @method_modifiers = @JVM_env.JVM_RECOGNIZED_METHOD_MODIFIERS
            
  createFrame : (method, cls) ->
  
    if method.access_flags & @method_modifiers.JVM_ACC_NATIVE 
      frame = new NativeFrame(method, cls, @JVM_env, @thread)
      @thread.current_frame = frame
      @thread.native_stack.push(frame)
      return frame
      
    else 
      frame = new Frame(method, cls)
      @thread.current_frame = frame
      @thread.jvm_stack.push(frame)
      return frame
    
  
  
