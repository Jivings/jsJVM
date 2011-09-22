$(function() {
	var test = [ "const #1 = Method #6.#15;", // java/lang/Object."<init>":()V
	"const #2 = Field #16.#17;", // java/lang/System.out:Ljava/io/PrintStream;
	"const #3 = String #18;", // Hello, world!
	"const #4 = Method #19.#20;", // java/io/PrintStream.println:(Ljava/lang/String;)V
	"const #5 = class #21;", // HelloWorld
	"const #6 = class #22;", // java/lang/Object
	"const #7 = Asciz <init>;", "const #8 = Asciz ()V;",
			"const #9 = Asciz Code;", "const #10 = Asciz LineNumberTable;",
			"const #11 = Asciz main;",
			"const #12 = Asciz ([Ljava/lang/String;)V;",
			"const #13 = Asciz SourceFile;",
			"const #14 = Asciz HelloWorld.java;",
			'const #15 = NameAndType #7:#8;',// "<init>":()V
			"const #16 = class #23;", // java/lang/System",
			"const #17 = NameAndType #24:#25;",// out:Ljava/io/PrintStream;",
			"const #18 = Asciz Hello, world!;", "const #19 = class #26;", // java/io/PrintStream",
			"const #20 = NameAndType #27:#28;",// println:(Ljava/lang/String;)V"
			"const #21 = Asciz HelloWorld;",
			"const #22 = Asciz java/lang/Object;",
			"const #23 = Asciz java/lang/System;", "const #24 = Asciz out;",
			"const #25 = Asciz Ljava/io/PrintStream;;",
			"const #26 = Asciz java/io/PrintStream;",
			"const #27 = Asciz println;",
			"const #28 = Asciz (Ljava/lang/String;)V;" ];

	document.getElementById('files').addEventListener('change',
			handleFileSelect, false);

	// var ts = file.OpenAsTextStream();

	// parse_bytecode(test);

	/*
	 * var t = spawn_thread(); $.each(test, function(i, opcode) { var $op = $('<p>'+opcode+'</p>');
	 * $('#log').append($op); try { opcodes[opcode](t); } catch(err) {
	 * $op.append('<span class="error">'+err+'OPCODE not found</span>'); } });
	 */
});

var tags = {
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
	};


function handleFileSelect(evt) {
	
	var files = evt.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		if (evt.target.readyState == FileReader.DONE) {

			var c = class_file;
			c.prototype = new class_reader();
			cf = new c(evt.target.result);			
			cf.parse_class_vars();
			return;
			
			
			var _class = evt.target.result,
			// Values stored as Hex after assignment
			_class_vars = {
				magic_number : 4,
				minor_version : 2,
				major_version : 2,
				constant_pool_count : 2,
				constant_pool : [],
				access_flags : 2,
				this_class : 2,
				super_class : 2,
				interface_count : 2,
				interface_table : [],
				field_count : 2,
				field_table : [],
				method_count : 2,
				method_table : [],
				attribute_count : 2,
				attribute_table : []
			};

			$.each(_class_vars, function(name, bytes) {
				
				if (name == 'constant_pool') {
					// After constant pool count, get constants from pool
					$('#console').append('<p>Constant-Pool:</p>');
					constant_pool = iteratePool(
							_class_vars.constant_pool_count, _class);
				}
				else if(name == 'this_class') {
					[ _class_vars[name], _class ] = readNextBytes(bytes, _class);
					$('#console').append('<p>' +name +': '+_class_vars[name] + '</p>');
				}
				else if( name == 'access_flags' ) {// bitmask
					[ _class_vars[name], _class ] = readNextBitMask(bytes, _class);
					$('#console').append('<p>' +name +': '+_class_vars[name] + '</p>');
				}
				//else if(name == 'interface_count') {
				//	[ _class_vars[name], _class ] = readNextBytes(bytes, _class);
				//s}
				else if (name == 'interface_table') {
					$('#console').append('<p>interface_table:</p>');
					interface_table = iterateInterfaces(
							_class_vars.interface_count, _class);
				}
				else {
					
					[ _class_vars[name], _class ] = readNextBytes(bytes, _class);
					
					validate_var(name, _class_vars[name]);
										
					$('#console').append(
							'<p>' + name + ' : ' + parseInt(_class_vars[name], 16) + '</p>');
				}
			});
		}
	};
	reader.readAsBinaryString(file);
};


function validate_var(name, class_var) {
	if( name == 'magic_number' && class_var != 'cafebabe'){
		throw 'UnsupportedClassFormatException';
	}
	
}
function iteratePool(count, _class) {
	// pool constants array index starts at 1 for historic reasons...(?)
	var pool = [], count = parseInt(count, 16);
	for ( var i = 1; i < count; i++ ) {
		var tag, value;
		[ tag, _class ] = getTag(_class);
		[ value, _class ] = getConstant(tag, _class);
		
		$('#console').append('<p class="constant">#' + i + ' ' + tags[tag] + '<span class="value">' + HTMLencode(value) + '</span></p>');
		pool[i] = value;
	}
	return pool;
};
function iterateInterfaces(count, _class) {
	var interfaces = [], count = 1;
	for ( var i = 0; i <= count; i++ ) {
		var value, tag;
		[ tag, _class ] = getTag(_class);
		[ value, _class ] = getConstant(tag, _class);
		
		$('#console').append('<p class="constant">' + value + '</p>');
		interfaces[i] = value;
	}
	return interfaces;
};
function getConstant(tag, _class) {

	switch (parseInt(tag)) {
	case 1:	// UTF-8 String
		var str_len = 0;
		// get string length in hex and parse to int
		[ str_len, _class ] = readNextBytes(2, _class);
		// get string bytes
		return readNextBytesAsString(parseInt(str_len, 16), _class);

	case 3:	// Integer
		return readNextBytes(4, _class);
	case 4: // Float
		return readNextBytes(4, _class);
	case 5:	// Long
		return readNextBytes(8, _class);
	case 6:	// Double
		return readNextBytes(8, _class);
	case 7:	// Class Reference
		return readNextReference(2, _class);
	case 8: // String Reference
		return readNextReference(2, _class);
	case 9: // Field Reference
		return readNextReference(4, _class);
	case 10: // Method Reference
		return readNextReference(4, _class);
	case 11: // Interface Method
		return readNextBytes(4, _class);
	case 12: // Name and type descriptor
		return readNextReference(4, _class);
	default:
		throw 'UnknownConstantException';
	}
}
function getTag(stream) {
	return [ stream.substring(0, 1).charCodeAt(0), stream.substring(1) ];
}
function readNextBytes(quantity, stream) {
	var U = '';
	$.each(stream.substring(0, quantity), function(i, ch) {
		U += ch.charCodeAt(0).toString(16);
	});
	var _class = stream.substring(quantity);
	return [ U, _class ];
};

function readNextReference(quantity, stream) {
	var reference_as_hex, reference = '';
	[ reference_as_hex, stream ] = readNextBytes(quantity, stream);

	if(quantity == 2) {
		return [ reference = '#' +  parseInt(reference_as_hex, 16) , stream ];
	}
	for ( var i = 0; i < quantity; i = i + 2) {
		reference += '#' + parseInt(reference_as_hex.substring(i, i + 2), 16)
				+ ' ';
	}
	return [ reference, stream ];
}

function readNextBytesAsString(quantity, stream) {
	var U = '';
	$.each(stream.substring(0, quantity), function(i, ch) {
		U += ch.charAt(0);
	});
	var _class = stream.substring(quantity);
	return [ U, _class ];
};

function readNextBitMask(quantity, stream) {
	var U = '';
	$.each(stream.substring(0, quantity), function(i, ch) {
		U +=  ch.charCodeAt(0).toString(10) + ' ';
	});
	var _class = stream.substring(quantity);
	return [ U, _class ];
}

function HTMLencode(string){
	return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

};


var Convert = {
	     chars: " !\"#$%&amp;'()*+'-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
	     hex: '0123456789ABCDEF', bin: ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111'],
	     decToHex: function(d){
	          return (this.hex.charAt((d - d % 16)/16) + this.hex.charAt(d % 16));
	     },
	     toBin: function(ch){
	          var d = this.toDec(ch);
	          var l = this.hex.charAt(d % 16);
	          var h = this.hex.charAt((d - d % 16)/16);
	          var hhex = "ABCDEF";
	          var lown = l < 10 ? l : (10 + hhex.indexOf(l));
	          var highn = h < 10 ? h : (10 + hhex.indexOf(h));
	          return this.bin[highn] + ' ' + this.bin[lown];
	     },
	     toHex: function(ch){
	          return this.decToHex(this.toDec(ch));
	     },
	     toDec: function(ch){
	          var p = this.chars.indexOf(ch);
	          return (p <= -1) ? 0 : (p + 32);
	     }
	};