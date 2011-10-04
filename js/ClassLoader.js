/**
 * Class to read and load Java Class files into memory. 
 * @returns {ClassLoader}
 */
function ClassLoader() { 
	
	this.classReader = new ClassReader();
	
	this.get_class_stream = function(class_name) {
		var self = this;
		$.get('java/'+class_name+'.class', function(response) {
			self.load_class(response);
		});
	};
	
	/**
	 * Load a class into memory for reading
	 */
	this.load_class = function(hex_stream, type) {
		if(!hex_stream || hex_stream.length < 10) {
			throw 'InvalidClassFileException';
		}
		this.classReader.stream = hex_stream;
		// Parse the class
		var _class = this.parse_file();
		// Validate class
		_class.validate(type);
		// Load super class
		this.get_class_stream(_class.get_super());
		// Store the class data in the Method Area
		RDA.method_area[_class.this_class] = _class;
	};
		
	/**
	 * Perform Class File Parsing
	 * @returns: {JavaClass}
	 */
	this.parse_file = function() {
		var _class = new JavaClass();
		
		this.parse_class_vars(_class);
		Console.debug('Constants:');
		this.parse_constant_pool(_class);
		this.parse_second_class_vars(_class);
		this.parse_interfaces(_class);
		this.parse_fields(_class);
		this.parse_methods(_class);
		return _class;
	};
	
	/**
	 * Parse the initial class variables and verify this is a Java Class file.
	 */
	this.parse_class_vars = function(_class){
		_class.magic_number  = this.classReader.read(4);
		//if(!_class.verify()) {
		//	throw 'VerifyError';
		//};
		Console.debug('Magic Number: ' + _class.magic_number);
		_class.minor_version = this.classReader.read(2);
		Console.debug('Minor Version: ' + _class.minor_version);
		_class.major_version = this.classReader.read(2);
		Console.debug('Major Version: ' + _class.major_version);
	};
	
	/**
	 * Parse the Constant Pool
	 */
	this.parse_constant_pool = function(_class) {
		_class.set_constant_pool_count(parseInt(this.classReader.read(2), 16));
				
		for ( var i = 1; i < _class.constant_pool_count; i++ ) {
			
			var tag = this.classReader.read_tag(),
				value = this.classReader.read_constant(tag);
			
			Console.write_constant(i, tag, value);
			_class.constant_pool[i] = value;
		}
	};
	
	/**
	 * Parse the secondary class variables
	 */
	this.parse_second_class_vars = function(_class) {
		_class.access_flags  =  this.classReader.read(2);
		Console.debug('Access flags: ' + _class.access_flags.toString(10));
		_class.this_class = parseInt(this.classReader.read(2), 16);
		Console.debug('This Class: #' + _class.this_class);
		_class.super_class = parseInt(this.classReader.read(2), 16);
		Console.debug('Super Class: #' + _class.super_class);
	};
	
	/**
	 * Parse class Interfaces
	 */
	this.parse_interfaces = function(_class) {
		_class.set_interfaces_count(parseInt(this.classReader.read(2), 16));
		Console.debug('Interface Count: ' + _class.interfaces_count);
		
		for ( var i = 1; i < _class.interfaces_count; i++ ) {
			// TODO
		}
	};
	
	/**
	 * Parse Class fields
	 */
	this.parse_fields = function(_class) {
		_class.fields_count = this.classReader.read(2);
		Console.debug('Field Count: ' + _class.fields_count);
		// TODO
	};
	
	/**
	 * Parse Class methods
	 */
	this.parse_methods = function(_class) {
		_class.set_method_count(parseInt(this.classReader.read(2), 16));
		Console.debug('Method Count: ' + _class.methods_count);
		for( var i = 0; i < _class.methods_count; i++ ) {
			// Pass _class to the method so we can access the constant table when needed
			_class.methods[i] = this.classReader.read_method_info(_class);
		};
	};
	
	/**
	 * Parse Class attributes
	 */
	this.parse_attributes = function(_class) {
		_class.set_attributes_count(parseInt(this.classReader.read(2), 16));
				
		for( var i = 0; i < _class.attributes_count; i++ ) {
			// TODO
			//_class.attributes[i] = this.classReader.parse_attribute_info();
		};
	};
};

/**
 * Class to rid bytes from a Java Class file. As data is parsed it is discarded.
 * @returns {ClassReader}
 */
function ClassReader() {
	
	this.stream = '';
	
	this.readNextU2 = function(offset) {
		return this.read(2);
	};
	
	this.readNextU4 = function() {
		return this.read(4);
	};
	
	this.read = function(length) {
		var U = '';
		
		$.each(this.stream.substring(0, length), function(i, ch) {
			U += ch.charCodeAt(0).toString(16);
		});
		
		this.stream = this.stream.substring(length);
		return U;
	};
	
	this.read_tag = function() {
		var tag = this.stream.substring(0, 1).charCodeAt(0);
		this.stream = this.stream.substring(1);
		return tag;
	};
	
	this.readNextString = function(length) {
		var U = '';
		$.each(this.stream.substring(0, length), function(i, ch) {
			U += ch.charAt(0);
		});
		this.stream = this.stream.substring(length);
		return U;
	};
	
	this.readNextReference = function(quantity) {
		var reference_as_hex = this.read(quantity), 
			reference = '';

		if(quantity == 2) {
			return reference = '' +  parseInt(reference_as_hex, 16);
		}
		for ( var i = 0; i < quantity; i = i + 2) {
			reference += parseInt(reference_as_hex.substring(i, i + 2), 16)
					+ ' ';
		}
		return reference;
	};
	
	this.read_constant = function(tag) {

		switch (parseInt(tag)) {
		case 1:	// UTF-8 String
			// get string length in hex and parse to int
			var str_len = this.readNextU2();
			// get string bytes
			return this.readNextString(parseInt(str_len, 16));
		case 3:	// Integer
			return this.read(4);
		case 4: // Float
			return this.read(4);
		case 5:	// Long
			return this.read(8);
		case 6:	// Double
			return this.read(8);
		case 7:	// Class Reference
			return this.readNextReference(2);
		case 8: // String Reference
			return this.readNextReference(2);
		case 9: // Field Reference
			return this.readNextReference(4);
		case 10: // Method Reference
			return this.readNextReference(4);
		case 11: // Interface Method
			return this.read(4);
		case 12: // Name and type descriptor
			return this.readNextReference(4);
		default:
			throw 'UnknownConstantException';
		}
	};
	
	this.read_method_info = function(_class) {
		
		var method_info = {};
		
		method_info.access_flags = this.read(2);
		method_info.name_index = this.read(2);
		method_info.descriptor_index = this.read(2);
		method_info.attribute_count = this.read(2);
		Console.write_method(method_info, _class);
		method_info.attributes = Array(method_info.attribute_count);
		
		for ( var i = 0; i < parseInt(method_info.attribute_count, 16); i++ ) {
			method_info.attributes[i] = this.read_attribute(_class);
		}
		return method_info;		
	};
	
	this.read_attribute = function(_class) {
		var attribute_name_index = this.read(2);
		var attribute_length = this.read(4);
		
		if(_class.constant_pool[parseInt(attribute_name_index, 16)] == 'Code'){
			Console.debug('	Attr Name: '+attribute_name_index);
			Console.debug('	Attr Length: '+parseInt(attribute_length, 16));
			return this.read_code_attribute(_class, attribute_name_index, attribute_length);
		}
		else if(_class.constant_pool[parseInt(attribute_name_index, 16)] == 'Exception'){
			throw 'NotYetImplementedException';
		}
		else {
			// Not implemented and not required by JVM specification, so ignore the bytes for this attribute.
			this.read(attribute_length);
		};
	};
	
	this.read_code_attribute = function(_class, name_index, length) {
		Console.debug('	Code: ');
		var code_attribute = {};
		code_attribute.attribute_name_index = name_index;
		code_attribute.attribute_length = length;
		code_attribute.max_stack = this.read(2);
		Console.debug('		Max Stack: ' + code_attribute.max_stack);
		code_attribute.max_locals = this.read(2);
		Console.debug('		Max Locals: ' + code_attribute.max_locals);
		code_attribute.code_length = this.read(4);
		Console.debug('		Code Length: ' + code_attribute.code_length);
		code_attribute.code = {};
		var code_length = parseInt(code_attribute.code_length, 16);
		Console.debug('		OpCodes: ');
		for( var i = 0; i < code_length; i++) {
			code_attribute.code[i] = this.read(1);
			Console.debug('			'+code_attribute.code[i]);
		};
		code_attribute.exception_table_length = this.read(2);
		Console.debug('		Exception Table Count: ' + code_attribute.exception_table_length);
		for( var i = 0; i < code_attribute.exception_table_length; i++ ) {
			// TODO Exceptions here.
		}
		
		code_attribute.attributes_count = parseInt(this.read(2), 16);
		code_attribute.attributes = new Array(code_attribute.attributes_count);
		Console.debug('		Attributes Count: ' + code_attribute.attributes_count);
		for( var i = 0; i < code_attribute.attributes_count; i++) {
			code_attribute.attributes[i] = this.read_attribute(_class);
		};
		
		return code_attribute;
		
	};
};







