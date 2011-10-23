console -> 
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
  }
  descriptors : {
    B : function() { return 'byte'; },
    C : function() { return 'char'; },
    D : function() { return 'double'; }, 
    F : function() { return 'float'; },
	I : function() { return 'int'; },
	J : function() { return 'long'; },
	L : function(descriptor) { return descriptor.substring(1); },
	S : function() { return 'short'; },
	Z : function() { return 'boolean'; },
	'[' : function() { return 'arraydimension'; },
	V : function() { return 'Void'; }
  }