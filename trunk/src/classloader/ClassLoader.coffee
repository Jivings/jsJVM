class this.ClassLoader
  classReader : 1
  stack : new Array
  ps_id : 0
  required_classes : 
    'java/lang/Class' 

  ###
  Constructor 
  Set runtime data area and grab console from global scope
  ###
  constructor : (@RDA) ->
    @console = document.console
    @find @required_classes
  
  ###
  Starts the Classloader, calls load evey 10th of a second
  ###
  start : (JVM) ->
    self = this
    @ps_id = setInterval((() ->  self.load()), 100)

  ###
  Adds a class to the load stack
  ###
  add : (hexstream, name) ->
    this.stack.push { 
      name : name,
      data : hexstream
    }

  ###
  Steps through the class stack and loads each entry into the method area of the RDA.
  ###
  load : ->
    until (next = @stack.pop()) is `undefined`
     if @RDA.method_area[next.name]? then return true
     if !next.data? or next.data.length < 10 then throw 'InvalidClassException' 
			
     classReader = new ClassReader next.data 
     classReader.parse(@loaded, this)
    true

  ### 
  Callback method to execute when class has finished loading.
  Neccessary due to Async AJAX request during find
  Adds class to Method Area and loads class dependancies
  ###
  loaded : (_class, self) ->
    self.RDA.method_area[_class.get_name()] = _class;
    self.console.println "Loaded #{_class.get_name()}", 1
    # load dependancies
    self.find _class.get_super()
    # initialise class
    self.clinit(_class)    
    yes
    
  ###
  Finds a class on the classpath
  ###
  find : (class_name) ->
    # java/lang/Object super class will be undefined
    if typeof class_name is 'undefined'
      return 
    req = new XMLHttpRequest();
    req.open 'GET', "classes/rt/#{class_name}.class", false
    # The following line says we want to receive data as Binary and not as Unicode
    req.overrideMimeType 'text/plain; charset=x-user-defined'
    req.send null
    if req.status isnt 200
      req.open 'GET', "classes/#{class_name}.class", false
      req.overrideMimeType 'text/plain; charset=x-user-defined'
      req.send null
      if req.status isnt 200
        throw 'NoClassDefFoundError'
    return @add req.responseText, class_name

  clinit : (_class) ->
    yes
    
###
ClassReader
###
class ClassReader
    
  constructor : (stream) ->
    @binaryReader = new jDataView stream
    @binaryReader._littleEndian = false
    @console = document.console
    
  parse : (callback, classLoader) ->
    _class = new JavaClass()  
    @parseClassVars _class 
    @parseConstantPool _class
    @parseFileVars _class
    @parseInterfaces _class
    @parseFields _class
    @parseMethods _class
    callback _class, classLoader

  read : (length) ->
    switch length
      when 1
        @binaryReader.getUint8()
      when 2
        @binaryReader.getUint16()
      when 4 
        @binaryReader.getUint32() 
      else 
        # Probably something not implemented, step forward
        @binaryReader.seek(@binaryReader.tell() + length)
  
  readDouble : ->
    @binaryReader.getFloat32()
    
  readString : (length) ->
    @binaryReader.getString length
    
  readTag : ->
    @read 1

  readConstant : (tag) ->
    switch tag
      when 1 # UTF-8 String 
        @readString(@read 2) 
      when 3, 4 # Integer, Float
        @binaryReader.getUint32()
      when 5, 6 # Long, Double
        @binaryReader.getFloat64()
      when 7, 8 # Class Reference, String Reference
        @read 2 
      when 9, 10, 12 # Field Reference, Method Reference, Name and Type Descriptor
        return "#{@read 2} #{@read 2}"
      when 11 # Interface method
        @read 4
      else
        throw "UnknownConstantException, Offset : " + @binaryReader.tell()

  parseClassVars : (_class) ->
    @console.println('magic number: ' + _class.magic_number = @read(4), 2) 
    valid = _class.magic_number.toString(16) & 0xCAFEBABE 
    if valid isnt 0 then alert("Not JavaClass")
    @console.println('minor version: ' + _class.minor_version = @read(2), 2)
    @console.println('major version: ' + _class.major_version = @read(2), 2)
    yes

  parseConstantPool : (_class) ->
    
    #constantPoolCount = parseInt @read(2), 16
    #cp = parseInt(constantPoolCount)
    _class.constant_pool_count = @read 2
    i = 0
    @console.println("Constant Pool Count : #{_class.constant_pool_count}", 2)
    while ++i < _class.constant_pool_count 
      tag = @readTag()
      constant = @readConstant(tag)
      _class.constant_pool[i] = constant
      @console.writeConstant(i, tag, constant, 2)
      if tag is 5 then i++;
      else if tag is 7 
        if constant isnt _class.this_class
          _class.dependancies.push(constant)
        
    yes
	
  parseFileVars : (_class) ->
    @console.println('access flags: '+_class.access_flags = @read(2), 2)
    @console.println('this class: '+_class.this_class = @read(2), 2)
    _class.super_class = @read(2)
    @console.println('super class: '+_class.super_class, 2)
    yes
   
  parseInterfaces : (_class) ->
    @console.println('interface count: ' +_class.interfaces_count = @read(2), 2)
    i = -1
    while ++i < _class.interfaces_count
      @console.println _class.interfaces[i] = @read(2), 2
    yes
    
  parseFields : (_class) ->
    @console.println 'fields count: ' + _class.fields_count = @read(2), 2
    i = -1
    while ++i < _class.fields_count
      _class.fields[i] = @readFieldInfo(_class)
    yes
    
  parseMethods : (_class) ->
    @console.println 'method count: ' + _class.method_count = @read(2), 2
    i = -1
    while ++i < _class.method_count
      method = @readMethodInfo _class
      _class.methods[_class.constant_pool[method.name_index]] = method 
    yes   
   	
  parseAttributes : (_class) ->
    _class.attributes_count(@read 2)
  
  readMethodInfo : (_class) ->
    method_info = {}
    @console.println '  access flags: ' + method_info.access_flags = @read(2), 2;
    @console.println '  name index: ' + method_info.name_index = @read(2), 2;
    @console.println '  descriptor index: ' + method_info.descriptor_index = @read(2), 2;
    @console.println '  atrribute count: ' + method_info.attribute_count = @read(2), 2;
   	method_info.attributes = new Array(method_info.attribute_count);
    i = 0
    while i++ < method_info.attribute_count
      method_info.attributes[i] = @readAttribute _class
    method_info
        
  readAttribute : (_class) ->
    attribute_name = @read 2
    attribute_length = @read 4
    real_name = _class.constant_pool[attribute_name]
    @console.println '    attribute name: ' + real_name, 2
    @console.println '    attribute length: ' + attribute_length, 2
    if real_name is 'Code'
      return @readCodeAttribute(_class, attribute_name, attribute_length)
    else
      @read attribute_length
      return {}

    
  readCodeAttribute : (_class, name_index, length) ->
    code_attribute = {}
    code_attribute.attribute_name_index = name_index
    code_attribute.attribute_length = length
    code_attribute.max_stack = @read 2
    code_attribute.max_locals = @read 2
    code_attribute.code_length = @read 4
    code_attribute.code = {};
    code_length = code_attribute.code_length
    i = -1
    while ++i < code_length
        @console.println('      ' +(code_attribute.code[i] = @read(1)), 2)
    code_attribute.exception_table_length = @read 2
    # TODO exception table
    @read(code_attribute.exception_table_length*8)
    code_attribute.attributes_count = @read 2
   	code_attribute.attributes = new Array(code_attribute.attributes_count)
    i = -1
    while ++i < code_attribute.attributes_count
        code_attribute.attributes[i] = @readAttribute(_class)
    return code_attribute;
    
  readFieldInfo : (_class) ->
    field_info = {}
    @console.println '  access flags: ' + field_info.access_flags = @read(2), 2
    @console.println '  name index: ' + field_info.name_index = @read(2), 2
    @console.println '  descriptor index: ' + field_info.descriptor_index = @read(2), 2
    @console.println '  atrribute count: ' + field_info.attribute_count = @read(2), 2
   	field_info.attributes = new Array(field_info.attribute_count);
    i = 0
    while i++ < field_info.attribute_count
      field_info.attributes[i] = @readAttribute _class
    field_info

#classLoader = new ClassLoader()
#this.onmessage = (e) ->
 # this.postMessage('Done')
  

