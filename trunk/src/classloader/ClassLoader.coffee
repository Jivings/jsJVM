
class ClassLoader
  
  classReader : 1
  stack : new Array
  ps_id : 0
 
  start : ->
  add : (hex_stream, name) ->
    this.stack.push { 
      name : name,
      data : hexstream
    }
  load : ->
    until (next = @stack.pop()) is `undefined`
     classReader = new ClassReader next.data 
     _class = classReader.parse()
     @find _class.getSuper()

  find : (class_name) ->
  
  
class ClassReader 
  parse : ->