function JavaClass() {
	
	this.magic_number;
	this.minor_version;
	this.major_version;
	this.constant_pool_count = 0;
	this.constant_pool = {};
	this.access_flags;
	this.this_class;
	this.super_class;
	this.interfaces_count;
	this.interfaces = {};
	this.fields_count = 0;
	this.fields = {};
	this.methods_count = 0;
	this.methods = {};
	this.attributes_count = 0;
	this.attributes = {};
	
		
	this.verify = function() {
		return this.magic_number == 'cafebabe'; 
	};
};