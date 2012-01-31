class this.NativeFrame


  constructor : (@method, @cls, @env, @thread) ->
    @op_stack = new Array()
    @resolved = true
    @clsname = 'native/' + @cls.real_name
    
    
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
    nativeCls['thread'] = @thread
    
    if @locals[0]
      nativeCls['object'] = @locals[0]
    nMethod = nativeCls[@method.name]
    
    if nMethod is undefined
      @env.JVM_ResolveNativeMethod(@cls, @method.name)
      return false
    
    args = new Array()
    args.push(@env)
    args.push(nativeCls)
    
    arg_num = @method.args.length
    # store args in locals; arg1 = locals[0] etc
    # static invocation
    if @method.access_flags & @thread.RDA.JVM.JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC
      while arg_num > 0
        args.push(@locals[--arg_num])
    
    else
      while arg_num > 0
        args.push(@locals[arg_num--])
      # put objectref (this) in new method local 0
      args.push(@locals[0])
        
    #if @method.args.length > 0
    #  for index in [@method.args.length..1]
    #    args.push(@locals[index])
    # Exectute the Native Method TODO, appropriate arguments
    returnval = nMethod.apply(nativeCls, args)
    
    if returnval?
      @op_stack.push(returnval) 
      
    switch(@returntype.charAt(0))
      when 'B', 'C', 'I', 'Z', 'S'
        opcodes[172].do(@)
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
    
  
