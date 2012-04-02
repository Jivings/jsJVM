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
      object.colour = 0
      @younggen[ref] = object
      return new JVM_Reference(ref)

    @heap.get = (ref) ->
      try
        pointer = ref.pointer
        if (object = @younggen[pointer]) or (object = @oldgen[pointer]) or (object = @permgen[pointer])
          return object
        else
            throw "Object not found"
      catch e
          error = "Failed to retrieve Object from Heap" + e ? ": " + e : ""
          throw error
    @heap.update = (ref, newobject) ->
        pointer = ref.pointer
        if @younggen[pointer]
            @younggen[pointer] = newobject
        else if @oldgen[pointer]
            @oldgen[pointer] = newobject
        else if @permgen[pointer]
            @permgen[pointer] = newobject
        else
            throw "Object not found"

    @threads = new Array()
    #@GC = new GC(@method_area, @heap, @threads)

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
  addClass : (classname, raw_class, instantiatedCallback, threadFinishedCallback) ->
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
        @createThread classname, method, null, threadFinishedCallback
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
      @createThread(classname, clsini, null, callback)
      ###@clinitThread.callback.push(callback)
      
      if @clinitThread.finished or !@clinitThread.init
        @clinitThread.finished = false
        @clinitThread.postMessage(message)
      else
        @clinitThread.waiting.push(message)
      ###
      
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
        worker = e.target
        @JVM.JVM_ResolveStringLiteral(data.string, (stringref) ->
          worker.postMessage({
            'action' : 'resource',
            'resource' : stringref
          })
        )
      
      'getObject' : (data) ->
        object = @heap.get(data.reference)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : object
        })
        
      'updateObject' : (data) -> 
        @heap.update(data.reference, data.object)
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
        obj = @heap.get(data.reference)
        obj[data.fieldname] = data.value
        e.target.postMessage({
          'action' : 'notify'
        })
        
      'getObjectField' : (data) ->
        obj = @heap.get(data.reference)
        value = obj[data.fieldname]
        e.target.postMessage({
          'action' : 'resource',
          'resource' : value
        })
        
      'aquireLock' : (data) ->
        if(@heap.get(data.reference).monitor.aquireLock(e.target))
          e.target.postMessage({
            'action' : 'notify'
          })
      'releaseLock' : (data) ->
        @heap.get(data.reference).monitor.releaseLock(e.target)
        
      
      'allocate' : (data) ->
        ref = @heap.allocate(data.object)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : ref
        })

      'allocateNew' : (data) ->
        classname = data.classname
        @JVM.JVM_ResolveClass(classname, e.target, (cls) =>
          obj = new JVM_Object(cls)
          ref = @heap.allocate(obj)
          e.target.postMessage({
            'action' : 'resource',
            'resource' : ref
          })
        )
    
      'GCreport' : (data) ->
        @GC.add(data.objectrefs)

      'log' : (data) ->
          if typeof data.message is 'object' then console.log data.message
          else
            console.log('#'+data.id+' '+data.message)
        
      'finished' : (data) ->
        console.log('Thread #' + data.id + ' finished')
        if data.result isnt 1
            throw 'Thread died with error ' + data.error

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
    
   
  
  

  
 
  
 
      
  
    
