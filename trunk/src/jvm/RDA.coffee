###
  Runtime Data Area of the JVM. Stores all loaded Classes, 
  instantiated Objects and running or paused Threads.
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
      0 : null # null object on heap, for all null references
    }
    
    @heap.allocate = (object) -> 
      if object instanceof JVM_Reference
        throw "Reference on heap?"
      ref = ++@id
      this[ref] = object
      return new JVM_Reference(ref)
    
    @threads = new Array()
    
    # Define a thread foo clinit methods. These we want to take place synchronously
    @clinitThread = new Worker(Settings.workerpath+'/Thread.js')
    @clinitThread['finished'] = true 
    @clinitThread.waiting = new Array() 
    self = @
    @clinitThread.loaded = 0
    @clinitThread.onmessage = (e) -> 
      self.message.call(self, e)
    @clinitThread.onerror = (e) ->
      console.log(e)
    @clinitThread.init = true
    @clinitThread.callback = new Array()
  addNative : (name, raw_class) ->
    @method_area[name] = raw_class
  
  ###
    Adds a Class loaded by the ClassLoader to the Method Area. 
    If the Class has a <clinit> method, that will be executed here.
    
    If the Class is the entry point to the application, the main method will be
    resolved and executed.
  ###
  addClass : (classname, raw_class, instantiatedCallback) ->
    # create class object
    
    # final resolution step, resolve superclass reference
    cls = raw_class
    while (cls = cls.get_super()) isnt undefined
      if !@method_area[cls.real_name]
        @method_area[cls.real_name] = cls
         
    @method_area[classname] = raw_class

    @clinit(classname, raw_class, () =>
      # when the class is initialised, run the main method if it has one
      if classname is @JVM.mainclassname
        method = @JVM.JVM_ResolveMethod(raw_class, 'main', '([Ljava/lang/String;)V')
        @createThread classname, method 
      if instantiatedCallback then instantiatedCallback() 
         
    )
    # If a class needs to be initialised synchronously, a callback can be used here
   
    
  ###
    Creates a new Thread instance to execute Java methods. Each Java Thread 
    is represented by a JavaScript worker
  ###          
  createThread : (mainClassName, method, locals, callback) ->
   
    id = @threads.length - 1
    t = new Worker(Settings.workerpath + '/Thread.js')
    self = @
    t.onmessage = (e) -> 
      self.message.call(self, e)
    t.onerror = (e) ->
      console.log(e)
    # Add the Thread to the global Thread pool.
    @threads.push(t)
    if callback
      t.callback = callback
    args = { 
      'action' : 'new'
      'resource' : {
        'class' : @method_area[mainClassName]
        'id' : id
        'entryMethod' : method
        'locals' : locals
      }        
    }
    # start the thread
    t.postMessage(args)
       
    yes
  

  ###
    If a Class contains a <clinit> method, it is executed as the class
    is loaded
  ###
  clinit : (classname, raw_class, callback) ->
    # resolve the clinit method
    clsini = @JVM.JVM_ResolveMethod(raw_class, '<clinit>', '()V')
    if clsini 
      message = {
          'action' : 'new'
          'resource' : {
            'class' : raw_class
            'id' : 0
            'entryMethod' : clsini          
          }
      }
      @clinitThread.callback.push(callback)
      
      if @clinitThread.finished or !@clinitThread.init
        @clinitThread.finished = false
        @clinitThread.postMessage(message)
      else
        @clinitThread.waiting.push(message)
    else
      callback()
    yes
  
  ###
    Notify all threads waiting on a particular notifier object.
    Threads will continue executing from where they were paused.
    @see Thread.notify()
  ###
  notifyAll : (notifierName, data) ->
    #for lock,thread of @waiting
      #if(lock == notifierName)
        #thread.postMessage({
        #  'action' : 'resource',
        #  'resource' : data
        #})
        #delete @waiting[notifierName]
    
    yes
  
      
  ###
    Thread interface methods. The following are messages received from 
    running Threads. These are detailed individually, but are usually requests
    for resources such as Objects.
  ###

  message : (e) ->
    
    actions = {
      'resolveClass' : (data) ->
        @JVM.JVM_ResolveClass(data.name, e.target, (cls) =>
          e.target.postMessage({
            'action' : 'resource',
            'resource' : cls
          })
        )
        
      'resolveNativeClass' : (data) ->
        if @JVM.JVM_ResolveNativeClass(data.name, e.target)
          e.target.postMessage({
            'action' : 'notify'
          })
                
      'resolveMethod' : (data) ->
        @JVM.JVM_ResolveClass(data.classname, e.target, (cls) =>
          method = @JVM.JVM_ResolveMethod(cls, data.name, data.descriptor)
          e.target.postMessage({
            'action' : 'resource',
            'resource' : method
          })
        )
       
      'executeNativeMethod' : (data) ->
        returnval = @JVM.JVM_ExecuteNativeMethod(data.classname, data.methodname, data.args)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : returnval
        })
        
      'resolveField' : (data) ->
        # never used
      'resolveString' : (data) ->
        @JVM.JVM_ResolveStringLiteral(data.string, (stringref) ->
          e.target.postMessage({
            'action' : 'resource',
            'resource' : stringref
          })
        )
      
      'getObject' : (data) ->
        object = @heap[data.reference.pointer]
        e.target.postMessage({
          'action' : 'resource',
          'resource' : object
        })
        
      'updateObject' : (data) -> 
        @heap[data.reference.pointer] = data.object
        e.target.postMessage({
          'action' : 'notify'
        })
      
      'getStatic' : (data) ->
        field = @method_area[data.classname].fields[data.fieldname]
        e.target.postMessage({
          'action' : 'resource',
          'resource' : field
        })
      'setStatic' : (data) ->
        @method_area[data.classname].fields[data.fieldname] = data.value
        e.target.postMessage({
          'action' : 'notify'
        })
      'setObjectField' : (data) ->
        obj = @heap[data.reference.pointer]
        obj[data.fieldname] = data.value
        e.target.postMessage({
          'action' : 'notify'
        })
        
      'getObjectField' : (data) ->
        obj = @heap[data.reference.pointer]
        value = obj[data.fieldname]
        e.target.postMessage({
          'action' : 'resource',
          'resource' : value
        })
        
      'aquireLock' : (data) ->
        if(@heap[data.reference.pointer].monitor.aquireLock(e.target))
          e.target.postMessage({
            'action' : 'notify'
          })
      'releaseLock' : (data) ->
        @heap[data.reference.pointer].monitor.releaseLock(e.target)
        
      
      'allocate' : (data) ->
        ref = @heap.allocate(data.object)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : ref
        })
        
      'log' : (data) ->
        console.log('#'+data.id+' '+data.message)
        
      'finished' : (data) ->  
        console.log('Thread #' + data.id + ' finished')
        if e.target is @clinitThread
          @clinitThread.loaded++
          @clinitThread.callback.pop().call(@)
          nextClinit = @clinitThread.waiting.pop()
          if nextClinit
            @clinitThread.postMessage(nextClinit)
          else
            @clinitThread.finished = true
            if @clinitThread.init
              @clinitThread.init = false
              # finally, JVM init is complete so we can load the main class
              @JVM.InitializeSystem( () =>
                @JVM.load(@JVM.mainclassname)
              )
        else if e.target.callback
          e.target.callback()                    
    }
    
    actions[e.data.action].call(@, e.data)
    
   
  
  

  
 
  
 
      
  
    
