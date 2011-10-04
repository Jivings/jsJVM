/**
 * Singleton/Static Console Class. Provides access to the JVM/HTML console for System Output.
 */
var Console = {
		
	console : $('#console'),
	_debug : true,
	tags : {
		1 : 'Asciz',
		3 : 'Integer',
		4 : 'Float',
		5 : 'Long',
		6 : 'Double',
		7 : 'Class',
		8 : 'String Reference',
		9 : 'Field Reference',
		10 : 'Method',
		11 : 'Interface Method',
		12 : 'NameAndType'
	},
	access_flags : {
		1 : 'public',
		2 : 'private',
		4 : 'protected',
		8 : 'static',
		10 : 'final',
		20 : 'synchronized',
		100 : 'native',
		400 : 'abstract'
	},
	descriptors : {
		B : 'byte',
		C : 'char',
		D : 'double', 
		F : 'float',
		I : 'int',
		J : 'long',
		L : 'class',
		S : 'short',
		Z : 'boolean',
		'[' : 'arraydimension',
		V : 'Void'
	},
	
	out : function(string) {
		this.console.append('<pre><p>'+this.HTMLencode(string)+'</p></pre>');
	},
	error : function(string) {
		this.console.append('<pre><p class="error">'+this.HTMLencode(string)+'</p></pre>');
	},
	/**
	 * Output a string to the console.
	 * @param string String to output
	 */
	debug : function(string) {
		if(this._debug) {
			this.console.append('<pre><p>'+this.HTMLencode(string)+'</p></pre>');
		}
	},
	
	/**
	 * Output a JavaClass constant to the console. For Class file debugging.
	 * @param index of the constant in the Constant Pool
	 * @param tag defines the type of Constant, represented in this.tags array.
	 * @param value of the Constant for printing.
	 */
	write_constant : function(index, tag, value) {
		if(this._debug) {
			this.console.append('<pre><p class="constant">#' + index + ' ' + this.tags[tag] + '<span class="value">' + this.HTMLencode(value) + '</span></p></pre>');
		}
	},
	
	/**
	 * Output a method details. For Class File debugging.
	 * @param method
	 */
	write_method : function(method, _class) {
		if(this._debug) {
			this.console.append('<pre>'+
							'<p>'+this.access_flags[parseInt(method.access_flags, 16)] + ' ' +
								this.HTMLencode(_class.constant_pool[parseInt(method.name_index, 16)]) +
								this.parse_descriptor(_class.constant_pool[parseInt(method.descriptor_index, 16)])+'</p>'+
							'<p class="constant"> Access Flags: '+method.access_flags+'</p>'+
							'<p class="constant"> Name Index: '+parseInt(method.name_index, 16)+'</p>'+
							'<p class="constant"> Descriptor: '+parseInt(method.descriptor_index, 16)+'</p>'+
							'<p class="constant"> Attr Count: '+parseInt(method.attribute_count, 16)+'</p></pre>');
		}
	},
	
	parse_descriptor : function(desc) {
		var params = desc.substring( 1, desc.indexOf(')'));
		var return_val = desc.substring( desc.indexOf(')') + 1);
		
		var descriptor = '(';
		for( char in params ) {
			descriptor += this.descriptors[params[char]] + ', ';
		};
		descriptor += ') returns ';
		for (char in return_val ) {
			descriptor += this.descriptors[return_val[char]];
		};
		return descriptor;
	},
	/**
	 * Replace relevant chars with their HTML encoded equilivents so that they can be displayed.
	 * @param string 
	 * @returns encoded String
	 */
	HTMLencode : function(string){
		return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
	}
};