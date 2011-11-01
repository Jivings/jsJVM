class this.ClassLoader
  classReader : 1
  stack : new Array
  ps_id : 0
  
  start : ->
    self = this
    @ps_id = setInterval((() ->  self.load()), 100)

  add : (hexstream, name) ->
    this.stack.push { 
      name : name,
      data : hexstream
    }

  load : ->
    until (next = @stack.pop()) is `undefined`
     #if RDA.method_area[next.name]? then true
     if !next.data? or next.data.length < 10 then throw 'InvalidClassException' 
			
     classReader = new ClassReader next.data 
     _class = classReader.parse()
     #RDA.method_area[_class.get_name()] = _class;
     #find _class.get_super()
    true

  find : (class_name) ->
    self = this
    $.get("classes/#{class_name}.class", (response) ->
      return self.add response, class_name
    ).error (err) ->
      $.get("classes/rt/#{class_name}.class", (response) ->
        return self.add response, class_name
      ).error (err) -> throw 'NoClassDefFoundError'
  
class ClassReader
    
  constructor : (@stream) ->
    @console = document.console
    
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
    s = @stream.substring(0, length)
    
    i = -1
    U = new Array(s.length)
    while ++i < s.length
      U[i] = s.charCodeAt(i)
      if U[i] < 256
        if U[i].length is 1 then U[i] = 0 + U[i].toString(16)
        else U[i] = U[i].toString(16)
      else alert 'MultiByte value! ' + U[i]
    @stream = @stream.substring(length)    
    @console.progress += length
    return '0x' + U.join("")
  
  readString : (length) ->
    #s = @stream.substring(offset, offset+=length)
    s = @stream.substring(0, length)
    i = -1
    U = new Array(s.length)
    while ++i < s.length 
      U[i] = s.charAt(i)
    @stream = @stream.substring(length)
    @console.progress += length
    return U.join("")
  
  readTag : ->
    parseInt(@read 1)

  readConstant : (tag) ->
    switch tag
      when 1 # UTF-8 String 
        return @readString parseInt(@read(2), 16)
      when 3, 4 # Integer
        return @read 4  
      when 5, 6 # Long, Double
        return @read 8
      when 7, 8 # Class Reference, String Reference
        return @read 2
      when 9, 10, 12 # Field Reference, Method Reference, Name and Type Descriptor
        return "#{@read 2} #{@read 2}"
      when 11 # Interface method
        return @read 4
      else
        throw "UnknownConstantException, Offset : " + @console.progress
	  
  parseClassVars : (_class) ->
    @console.println 'magic number: ' + _class.magic_number = @read(4)
    if _class.magic_number & 0xCAFEBABE is 0 then alert("Not JavaClass")
    @console.println 'minor version: ' + _class.minor_version = @read(2)
    @console.println 'major version: ' + _class.major_version = @read(2)
    yes

  parseConstantPool : (_class) ->
    
    #constantPoolCount = parseInt @read(2), 16
    #cp = parseInt(constantPoolCount)
    _class.set_constant_pool_count(@read 2)
    i = 0
    @console.println "Constant Pool Count : #{_class.constant_pool_count}"
    while ++i < _class.constant_pool_count 
      tag = @readTag()
      constant = @readConstant(tag)
      _class.constant_pool[i] = constant
      @console.writeConstant(i, tag, constant)
      if tag is 5 then i++;
    yes
	
  parseFileVars : (_class) ->
    @console.println 'access flags: '+_class.access_flags = @read 2
    @console.println 'this class: '+_class.this_class = @read 2
    @console.println 'super class: '+_class.super_class = @read 2
    yes
   
  parseInterfaces : (_class) ->
    @console.println 'interface count: ' +_class.set_interfaces_count @read 2
    i = -1
    while ++i < _class.interfaces_count
      @console.println (_class.interfaces[i] = @read 2)
    yes
    
  parseFields : (_class) ->
    @console.println 'fields count: ' + _class.fields_count = @read 2
    i = -1
    while ++i < _class.fields_count
      _class.fields[i] = @readFieldInfo(_class)
    yes
    
  parseMethods : (_class) ->
    @console.println 'method count: ' + _class.set_method_count(@read 2)
    i = -1
    while ++i < _class.methods_count
        _class.methods[i] = @readMethodInfo(_class)   
    yes   
   	
  parseAttributes : (_class) ->
    _class.set_attributes_count(@read 2)
  
  readMethodInfo : (_class) ->
    method_info = {}
    @console.println '  access flags: ' + method_info.access_flags = @read 2;
    @console.println '  name index: ' + method_info.name_index = @read 2;
    @console.println '  descriptor index: ' + method_info.descriptor_index = @read 2;
    @console.println '  atrribute count: ' + method_info.attribute_count = @read 2;
   	method_info.attributes = new Array(parseInt(method_info.attribute_count, 16));
    i = 0
    while i++ < parseInt(method_info.attribute_count, 16)
      method_info.attributes[i] = @readAttribute _class
    method_info
        
  readAttribute : (_class) ->
    attribute_name = @read 2
    attribute_length = @read 4
    real_name = _class.constant_pool[parseInt(attribute_name, 16)]
    @console.println '    attribute name: ' + real_name
    @console.println '    attribute length: ' + attribute_length
    if real_name is 'Code'
      return @readCodeAttribute(_class, attribute_name, attribute_length)
    else
      @read parseInt(attribute_length, 16) 
      return {}

    
  readCodeAttribute : (_class, name_index, length) ->
    code_attribute = {}
    code_attribute.attribute_name_index = name_index
    code_attribute.attribute_length = length
    code_attribute.max_stack = @read 2
    code_attribute.max_locals = @read 2
    code_attribute.code_length = @read 4
    code_attribute.code = {};
    code_length = parseInt(code_attribute.code_length)
    i = -1
    while ++i < code_length
        @console.println '      ' +code_attribute.code[i] = @read 1
    code_attribute.exception_table_length = @read 2
    # TODO exception table
    @read(code_attribute.exception_table_length*8)
    code_attribute.attributes_count = parseInt(@read(2), 16)
   	code_attribute.attributes = new Array(code_attribute.attributes_count)
    i = -1
    while ++i < code_attribute.attributes_count
        code_attribute.attributes[i] = @readAttribute(_class)
    return code_attribute;
    
  readFieldInfo : (_class) ->
    field_info = {}
    @console.println '  access flags: ' + field_info.access_flags = @read 2;
    @console.println '  name index: ' + field_info.name_index = @read 2;
    @console.println '  descriptor index: ' + field_info.descriptor_index = @read 2;
    @console.println '  atrribute count: ' + field_info.attribute_count = @read 2;
   	field_info.attributes = new Array(parseInt(field_info.attribute_count, 16));
    i = 0
    while i++ < parseInt(field_info.attribute_count, 16)
      field_info.attributes[i] = @readAttribute _class
    field_info

#classLoader = new ClassLoader()
#this.onmessage = (e) ->
 # this.postMessage('Done')
  
