$(function() {
	var test = [
		"const #1 = Method #6.#15;", // java/lang/Object."<init>":()V
		"const #2 = Field #16.#17;", // java/lang/System.out:Ljava/io/PrintStream;
		"const #3 = String #18;", // Hello, world!
		"const #4 = Method #19.#20;", // java/io/PrintStream.println:(Ljava/lang/String;)V
		"const #5 = class #21;", // HelloWorld
		"const #6 = class #22;", // java/lang/Object
		"const #7 = Asciz <init>;",
		"const #8 = Asciz ()V;",
		"const #9 = Asciz Code;",
		"const #10 = Asciz LineNumberTable;",
		"const #11 = Asciz main;",
		"const #12 = Asciz ([Ljava/lang/String;)V;",
		"const #13 = Asciz SourceFile;",
		"const #14 = Asciz HelloWorld.java;",
		'const #15 = NameAndType #7:#8;',// "<init>":()V
		"const #16 = class #23;", // java/lang/System",
		"const #17 = NameAndType #24:#25;",// out:Ljava/io/PrintStream;",
		"const #18 = Asciz Hello, world!;",
		"const #19 = class #26;", // java/io/PrintStream",
		"const #20 = NameAndType #27:#28;",// println:(Ljava/lang/String;)V"
		"const #21 = Asciz HelloWorld;",
		"const #22 = Asciz java/lang/Object;",
		"const #23 = Asciz java/lang/System;",
		"const #24 = Asciz out;",
		"const #25 = Asciz Ljava/io/PrintStream;;",
		"const #26 = Asciz java/io/PrintStream;",
		"const #27 = Asciz println;",
		"const #28 = Asciz (Ljava/lang/String;)V;"
	];

	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	
	
	//var ts = file.OpenAsTextStream(); 

	//parse_bytecode(test);	
	
	/*var t = spawn_thread();
	$.each(test, function(i, opcode) {
		var $op = $('<p>'+opcode+'</p>');
		$('#log').append($op);
		try {
			opcodes[opcode](t);
		}
		catch(err) {
			$op.append('<span class="error">'+err+'OPCODE not found</span>');
		}
	});
	*/
});

function handleFileSelect(evt) {
	var files = evt.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.onloadend = function(evt) {
 	     	if (evt.target.readyState == FileReader.DONE) {
			
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
				
				if(name == 'constant_pool') {
					// After constant pool count, get constants from pool
					$('#console').append('<p>Constant-Pool:</p>');
					constant_pool = iteratePool(_class_vars.constant_pool_count, _class);
				}
				else if(name == 'interface_table') {
					$('#console').append('<p>interface_table:</p>');
					interface_table = iterateInterfaces(_class_vars.interface_count, _class);
				}

				[_class_vars[name],_class] = readNextBytes(bytes, _class);
				$('#console').append('<p>'+ name + ' : ' + _class_vars[name] + '</p>');
			
				
				
			});
			
			
			/*[magic_number,_class] = readNextBytes(4, _class);
			[minor_version,_class] = readNextBytes(2, _class);
			[major_version,_class] = readNextBytes(2, _class);
			[constant_pool_count,_class] = readNextBytes(2, _class);

			$('#console').append('<p>magic:' + magic_number + '</p>');
			$('#console').append('<p>minor version:' + minor_version + '</p>');
			$('#console').append('<p>major version:' + major_version + '</p>');
			$('#console').append('<p>constant_pool:' + constant_pool_count + '</p>');*/
		}
	};
	reader.readAsBinaryString(file);
};

function iteratePool(count, _class) {
	// pool constants start at index 1 for historic reasons...
	var pool = [], 
	    count = parseInt(count, 16);
	for(var i=1; i<count; i++) {
		var tag, value;
		[tag,_class] = getTag(_class);
		[value,_class] = getConstant(tag, _class);
		$('#console').append('<p class="constant">#'+i+' '+tag+' '+value+'</p>');
		pool[i] = value;
	}
};
function iterateInterfaces(count, _class) {
	var interfaces = [],
	    count = parseInt(count, 16);
	for(var i=0; i<=count; i++) {
		var value;
		[value, _class] = readNextBytes(2,_class);
		$('#console').append('<p class="constant">'+value+'</p>')
	} 
};
function getConstant(tag, _class) {
	
	switch(parseInt(tag)){
		case 1:			
			// UTF-8 String
			var str_len = 0;
			// get string length in hex and parse to int
			[str_len,_class] = readNextBytes(2, _class);
			// get string bytes
			return readNextBytesAsString(parseInt(str_len, 16), _class);
			
		case 3:
			// Integer
			return readNextBytes(4, _class)
		case 4:
			// Float
			return readNextBytes(4, _class)
 		case 5:
			// Long
			return readNextBytes(8, _class)
		case 6:
			// Double
			return readNextBytes(8, _class)
		case 7:
			// Class Reference
			return readNextReference(2, _class);
		case 8:
			// String Reference
			return readNextReference(2, _class);
		case 9:
			// Field Reference
			return readNextReference(4, _class);
		case 10:
			// Method Reference			
			return readNextReference(4, _class);
		case 11:
			// Interface Method
			return readNextBytes(4, _class)
		case 12:
			// Name and type descriptor
			return readNextBytes(4, _class)
	}	
}
function getTag(stream) {
	var tag = stream.substring(0, 1);
	return [stream.substring(0, 1).charCodeAt(0), stream.substring(1)];
}
function readNextBytes(quantity, stream) {
	var U = '';
	$.each(stream.substring(0, quantity), function(i, ch) {
		U += ch.charCodeAt(0).toString(16);
	});
	var _class = stream.substring(quantity);
	return [U, _class];
};

function readNextReference(quantity, stream) {
	var reference_as_hex, reference = '';
	[reference_as_hex, stream] = readNextBytes(quantity, stream);
	
	for(var i=0; i<quantity; i=i+2) {
		reference += '#' + parseInt(reference_as_hex.substring(i,i+2), 16) + ' ';
	}
	var _class = stream.substring(quantity);
	return [reference, _class];
}

function readNextBytesAsString(quantity, stream) {
	var U = '';
	$.each(stream.substring(0, quantity), function(i, ch) {
		U += ch.charAt(0);
	});
	var _class = stream.substring(quantity);
	return [U, _class];
};
