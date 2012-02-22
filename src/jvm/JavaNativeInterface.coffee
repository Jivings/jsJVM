class this.InternalJNI

  constructor : (@JVM) -> 
    
  
  RegisterNatives : (jclass, methods) ->
    for name, method of methods
      jclass.methods[name] = @JVM[method]

    
  GetObjectClass : () ->
    
  
  
  
    
  
