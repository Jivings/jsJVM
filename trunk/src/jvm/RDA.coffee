class this.RDA 
  constructor : ->
    @opcodes = new Opcodes()
    
    # All parsed class information is stored in the method area
    @method_area = {}
    
    # All instatiated Objects are placed on the Heap
    @heap = {
      permgen : {}
      oldgen : {}
      younggen : {}
    }
    
    @threads = {
      # initial main thread
      1 : new Thread()
    }
  
  


class Thread
  constructor : ->
    @pc = 0
    # The JVM stack consists of one frame for each method executing or queued.
    @jvm_stack = new Array()
    # The native stack consists of currently executing native methods.
    @native_stack = new Array()
  
  ###
  Called when a method is invoked. Allocates a section of 
  memory to the method and begins bytecode execution.
  When the method is finished, it is removed from memory.
  ###
  startMethod : ->
    @threads[1].jvm_stack.push(f = new Frame())
    @go()
    @threads[1].jvm_stack.pop()
    yes
  
  go : ->
    
    
###
A stack frame contains the state of one method invocation. When a method is invoked, 
a new frame is pushed onto the threads stack.
###
class Frame 
 
  @stack : new Array()
  @rcp_reference : {}
  @local_vars : {}

