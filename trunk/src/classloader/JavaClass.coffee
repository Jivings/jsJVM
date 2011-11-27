###
Represents a Java Class file. Also provides Class verification methods.
@returns {JavaClass}
###

class this.JavaClass 

  constructor : () ->
	  @magic_number = 0
	  @minor_version = 0
	  @major_version = 0
	  @constant_pool_count = 0
	  @constant_pool = []
	  @access_flags = 0
	  @this_class = 0
	  @super_class = 0
	  @interfaces_count = 0
	  @interfaces = []
	  @fields_count = 0
	  @fields = []
	  @methods_count = 0
	  @methods = []
	  @attributes_count = 0
	  @attributes = []
	  @dependancies = []
	  @real_name = 'None'
    
  init : () ->
    
  get_super : -> 
    super_ref = @constant_pool[@super_class];
    @constant_pool[super_ref];
  
  get_name : ->
    super_ref = @constant_pool[@this_class];
    @constant_pool[super_ref];
    
  set_method_count : (count) -> 
    @methods_count = parseInt count, 16
    @methods = new Array parseInt count, 16
    return count
  
  set_constant_pool_count : (count) -> 
    @constant_pool_count = parseInt count, 16
    @constant_pool = new Array parseInt count, 16
    return count
    
  set_interfaces_count : (count) ->
    @interfaces_count = parseInt count, 16
    @interfaces = new Array parseInt count, 16
    return count
  
  set_fields_count : (count) ->
    @fields_count = parseInt count, 16
    @fields = new Array parseInt count, 16
    return count
    
  set_attributes_count : (count) ->
    @attributes_count = parseInt count, 16
    @attributes = new Array parseInt count, 16
    return count
