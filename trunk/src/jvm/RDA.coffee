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
      ref = ++@id
      this[ref] = object
      return new JVM_Reference(ref)
    
    @threads = new Array()
    
    @clinitThread = new Worker('js/jvm/Thread.js')
    @clinitThread['finished'] = true 
    @clinitThread.waiting = new Array() 
     
  addNative : (name, raw_class) ->
    @method_area[name] = raw_class
  
  ###
    Adds a Class loaded by the ClassLoader to the Method Area. 
    If the Class has a <clinit> method, that will be executed here.
    
    If the Class is the entry point to the application, the main method will be
    resolved and executed.
  ###
  addClass : (classname, raw_class) ->
    # create class object
    
    # final resolution step, resolve superclass reference
    supercls = @method_area[raw_class.get_super()]
    raw_class.constant_pool[raw_class.super_class] = supercls
    @method_area[classname] = raw_class

    @clinit(classname, raw_class)
    
    if classname is @JVM.mainclassname
      method = @JVM.JVM_ResolveMethod(raw_class, 'main', '([Ljava/lang/String;)V')
      @createThread classname, method      
    
  ###
    Creates a new Thread instance to execute Java methods. Each Java Thread 
    is represented by a JavaScript worker
  ###          
  createThread : (mainClassName, method) ->
   
    id = @threads.length - 1
    t = new Worker('js/jvm/Thread.js')
    self = @
    t.onmessage = (e) -> 
      self.message.call(self, e)
    t.onerror = (e) ->
      console.log(e)
    # Add the Thread to the global Thread pool.
    @threads.push(t)
    args = { 
      'action' : 'new'
      'resource' : {
        'class' : @method_area[mainClassName]
        'id' : id
        'entryMethod' : method
      }        
    }
    # start the thread
    t.postMessage(args)
       
    yes
  

  ###
    If a Class contains a <clinit> method, it is executed as the class
    is loaded
  ###
  clinit : (classname, raw_class) ->
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
      if @clinitThread.finished
        @clinitThread.finished = false
        @clinitThread.postMessage(message)
      else
        @clinitThread.waiting.push(message)

    yes
  
  ###
    Notify all threads waiting on a particular notifier object.
    Threads will continue executing from where they were paused.
    @see Thread.notify()
  ###
  notifyAll : (notifierName, data) ->
    for lock,thread of @waiting
      if(lock == notifierName)
        thread.postMessage({
          'action' : 'resource',
          'resource' : data
        })
    yes
   
  lockAquired : (thread) ->
     thread.postMessage({
          'action' : 'notify'
     })
    
  ###
    Thread interface methods. The following are messages received from 
    running Threads. These are detailed individually, but are usually requests
    for resources such as Objects.
  ###

  message : (e) ->
    actions = {
      'resolveClass' : (data) ->
        @JVM.JVM_ResolveClass(data.name, e.target)
                
      'resolveMethod' : (data) ->
        method = @JVM.JVM_ResolveMethod(data.classname, data.methodname, data.descriptor)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : method
        })
        
      'resolveField' : (data) ->
        # never used
      'resolveString' : (data) ->
        stringref = @JVM.JVM_ResolveStringLiteral(data.string)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : stringref
        })
      
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
          lockAquired(e.target)
      'releaseLock' : (data) ->
        @heap[data.reference.pointer].monitor.releaseLock(e.target)
        
      
      'allocate' : (data) ->
        ref = @heap.allocate(data.object)
        e.target.postMessage({
          'action' : 'resource',
          'resource' : ref
        })
        
      'log' : (data) ->
        console.log(data.message)
        
      'finished' : () ->  
        console.log('Thread #' + data.id + ' finished')
        if e.target is @clinitThread
          @clinitThread.postMessage(@clinitThread.waiting.pop())
        else
          @clinitThread.finished = true
    }
    
    actions[e.data.action](e.data)
    
   
  
  

  
 
  
 
      
  
    
