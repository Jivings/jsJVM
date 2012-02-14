class this.MethodFactory

  constructor : (@thread) ->
            
  createFrame : (method, cls) ->
  
    if method.access_flags & 0x0100
      frame = new NativeFrame(method, cls, null, @thread)
      @thread.current_frame = frame
      @thread.native_stack.push(frame)
      return frame
      
    else 
      frame = new Frame(method, cls)
      @thread.current_frame = frame
      @thread.jvm_stack.push(frame)
      return frame
    
  
  
