###
  A stack frame contains the state of one method invocation. When a method is   
  invoked a new frame is pushed onto the thread's stack.
###
class this.Frame
  
  constructor : (method, @cls) -> 
    
    @method_stack = method.attributes.Code.code
    @op_stack = new Array()
    @op_stack.peek = () ->
      return @[@length-1]
    @op_stack.push = (word) ->
      if word == undefined
        throw "NullStackException"
      else if word instanceof JVM_Object
        throw "ObjectOnStackException"
      @[@length] = word
      yes
        
    @constant_pool = @cls.constant_pool
    @resolveSelf(@cls)
    @name = method.name
    @locals = {}
    @pc = 0
    
    this

  ###
    Execute the next opcode in the method_stack
    If the opcode returns false then execution will pause
  ###
  ###execute : (opcodes) ->
    op = @method_stack[@pc]
        
    if(!opcodes[op].do(@)) then return false
    return yes
  ###
  execute : (opcodes, t) ->
    
    op = @method_stack[@pc]
    t.log(@cls.real_name + '-' + 
          @name + '\t\t' + 
          op + '\t\t' + 
          opcodes[op].description 
    )
    result = opcodes[op].do(@)
    ++@pc
    return result
      
      
    
  resolveSelf : (cls) ->
    @constant_pool[cls.this_class] = cls
  
  ###   
  resolveMethod : (cls, name) ->
    cls_ref = @constant_pool[cls]
    method_ref = @constant_pool[name]
  ###
  
  
       
