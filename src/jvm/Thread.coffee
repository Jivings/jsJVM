worker = this
theThread = null
worker.onmessage = (e)->
  actions = {
    'new' : (data) ->
      theThread = new Thread(data['class'], data.entryMethod, data.id)
      if data.locals
        theThread.current_frame.locals = data.locals
      theThread.start()
    
    'GCreport' : () ->
        theThread.reportObjects()

    'notify' : () ->
      if @callback
        # resource requests can be nested, so we only want to continue opcode
        # loop if the callback returns successfully
        if @callback.call(@caller)
          @callback = null
          theThread.continue()
      else
        theThread.continue()
          
     'resource' : (resource) ->
      if @callback isnt null
        # resource requests can be nested, so we only want to continue opcode
        # loop if the callback returns successfully
        if @callback.call(@caller, resource)
          @callback = null
          theThread.continue()
      else
        theThread.continue()
  }
  actions[e.data.action].call(theThread, e.data.resource)

# Worker imports:
importScripts('../jvm.js')  
  
  

class this.Thread 
  constructor : (_class, startMethod, @id) ->

    @opcodes = new OpCodes(@)
    
    @methodFactory = new MethodFactory(@)
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
  
  reportObjects : () ->
    objs = new Array()
    for index of @jvm_stack
        frame = @jvm_stack[index]
        for index of frame.op_stack
            item = frame.op_stack[index]
            if item.pointer
                objs.push(item)
        for index of frame.locals
            item = frame.locals[index]
            if item.pointer
                objs.push(item)

    worker.postMessage({
        'action' : 'GCreport'
        'objectrefs' : objs
    })

  start : (destroy) ->
    @pc = @current_frame.pc
    
    while @current_frame?
      
      if @current_frame.execute(@opcodes, @)  
        continue
      else  
        return false
      #if(!@current_frame.execute(@opcodes))
      #  @current_frame.pc++
      #  return false
      #if @current_frame  
      #  @current_frame.pc++
    
    # terminate this worker
    @finished()
 
  
  ###
    The following methods request the JVM load specific resources.
    During reolution this Thread will be paused on the invoking opcode.
    Execution will continue when the Thread is notified by the JVM that the 
    resource has been loaded. The paused opcode will by interpretted from its 
    original state before the resolution.
  ###
 
  ###
    Ask RDA to resolve a Class.
  ###
  resolveClass : (clsname, @callback, @caller) ->
    # already resolved?
    if typeof clsname is 'object'
      cb = @callback
      @callback.call(@caller, clsname)
      # the callback can make a new callback. We wouldn't want to set that one
      # to null!
      if @callback is cb
        @callback = null
      return
    while (typeof clsname is 'number')
      clsname = @current_class.constant_pool[clsname]
    
    worker.postMessage({ 
      'action' : 'resolveClass',
      'name' : clsname, 
      'id' : @id 
    })
    
  resolveNativeClass : (clsname, @callback, @caller) ->
    worker.postMessage({ 
      'action' : 'resolveNativeClass', 
      'name' : clsname, 
      'id' : @id 
    })

  allocateNew : (classname, @callback, @caller) ->
    worker.postMessage({
        'action' : 'allocateNew',
        'classname' : classname,
        'id' : '@id'
    })
  executeNativeMethod : (clsname, methodname, args, @callback, @caller) ->
    worker.postMessage({
      'action' : 'executeNativeMethod',
      'classname' : clsname,
      'methodname' : methodname,
      'args' : args,
      'id' : @id
    })
  ###
    Ask RDA to resolve a Method
  ###
  resolveMethod : (methodname, classname, descriptor, @callback, @caller) ->
    if classname.real_name
      classname = classname.real_name
    worker.postMessage({ 
      'action' : 'resolveMethod', 
      'name' : methodname, 
      'classname' : classname, 
      'descriptor' : descriptor,
      'id' : @id 
    }) 

  
  
  ###
    Ask RDA to resolve a Field
  ###
  resolveField : (cls, name, @callback, @caller) ->
    worker.postMessage({ 
      'action' : 'resolveField', 
      'name' : name, 
      'classname' : cls.real_name, 
      'id' : @id 
    })
    
  ###
    Ask RDA to resolve a String
  ###
  resolveString : (stringLiteral, @callback, @caller) ->
    worker.postMessage({
      'action' : 'resolveString',
      'string' : stringLiteral
    })
    
  ###
    Retrieve an Object from the Heap
  ###
  getObject : (ref, @callback, @caller) ->
    worker.postMessage({
      'action' : 'getObject',
      'reference' : ref      
    })
    
  
  ###
    Pass an Object back to the RDA to be saved to the stack. 
    Not threadsafe unless this Thread is the Objects monitor.
  ###
  updateObject : (ref, newobject) ->
    @callback = null
    worker.postMessage({
      'action' : 'updateObject',
      'reference' : ref,
      'object'  : newobject
    })
  
  ###
    Attempt to aquire a lock on an Object.
    If another Thread holds this lock then this Thread will wait.    
  ###
  aquireLock : (ref, @callback, @caller) ->
    worker.postMessage({
      'action' : 'aquireLock',
      'reference' : ref  
    })
  
  ###
    Release this Threads lock on an Object
    If this Thread is not the Objects current monitor a 
    IllegalAccessException will be thrown.
  ###
  releaseLock : (ref, @callback, @caller) ->
    worker.postMessage({
      'action' : 'releaseLock',
      'reference' : ref
    })
    
  ###
    Allocate a new Object on the Heap
  ###
  allocate : (jobject, @callback, @caller) ->
    worker.postMessage({
      'action' : 'allocate',
      'object' : jobject
    )}    
  
  ###
    Log something nicely if the JVM is in verbose mode
  ###
  log : (message) ->
    worker.postMessage({
      'action' : 'log',
      'message' : message,
      'id' : @id   
    })
    
  ###
    Get a static field from the specified Class Object
    Not synchronized without keyword. 
  ###
  getStatic : (classname, fieldname, @callback, @caller) ->
    if typeof classname is 'object'
      classname = classname.real_name 
    worker.postMessage({
      'action' : 'getStatic',
      'classname' : classname,
      'fieldname' : fieldname
    })
  
  ###
    Set a static field in the specified Class Object
    Not synchronized without keyword. 
  ###  
  setStatic : (classname, fieldname, value) ->
    while (typeof classname is 'number') 
      classname = @current_class.constant_pool[clsname];
    if classname.real_name?
      classname = classname.real_name
    worker.postMessage({
      'action' : 'setStatic',
      'classname' : classname,
      'fieldname' : fieldname,
      'value' : value
    })
  
  ###
    Set a field in an Object.
    Not synchronized without keyword. 
  ###  
  setObjectField : (objectref, fieldname, value) ->
    worker.postMessage({
      'action' : 'setObjectField',
      'reference' : objectref,
      'fieldname' : fieldname,
      'value' : value
    })
  
  ###
    Get a field from an Object
    Not synchronized without keyword. 
  ###
  getObjectField : (objectref, fieldname, @callback, @caller) ->
  
    worker.postMessage({
      'action' : 'getObjectField',
      'reference' : objectref,
      'fieldname' : fieldname
    })
  
  finished : () ->
    worker.postMessage({
      'action' : 'finished',
      'id' : @id
    })  
  ###
  Called when waiting threads are notified by the RDA. Will continue opcode 
  loop
  ### 
  continue : (name) ->
    #@current_frame.pc++
    #@current_class.constant_pool[@index] = @RDA.method_area[name]
    @start()

