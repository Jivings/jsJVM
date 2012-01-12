class this.NativeFrame extends Frame
  constructor : (method, @cls, @env) ->
    @name = method.name 
      
    try 
      @method = @cls.native[method.name]
    catch err
      console.log('UnsatisfiedLinkError: '+ @cls.real_name + '...' + method.name)
      return false
    
    descriptor_index = @cls.methods[method.name].descriptor_index
    
    @descriptor = @cls.constant_pool[descriptor_index]
    @args = @descriptor.substring(@descriptor.indexOf('(')+1, @descriptor.indexOf(')'))
    @returntype = @descriptor.substring(@descriptor.indexOf(')')+1)
    @op_stack = new Array()
    
  execute : (pc, opcodes) ->
    
    # Exectute the Native Method 
    returnval = @method.call(@cls.native, @env, @cls)
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
        opcodes[173].do(@)
      when 'L', '['
        opcodes[176].do(@)
      else opcodes[177].do(@)
    
  
