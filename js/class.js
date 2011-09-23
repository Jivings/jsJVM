


var class_file = function(inputStream) { // extends class_reader
	
	this.class_data = inputStream;
	
	this.stream = inputStream;
	/*this.offsets = {
			magic_number : 0,
			minor_version : 4,
			major_version : 6,
			constant_pool_count : 8,
			constant_pool : 10 
		};
	*/
	
	this.console = new console();
	
	this.class_vars = {
		magic_number: '',
		minor_version : '',
		major_version : '',
		access_flags : '',
		this_class : '',
		super_class : '',
	};
	
	this.constants = {
		pool_count: 0,
		pool : {}
	};
		
	this.parse_file = function() {
		
		this.parse_class_vars();
		this.console.write('Constants:');
		this.parse_constant_pool();
		this.parse_second_class_vars();
		this.console.write('Interfaces:');
	};
	
	this.parse_class_vars = function(){
		this.class_vars.magic_number  = this.read(4);
		this.class_vars.minor_version = this.read(2);
		this.class_vars.major_version = this.read(2);
	};
	
	this.parse_constant_pool = function() {
		this.constants.pool_count = this.read(2);
		var count = parseInt(this.constants.pool_count, 16);
		
		for ( var i = 1; i < count; i++ ) {
			
			var tag = this.read_tag(),
				value = this.read_constant(tag);
			
			this.console.write_constant(i, tag, value);
			this.constants.pool[i] = value;
		}
	};
	
	this.parse_second_class_vars = function() {
		this.class_vars.access_flags  = this.read(2);
		this.console.write('Access flags: ' + parseInt(this.class_vars.access_flags, 16));
		this.class_vars.this_class = this.read(2);
		this.console.write('This Class: ' + parseInt(this.class_vars.this_class, 16));
		this.class_vars.super_class = this.read(2);
		this.console.write('Super Class: ' + parseInt(this.class_vars.super_class, 16));
	};
};

function class_reader() {
	
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
	
};

function console() {
	this.console = $('#console');
	
	this.write = function(string) {
		this.console.append('<p>'+this.HTMLencode(string)+'</p>');
	};
	
	this.write_constant = function(index, tag, value) {
		this.console.append('<p class="constant">#' + index + ' ' + tag + '<span class="value">' + this.HTMLencode(value) + '</span></p>');
	};
	
	this.HTMLencode = function(string){
		return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

	};
};

