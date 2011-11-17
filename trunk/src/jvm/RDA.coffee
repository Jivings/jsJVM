###
Runtime Data Area of the JVM. Stores all class, method and stack data.
###
#opcodes = 0

class this.RDA 
  constructor : ->
    
   #opcodes = new OpCodes()
    
    # All parsed class information is stored in the method area
    @method_area = {}
    
    # All instatiated Objects are placed on the Heap
    @heap = {
      permgen : {}
      oldgen : {}
      younggen : {}
    }
    
    @threads = new Array()
  
  addClass : (classname, raw_class) ->
    @method_area[classname] = raw_class
    
    if raw_class.methods['main']?
      @createThread classname      
            
  createThread : (mainClassName) ->
    # TODO Thread ID?
    that = @
    t = new Thread(@method_area[mainClassName], @)
    @threads.push(t)
    thread_id = @threads.length-1
    # start the thread. Callback removes the thread from the pool when it terminates
    t.start( -> that.threads.splice(thread_id, thread_id+1))
    this
  
  clinit : (raw_class) ->
    # create class instance
    clinit = raw_class.methods[clinit]
    if clinit?
      for opcode in clinit.attributes.Code.code
        opcode.do() 
    yes
    
    
  

class this.Thread 
  constructor : (_class, @RDA) ->

    # pointers to the current executing structures
    @current_frame = {}
    @current_class = _class
    
    @pc = 0
    # The JVM stack consists of one frame for each method executing or queued.
    @jvm_stack = new Array()
    # add a peek method to the stack
    @jvm_stack.peek = () ->
      return @[@length-1]
    # The native stack consists of currently executing native methods.
    @native_stack = new Array()
    # Variable Stack
    #@stack = new Array()
    this
  
  start : (destroy) ->
    @opcodes = new OpCodes(@)
    methods = @current_class.methods
    @current_frame = new Frame(methods.main, @current_class)
    len  = @jvm_stack.push(@current_frame);
    
    while @current_frame?
      @current_frame.execute(@pc, @opcodes)
      @pc++
    # end gracefully
    destroy()
    
  ###
  Called when a method is invoked. Allocates a section of 
  memory to the method and begins bytecode execution.
  When the method is finished, it is removed from memory.
  ###
  execute : () ->
    
    #@current_method = @jvm_stack.pop()
    #  while (op = opcodes[@current_method.method_stack[@pc]]) isnt null 
    #    if(!op.do(@)) then break
    #    @pc++
    #while (op = opcodes[@current_method.method_stack[@pc]]) isnt null 
    #  if (!op.do(@)) then break
    #  @pc++
      
    # trigger garbage collection on this method
    #@current_method = null
    # reset program counter
    #@pc = 0
    # terminate gracefully on completion
    yes
      
  
 
  
    
###
A stack frame contains the state of one method invocation. When a method is invoked, 
a new frame is pushed onto the threads stack.
###
class this.Frame
  
  constructor : (method, cls) -> 
  
    @method_stack = method.attributes.Code.code
    @op_stack = new Array()
    @constant_pool = cls.constant_pool
    @resolveClass(cls)

    @locals = {}
    
    this

  execute : (@pc, opcodes) ->
    op = @method_stack[@pc]
    opcodes[op].do(@)
    return @pc
  
  resolveClass : (cls) ->
    @constant_pool[cls.this_class] = cls
  
  resolveMethod : (cls, name) ->
    cls_ref = @constant_pool[cls]
    method_ref = @constant_pool[name]
   
       
      
  
  
    
