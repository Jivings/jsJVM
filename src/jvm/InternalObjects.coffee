class this.JVM_Object
    constructor : (@cls) ->
      
      supercls = @cls.constant_pool[@cls.super_class]
      if supercls != undefined
        @__proto__ = new JVM_Object(supercls)
        
      # init class variable to null, this will get initialised later
      @clsObject = new JVM_Reference(0)
      
      # TODO wont break when static class fields are changed by 
      # a different thread/class/object?
      for field of @cls.fields
        fld = @cls.fields[field]
        @[field] = fld
      
    monitor : {
        aquireLock : (thread) ->
          if @owner is thread
            @count++
          else if @owner isnt null
            @waiting.push(thread)
            return false
          else
            @owner = thread
            @count++
          yes
            
        releaseLock : (thread) ->
          if @owner isnt thread
            return false
            
          if --@count is 0
              @owner = null
          for thread in @waiting
            @notify thread
          @waiting.length = 0
          yes
        
        notify : (thread) ->
          @RDA.lockAquired(thread)
          
        owner : null
        count : 0
        waiting : new Array()
      }
    compareTo : (jvmObject) ->
      if @cls.real_name is jvmObject.cls.real_name
        return true
      else
        try
          return super.compareTo(jvmObject)
        catch err
          return false
      
class this.JVM_Reference
  constructor : (@pointer) ->
  toString : () ->
    return @pointer
        
class JVM_Number
  constructor : (@val) ->
  valueOf : () ->
    return @val
  
class this.CONSTANT_Array extends Array
  constructor : (@length, @type) ->
    super @length
    
class this.CONSTANT_Object
  constructor : (@classname) ->
    @value = null
    
class this.CONSTANT_integer extends JVM_Number
  constructor : (val = 0, sign = false) ->
    if sign
      if (val & 0x8000) != 0 
        next = ((~val)+1 & 0xffff)
        val = (next * -1)
    if isNaN(val)
      throw 'UnexpectedNaN'
    super val

class this.CONSTANT_int extends JVM_Number 
  constructor : (val = 0, sign = false) ->
    super(val, sign)
        
class this.CONSTANT_float extends JVM_Number
  constructor : (val = 0.0) ->
    super val
    
class this.CONSTANT_long extends JVM_Number
  constructor : (val = 0) ->
    super val

class this.CONSTANT_double extends JVM_Number
  constructor : (val = 0.0) ->
    super val

class this.CONSTANT_char
  constructor : (@value = '\u0000') ->
    @value = @value.charCodeAt()

class this.CONSTANT_short extends JVM_Number
  constructor : (val = 0) ->
    super val
  
class this.CONSTANT_byte
  constructor : (@value = 0, sign = false) ->
    if sign
      if (@value & 0x80) != 0
        next = ((~@value)+1 & 0xff)
        @value = (next * -1)
        
class this.CONSTANT_boolean
  constructor : (@value = 0) ->
 
class this.CONSTANT_String extends String
  constructor : (@value = '') ->
  
this.JVM_RECOGNIZED_METHOD_MODIFIERS = {
  JVM_ACC_PUBLIC        :   0x0001
  JVM_ACC_PRIVATE       :   0x0002
  JVM_ACC_PROTECTED     :   0x0004
  JVM_ACC_STATIC        : 	0x0008
  JVM_ACC_FINAL         :  	0x0010
  JVM_ACC_SYNCHRONIZED  : 	0x0020
  JVM_ACC_BRIDGE        :   0
  JVM_ACC_VARARGS       :   0
  JVM_ACC_NATIVE        :	  0x0100
  JVM_ACC_ABSTRACT      : 	0x0400
  JVM_ACC_STRICT        :   0
  JVM_ACC_SYNTHETIC     :   0
}

this.JVM_RECOGNIZED_CLASS_MODIFIERS = {
  JVM_ACC_PUBLIC    : 0x0001
  JVM_ACC_FINAL     : 0x0010
  JVM_ACC_SUPER     : 0x0020
  JVM_ACC_INTERFACE : 0x0200
  JVM_ACC_ABSTRACT  : 0x0400
}

this.JVM_RECOGNIZED_FIELD_MODIFIERS = {
  JVM_ACC_PUBLIC    : 0x0000
  JVM_ACC_PRIVATE   : 0x0000
  JVM_ACC_PROTECTED : 0x0000
  JVM_ACC_STATIC    : 0x0000
  JVM_ACC_FINAL     : 0x0000
  JVM_ACC_VOLATILE  : 0x0000
  JVM_ACC_TRANSIENT : 0x0000
  JVM_ACC_ENUM      : 0x0000
  JVM_ACC_SYNTHETIC : 0x0000
}

this.FIELD_DESCRIPTORS = {
  'B'   :   'CONSTANT_byte'
  'C'   :   'CONSTANT_char'
  'D'   :   'CONSTANT_double'
  'F'   :   'CONSTANT_float'
  'I'   :   'CONSTANT_integer'
  'J'   :   'CONSTANT_long'
  'L'   :   'CONSTANT_Class'
  'S'   :   'CONSTANT_short'
  'Z'   :   'CONSTANT_boolean'
  '['   :   'CONSTANT_Array'
}

###
  Used by the ClassLoader
###

class this.CONSTANT_Methodref_info
  constructor : (@class_index, @name_and_type_index) ->
    
class this.CONSTANT_InterfaceMethodref_info
  constructor : (@class_index, @name_and_type_index) ->
  
class this.CONSTANT_Fieldref_info
  constructor : (@class_index, @name_and_type_index) ->

class this.CONSTANT_NameAndType_info
  constructor : (@name_index, @descriptor_index) ->
  
class this.CONSTANT_Stringref
  constructor : (@string_index) ->
