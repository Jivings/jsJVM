/**
 * Class to read and load Java Class files into memory. Classes to be loaded
 * must be pushed to the Stack using add(). Classes on the stack will be checked
 * and loaded into memory.
 * 
 * @returns {ClassLoader}
 */
function ClassLoader() {

	this.classReader;
	this.stack = new Array;
	this.ps_id = 0;

	this.required_classes = [
			//'java/lang/Class'//,
			//'java/lang/ClassLoader'
	];
	/**
	 * Initialises the ClassLoader, returns self for chaining.
	 */
	this.start = function() {
		var self = this;
		
		this.ps_id = setInterval(function() {
			self.load();
		}, 100);
		for(_class in this.required_classes) {
			this.find(this.required_classes[_class]);
		}
		return self;
	};
	/**
	 * Add a class to the stack for loading
	 */
	this.add = function(hex_stream, name) {
		this.stack.push({
			'name' : name,
			'data' : hex_stream
		});
	};

	/**
	 * Load the classes on the current stack and their superclasses into the
	 * Method Area.
	 */
	this.load = function() {

		var next;
		while ((next = this.stack.pop()) != undefined) {

			
			// Check to see if class may already have been loaded
			if (RDA.method_area[next.name]) {
				return true;
			}
			Console.print('Loading '+next.name+'..............');
			// Initial validation of Class File
			if (!next.data || next.data.length < 10) {
				throw 'InvalidClassFileException';
			}

			this.classReader = new ClassReader(next.data);

			try {
				// Parse the class
				var _class = this.parse();
				// Store the class data in the Method Area
				RDA.method_area[_class.get_name()] = _class;
				Console.print('[OK]');
				// Push super class to stack
				this.find(_class.get_super());				
			}
			catch(e) {
				if(e instanceof JVM_Exception) {
					Console.print(e.toString());
				}
				else {
					throw e;
				};
			}
			Console.newLine();
			

			
		}

		/*
		 * for(name in this.stack) { // If class is already loaded, done
		 * if(RDA.method_area[name]) { return true; } // Initial validation of
		 * Class File if(!this.stack[name] || this.stack[name].length < 10) {
		 * throw 'InvalidClassFileException'; }
		 * 
		 * this.classReader = new ClassReader(this.stack[name]); // Parse the
		 * class var _class = this.parse_class(); // TODO Validate class
		 * //_class.validate(type);
		 *  // If super class is not already on the stack then push it.
		 * if(this.stack[_class.get_super()] == 'undefined') {
		 * this.find(_class.get_super()); } // Store the class data in the
		 * Method Area RDA.method_area[_class.this_class] = _class; }
		 */

	};

	/**
	 * Locate a class file that is not on the stack and push it.
	 */
	this.find = function(class_name) {
		// Sanity Check, java/lang/object has no superclass.
		if (class_name != undefined) {

			var self = this;
						
			$.get('java/' + class_name + '.class', function(response) {
				self.add(response, class_name);
			});
			
		}

	};

	/**
	 * Load a class into memory for reading
	 */
	/*
	 * this.load_class = function(hex_stream, name, type) {
	 * 
	 * 
	 * if(RDA.method_area[name]) { return true; } // Initial validation of Class
	 * File if(!hex_stream || hex_stream.length < 10) { throw
	 * 'InvalidClassFileException'; }
	 * 
	 * this.classReader = new ClassReader(hex_stream); // Parse the class var
	 * _class = this.parse_class(); // Validate class _class.validate(type); //
	 * Load super class this.get_class_stream(_class.get_super()); // Store the
	 * class data in the Method Area RDA.method_area[_class.this_class] =
	 * _class; };
	 */

	/**
	 * Perform Class File Parsing
	 * 
	 * @returns: {JavaClass}
	 */
	this.parse = function() {
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
	this.parse_class_vars = function(_class) {
		_class.magic_number = this.classReader.read(4);
		// if(!_class.verify()) {
		// throw 'VerifyError';
		// };
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

		for ( var i = 1; i < _class.constant_pool_count; i++) {
			var tag = this.classReader.read_tag(), value = this.classReader
					.read_constant(tag);
			Console.write_constant(i, tag, value);
			_class.constant_pool[i] = value;
			// increment constant pool number again when reading a long
			if(tag == 5) i++;
		}
	};

	/**
	 * Parse the secondary class variables
	 */
	this.parse_second_class_vars = function(_class) {
		_class.access_flags = this.classReader.read(2);
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

		for ( var i = 1; i < _class.interfaces_count; i++) {
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
		for ( var i = 0; i < _class.methods_count; i++) {
			// Pass _class to the method so we can access the constant table
			// when needed
			_class.methods[i] = this.classReader.read_method_info(_class);
		}
		;
	};

	/**
	 * Parse Class attributes
	 */
	this.parse_attributes = function(_class) {
		_class.set_attributes_count(parseInt(this.classReader.read(2), 16));

		for ( var i = 0; i < _class.attributes_count; i++) {
			// TODO
			// _class.attributes[i] = this.classReader.parse_attribute_info();
		}
		;
	};
};

/**
 * Class to rid bytes from a Java Class file. As data is parsed it is discarded.
 * 
 * @returns {ClassReader}
 */
function ClassReader(hexstream) {

	this.stream = hexstream;
	this.offset = 0;

	this.readNextU2 = function(offset) {
		return this.read(2);
	};

	this.readNextU4 = function() {
		return this.read(4);
	};

	this.read = function(length) {
		var U = new Array();
		this.offset += length;
		var s = '';
		
		$.each(this.stream.substring(0, length), function(i, ch) {
				var val = ch.charCodeAt(0).toString(16);
				if (val.length == 1) {
					val = new String("0") + val;
				}
				U[i] = val;
		});
		
		s = U.join('');
		
		this.stream = this.stream.substring(length);
		return s;
	};

	this.read_tag = function() {
		// var tag = this.read(1);
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

	/**
	 * Read 4 byte References
	 * @returns the reference as a String
	 */
	this.readNameAndTypeReference = function() {
		var reference_as_hex = this.read(2);
		var reference = parseInt(reference_as_hex, 16);
		var reference_as_hex = this.read(2);
		 	reference += ' ' + parseInt(reference_as_hex, 16);
		return reference;
	};
	this.readFieldReference = this.readNameAndTypeReference;
	this.readMethodReference = this.readNameAndTypeReference;
	
	
	this.readClassReference = function() {
		var reference_as_hex = this.read(2);
		return reference = parseInt(reference_as_hex, 16);
	};
	this.readStringReference = this.readClassReference;

	
	this.read_constant = function(tag) {

		switch (parseInt(tag)) {
		case 1: // UTF-8 String
			// get string length in hex and parse to int
			var str_len = this.readNextU2();
			// get string bytes
			return this.readNextString(parseInt(str_len, 16));
		case 3: // Integer
			return this.read(4);
		case 4: // Float
			return this.read(4);
		case 5: // Long
			return this.read(8);
		case 6: // Double
			return this.read(8);
		case 7: // Class Reference
			return this.readClassReference();
		case 8: // String Reference
			return this.readStringReference();
		case 9: // Field Reference
			return this.readFieldReference();
		case 10: // Method Reference
			return this.readMethodReference();
		case 11: // Interface Method
			return this.read(4);
		case 12: // Name and type descriptor
			return this.readNameAndTypeReference();
		default:
			throw new JVM_Exception('UnknownConstantException', 'ClassLoader', 340, this.offset);
		}
	};

	this.read_method_info = function(_class) {

		var method_info = {};

		method_info.access_flags = this.read(2);
		method_info.name_index = this.read(2);
		method_info.descriptor_index = this.read(2);
		method_info.attribute_count = this.read(2);
		Console.write_method(method_info, _class);
		method_info.attributes = new Array(parseInt(method_info.attribute_count, 16));

		for ( var i = 0; i < parseInt(method_info.attribute_count, 16); i++) {
			method_info.attributes[i] = this.read_attribute(_class);
		}

		if (this.is_main_method(method_info, _class)) {
			_class.main = true;
			alert('main');
		}

		return method_info;
	};

	this.is_main_method = function(method_info, _class) {
		return (method_info.access_flags & (access_flags.PUBLIC | access_flags.STATIC) != 0)
				&& (_class.constant_pool[parseInt(method_info.name_index)] == 'main');
	};

	this.read_attribute = function(_class) {
		var attribute_name_index = this.read(2);
		var attribute_length = this.read(4);
		var attr_name = _class.constant_pool[parseInt(attribute_name_index, 16)];
		if (attr_name == 'Code') {
			Console.debug('	Attr Name: ' + attr_name);
			Console.debug('	Attr Length: ' + parseInt(attribute_length, 16));
			return this.read_code_attribute(_class, attribute_name_index,
					attribute_length);
		} else if (attr_name == 'Exception') {
			throw 'NotYetImplementedException';
		} else {
			// Not implemented and not required by JVM specification, so ignore
			// the bytes for this attribute.
			this.read(parseInt(attribute_length, 16));
		}
		;
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
		for ( var i = 0; i < code_length; i++) {
			code_attribute.code[i] = this.read(1);
			Console.debug('			' + code_attribute.code[i]);
		}
		;
		code_attribute.exception_table_length = this.read(2);
		Console.debug('		Exception Table Count: '
				+ code_attribute.exception_table_length);
		for ( var i = 0; i < code_attribute.exception_table_length; i++) {
			// TODO Exceptions here.
		}

		code_attribute.attributes_count = parseInt(this.read(2), 16);
		code_attribute.attributes = new Array(code_attribute.attributes_count);
		Console.debug('		Attributes Count: ' + code_attribute.attributes_count);
		for ( var i = 0; i < code_attribute.attributes_count; i++) {
			code_attribute.attributes[i] = this.read_attribute(_class);
		}
		;

		return code_attribute;

	};

};

