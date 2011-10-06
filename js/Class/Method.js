/**
 * @returns {Method}
 */
function Method() {
	
	this.access_flags = {};
			
	
	this.PUBLIC 		= 	0x0001;
	this.PRIVATE 		= 	0x0002;
	this.PROTECTED 		= 	0x0004;
	this.STATIC 		= 	0x0008;
	this.FINAL	 		= 	0x0010;
	this.SYNCHRONIZED 	= 	0x0020;
	this.NATIVE 		= 	0x0100;
	this.ABSTRACT 		= 	0x0400;
		
	this.PUBLIC_STATIC 		= 	this.PUBLIC 	^ 	this.STATIC;
	
	this.PUBLIC_NATIVE 		= 	this.PUBLIC 	^ 	this.NATIVE;
	this.PRIVATE_NATIVE 	=	this.PRIVATE 	^ 	this.NATIVE;
	this.PROTECTED_NATIVE 	=	this.PROTECTED 	^ 	this.NATIVE;
	this.FINAL_NATIVE 		= 	this.FINAL 		^ 	this.NATIVE;
	
	this.PRIVATE_SYNCHRONIZED 	= 	this.PRIVATE 	^ 	this.SYNCHRONIZED;
	this.PROTECTED_SYNCHRONIZED = 	this.PROTECTED 	^ 	this.SYNCHRONIZED;
	this.FINAL_SYNCHRONIZED 	= 	this.FINAL 		^ 	this.SYNCHRONIZED;
	
	this.PUBLIC_NATIVE_SYNCHRONIZED		=	this.PUBLIC		^	this.NATIVE		^	this.SYNCHRONIZED;
	this.PRIVATE_NATIVE_SYNCHRONIZED	=	this.PRIVATE 	^	this.NATIVE 	^	this.SYNCHRONIZED;
	this.PROTECTED_NATIVE_SYNCHRONIZED	= 	this.PROTECTED 	^ 	this.NATIVE 	^	this.SYNCHRONIZED;
	this.FINAL_NATIVE_SYNCHRONIZED		= 	this.FINAL		^	this.NATIVE 	^	this.SYNCHRONIZED;
	
	this.PUBLIC_ABSTRACT	=	this.PUBLIC		^	this.ABSTRACT;
	this.PROTECTED_ABSTRACT =	this.PROTECTED	^	this.ABSTRACT;
	
	
	
	
		
	
};

var af = {
	PUBLIC 			: 	0x0001,
	PRIVATE 		: 	0x0002,
	PROTECTED 		: 	0x0004,
	STATIC 			: 	0x0008,
	FINAL	 		: 	0x0010,
	SYNCHRONIZED 	: 	0x0020,
	NATIVE 			:	0x0100,
	ABSTRACT 		: 	0x0400
};

$.each(af.raw, function(flag, bitmask) {
	af[bitmask] = flag;
});
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.NATIVE] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.FINAL] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';
af[af.raw.PUBLIC ^ af.raw.ABSTRACT] = 'PUBLIC_ABSTRACT';


/*
af[af.raw.PUBLIC] 	= 	'PUBLIC';
af[af.raw.PRIVATE] 	= 	'PRIVATE';
af[af.raw.PROTECTED] =	'PROTECTED';
af[af.raw.STATIC] = 'STATIC';
af[af.raw.FINAL] = 'FINAL'
af[af.raw.SYNCHRONIZED] = 
af[af.raw.PROTECTED]
af[af.raw.PROTECTED]
af[af.raw.PROTECTED]
*/



