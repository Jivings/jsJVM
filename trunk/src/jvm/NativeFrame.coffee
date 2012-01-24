class this.NativeFrame


  constructor : (@method, @cls, @env, @thread) ->
    @op_stack = new Array()
    @resolved = true
    @clsname = 'native/' + @cls.real_name
    @args = @method.args
    @returntype = @method.returntype
    @name = @method.name
    @locals = {}
    
  execute : (pc, opcodes) ->
    
   # if @resolved is false
    #   console.log('UnsatisfiedLinkError: '+ @cls.real_name + '...' + method.name)
    nativeCls = @thread.RDA.method_area[@clsname]
        
    if nativeCls is undefined
      @env.JVM_ResolveNativeClass(@cls, @thread)
      return false
      
    nMethod = nativeCls[@method.name]
    
    if nMethod is undefined
      @env.JVM_ResolveNativeMethod(@cls, @method.name)
      return false
      
    # Exectute the Native Method TODO, appropriate arguments
    returnval = nMethod.call(nativeCls, @env, nativeCls, @args)
    
    if returnval?
      @op_stack.push(returnval) 
      
    switch(@returntype)
      when 'B', 'C', 'I', 'Z', 'S'
        opcodes[171].do(@)
      when 'D' 
        @op_stack.push(returnval) 
        opcodes[175].do(@)
      when 'F' 
        opcodes[174].do(@)
      when 'J'
        @op_stack.push(returnval) 
        opcodes[173].do(@)
      when 'L', '['
        opcodes[176].do(@)
      else opcodes[177].do(@)
    
  
