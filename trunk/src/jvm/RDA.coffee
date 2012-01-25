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
      id : 0
    }
    
    @heap.allocate = (object) -> 
      ref = ++@id
      this[ref] = object
      return new JVM_Reference(ref)
    
    @threads = new Array()
    
  addNative : (name, raw_class) ->
    @method_area[name] = raw_class
  
  addClass : (classname, raw_class) ->
    # final resolution step, resolve superclass reference
    supercls = @method_area[raw_class.get_super()]
    raw_class.constant_pool[raw_class.super_class] = supercls
    @method_area[classname] = raw_class

    @clinit(classname, raw_class)
    
   # if (method = @JVM.JVM_ResolveMethod(raw_class, 'main', '([Ljava/lang/String;)V'))?
    if classname is @JVM.mainclassname
      method = @JVM.JVM_ResolveMethod(raw_class, 'main', '([Ljava/lang/String;)V')
      @createThread classname, method      
            
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
    clsini = @JVM.JVM_ResolveMethod(raw_class, '<clinit>', '()V')
    if clsini
      t = new Thread(raw_class, @, clsini)
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
      
    @current_frame = @createFrame(startMethod, @current_class)  
    this
  
  createFrame : (method, cls) ->
    @methodFactory.createFrame(method, cls)
    
  start : (destroy) ->
    @pc = @current_frame.pc
    
    while @current_frame?
      #@RDA.JVM.debugWindow.addFrame(@current_frame)
      #console.log(@current_frame)
      # debug

      if @current_frame instanceof Frame
        opcode = @opcodes[@current_frame.method_stack[@pc]]
        value = @current_frame.method_stack[@pc]
        #@RDA.JVM.debugWindow.addOpcode(opcode, value)
        console.log(@current_class.real_name + '-' + @current_frame.name + '\t\t' + value + '\t\t'+ opcode.description )
      else 
        console.log(@current_class.real_name + '-' + @current_frame.name)
      if(!@current_frame.execute(@pc, @opcodes)) then return false
      @pc++
    
    yes  
    # end gracefully TODO (line 36, maybe Garbage collect?)
    #destroy()
 
  resolveClass : (clsname) ->
    @RDA.JVM.JVM_ResolveClass(clsname, @)
     
  resolveMethod : (name, cls, type) ->
    @RDA.JVM.JVM_ResolveMethod(cls, name, type)    
   
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

  execute : (@pc, opcodes) ->
    op = @method_stack[@pc]
    if(!opcodes[op].do(@)) then return false
    return yes
  
  resolveSelf : (cls) ->
    @constant_pool[cls.this_class] = cls
     
  resolveMethod : (cls, name) ->
    cls_ref = @constant_pool[cls]
    method_ref = @constant_pool[name]
   
       
      
  
    
