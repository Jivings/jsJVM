


function ClassLoader() { // extends class_reader
	
	
	this.classReader = new ClassReader();
	
	this.load_class = function(hex_stream) {
		this.classReader.stream = hex_stream;
		var _class = this.parse_file();
	};
		
	this.parse_file = function() {
		var _class = new JavaClass();
		
		this.parse_class_vars(_class);
		Console.write('Constants:');
		this.parse_constant_pool(_class);
		this.parse_second_class_vars(_class);
		this.parse_interfaces(_class);
		this.parse_fields(_class);
		this.parse_methods(_class);
		return _class;
	};
	
	this.parse_class_vars = function(_class){
		_class.magic_number  = this.classReader.read(4);
		if(!_class.verify()) {
			throw 'VerifyError';
		};
		Console.write('Magic Number: ' + _class.magic_number);
		_class.minor_version = this.classReader.read(2);
		Console.write('Minor Version: ' + _class.minor_version);
		_class.major_version = this.classReader.read(2);
		Console.write('Major Version: ' + _class.major_version);
	};
	
	this.parse_constant_pool = function(_class) {
		_class.constant_pool_count = this.classReader.read(2);
		var count = parseInt(_class.constant_pool_count, 16);
		
		for ( var i = 1; i < count; i++ ) {
			
			var tag = this.classReader.read_tag(),
				value = this.classReader.read_constant(tag);
			
			Console.write_constant(i, tag, value);
			_class.constant_pool[i] = value;
		}
	};
	
	this.parse_second_class_vars = function(_class) {
		_class.access_flags  =  this.classReader.read(2);
		Console.write('Access flags: ' + _class.access_flags.toString(10));
		_class.this_class = this.classReader.read(2);
		Console.write('This Class: #' + parseInt(_class.this_class, 16));
		_class.super_class = this.classReader.read(2);
		Console.write('Super Class: #' + parseInt(_class.super_class, 16));
	};
	
	this.parse_interfaces = function(_class) {
		_class.interfaces_count = this.classReader.read(2);
		Console.write('Interface Count: ' + _class.interfaces_count);
		
		var count = parseInt(_class.interfaces_count, 16);
		
		for ( var i = 1; i < count; i++ ) {
			
		}
	};
	
	this.parse_fields = function(_class) {
		_class.fields_count = this.classReader.read(2);
		Console.write('Field Count: ' + _class.fields_count);
		
	};
	
	this.parse_methods = function(_class) {
		_class.methods_count = this.classReader.read(2);
		Console.write('Method Count: ' + _class.methods_count);
		var count = parseInt(_class.methods_count, 16);
		
		for( var i = 1; i < count; i++ ) {
			//_class.methods[i] = this.classReader.parse_method_info();
			//Console.write(this.methods[i]);
		};
	};
	
	this.parse_attributes = function(_class) {
		_class.attributes_count = this.classReader.read(2);
		var count = parseInt(_class.attributes_count, 16);
		
		for( var i = 1; i < count; i++ ) {
			_class.attributes[i] = this.classReader.parse_attribute_info();
		};
	};
};

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
			return reference = '#' +  parseInt(reference_as_hex, 16);
		}
		for ( var i = 0; i < quantity; i = i + 2) {
			reference += '#' + parseInt(reference_as_hex.substring(i, i + 2), 16)
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
	
	this.parse_method_info = function() {
		
		var method_info = {};
		
		method_info.access_flags = this.read(2);
		method_info.name_index = this.read(2);
		method_info.descriptor_index = this.read(2);
		method_info.attribute_count = this.read(2);
		
		
		for ( var i = 1; i < parseInt(method_info.attribute_count, 16); i++ ) {
			method_info.attribute_info = this.parse_attribute_info();
		}
		
		return method_info;		
	};
};







