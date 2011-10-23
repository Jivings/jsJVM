function get_flag(flag) {
	
	var result = '';
	for(f in access_flags) {
		if((flag & access_flags[f]) == access_flags[f]){
			result += f + ' ';
		}
	}
	return result;
}

var access_flags = {
	PUBLIC 			: 	0x0001,
	PRIVATE 		: 	0x0002,
	PROTECTED 		: 	0x0004,
	STATIC 			: 	0x0008,
	FINAL	 		: 	0x0010,
	SYNCHRONIZED 		: 	0x0020,
	NATIVE 			:	0x0100,
	ABSTRACT 		: 	0x0400,
	
	
};

