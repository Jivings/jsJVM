
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
     if RDA.method_area[next.name]? then return true
     if next.data? or next.data.length < 10 then throw 'InvalidClassException' 
			
     classReader = new ClassReader next.data 
     _class = classReader.parse()
     RDA.method_area[_class.get_name()] = _class;
     @find _class.getSuper()
    true

  find : (class_name) ->
  
  
class ClassReader
  constructor : (@stream) ->
    @offset = 0
  parse : ->
    _class = new JavaClass()  
    @parseClassVars _class 
    @parseConstantPool _class
    @parseFileVars _class
    @parseInterfaces _class
    @parseFields _class
    @parseMethods _class
    _class

  read : (length) ->
    s = @stream.substring(0, @offset+=length)
    s.toString(16)
  
  readTag : ->
    parseInt(@read 1)

  readConstant : (tag) ->
    switch day
      when 1 then alert 1
	  
  parseClassVars : (_class) ->
    _class.magic_number = @classReader.read 4
    _class.minor_version = @classReader.read 2
    _class.major_version = @classReader.read 2

  parseConstantPool : (_class) ->
    constantPoolCount = parseInt @classReader.read(2), 16
	i = 1
    while i++ < constantPoolCount 
	  tag = @readTag()
	  constant = @readConstant()
	  if tag is 5 then i++;
	yes
	
  parseFileVars : ->
  parseInterfaces : ->
  parseFields : ->
  parseMethods : ->
  
  