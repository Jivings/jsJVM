class this.NativeFrame


  constructor : (@method, @cls, @env, @thread) ->
    @op_stack = new Array()
    @resolved = true
    @clsname = 'native/' + @cls.real_name
    @pc = 0
    
    @returntype = @method.returntype
    @name = @method.name
    @locals = {}
    
  execute : (opcodes) ->
    
    @thread.log(@clsname + '-' + @name)
    
    @thread.resolveNativeClass(@clsname, () -> 
      if @locals[0]
        @method['object'] = @locals[0]

      args = new Array()
      arg_num = @method.args.length
      # store args in locals; arg1 = locals[0] etc

      # static invocation
      if @method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC
        i = 0
        while i < arg_num
          args.push(@locals[i++])

      # include this reference in local 0
      else
        i = 1 
        while i < arg_num+1
          args.push(@locals[i++])
        
            
      @thread.executeNativeMethod(@clsname, @name, args, (returnval) ->
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
      , @)
    , @)
    
    ###
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
    
    ###
    
    
    
    
    
    
    
        
    
    
    
  
