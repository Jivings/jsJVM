###
Runtime Data Area of the JVM. Stores all class, method and stack data.
###

class this.RDA 
  constructor : ->
    
    # threads that are currently waiting on a lock
    @waiting = new Array()
    
    # All parsed class information is stored in the method area
    @method_area = {}
    
    # All instatiated Objects are placed on the Heap
    @heap = {
      permgen : {}
      oldgen : {}
      younggen : {}
    }
    
    @heap.allocate = function(object_detail) {
      this[@length] = object_detail
      return @length
    }
    
    @threads = new Array()
  
  addClass : (classname, raw_class) ->
    @method_area[classname] = raw_class
    
    @clinit(classname, raw_class)
    if raw_class.methods['main']?
      @createThread classname, 'main'
            
  createThread : (mainClassName, method) ->
    # TODO Thread ID?
    that = @
    t = new Thread(@method_area[mainClassName], @, method)
    @threads.push(t)
    thread_id = @threads.length-1
    # start the thread. Callback removes the thread from the pool when it terminates
    t.start( -> that.threads.splice(thread_id, thread_id+1))
    this
  
  # Execute the clinit method of a class.
  clinit : (classname, raw_class) ->
    # create class instance variables
    clsini= raw_class.methods['<clinit>']
    if clsini?
      t = new Thread(raw_class, @, '<clinit>')
      t.start()
    yes
  
  # notify all threads waiting on a particular notifier object
  # threads will continue executing from where they were paused.
  notifyAll : (notifierName) ->
    for lock,thread of @waiting
      if(lock == notifierName)
        thread['continue'](notifierName)
    yes
      

class this.Thread 
  constructor : (_class, @RDA, startMethod) ->

    @opcodes = new OpCodes(@)
    @methodFactory = new MethodFactory(@, @RDA.JVM)
    # pointers to the current executing structures
    @current_class = _class
    @methods = @current_class.methods
    
    @pc = 0
    # The JVM stack consists of one frame for each method executing or queued.
    @jvm_stack = new Array()
    # add a peek method to the stack
    @jvm_stack.peek = () ->
      return @[@length-1]
    # The native stack consists of currently executing native methods.
    @native_stack = new Array()
    @native_stack.peek = () ->
      return @[@length-1]
      
    @current_frame = @createFrame(@methods[startMethod], @current_class)  
    this
  
  createFrame : (method, cls) ->
    @methodFactory.createFrame(method, cls)
    
  start : (destroy) ->
    while @current_frame?
      if(!@current_frame.execute(@pc, @opcodes)) then return false
      @pc++
    
    yes  
    # end gracefully TODO (line 36, maybe Garbage collect?)
    #destroy()
 
  resolveClass : (index) ->
    name = @current_class.constant_pool[index]
    if @RDA.method_area[name] == undefined
      # request the ClassLoader loads the class this thread needs and say we are waiting
      @RDA.JVM.load(name, true)
      # tell the RDA that this thread is currently waiting
      @RDA.waiting[name] = @
      # set the return index in the constant pool
      @index = index
   
  ###
  Called when waiting threads are notified by the RDA. Will continue opcode 
  loop
  ### 
  continue : (name) ->
    @current_class.constant_pool[@index] = @RDA.method_area[name]
    @start()
 
 
 
 
 
 
 
    
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
    @resolveSelf(cls)

    @locals = {}
    
    this

  execute : (@pc, opcodes) ->
    op = @method_stack[@pc]
    if(!opcodes[op].do(@)) then return false
    return yes
  
  resolveSelf : (cls) ->
    @constant_pool[cls.this_class] = cls
  
   
  resolveMethod : (cls, name) ->
    cls_ref = @constant_pool[cls]
    method_ref = @constant_pool[name]
   
       
      
  
  
    
