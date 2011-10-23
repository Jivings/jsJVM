/**
 * Represents a Java Class file. Also provides Class verification methods.
 * @returns {JavaClass}
 */
function JavaClass() {
	
	this.magic_number;
	this.minor_version;
	this.major_version;
	this.constant_pool_count = 0;
	this.constant_pool;
	this.access_flags;
	this.this_class;
	this.super_class;
	this.interfaces_count = 0;
	this.interfaces;
	this.fields_count = 0;
	this.fields;
	this.methods_count = 0;
	this.methods;
	this.attributes_count = 0;
	this.attributes;
	
	this.main = false;
	
	/**
	 * Returns the super class reference so that it can be loaded.
	 */
	this.get_super = function() {
		var super_ref = this.constant_pool[this.super_class];
		return this.constant_pool[super_ref];
	};
	
	this.get_name = function() {
		var super_ref = this.constant_pool[this.this_class];
		return this.constant_pool[super_ref];
	};
	
	/**
	 * Verifies the file is a Java Class file.
	 */
	this.verify = function() {
		return this.magic_number == 'cafebabe'; 
	};
	
	/**
	 * Validates the class, checking it can be loaded based on the type and access flags.
	 */
	this.validate = function(class_type) {
		// TODO 
	};
	
	this.set_method_count = function(count) {
		this.methods_count = count;
		this.methods = new Array(count);
	};
	
	this.set_constant_pool_count = function(count) {
		this.constant_pool_count = count;
		this.constant_pool = new Array(count);
	};
	
	this.set_interfaces_count = function(count) {
		this.interfaces_count = count;
		this.interfaces = new Array(count);
	};
	
	this.set_fields_count = function(count) {
		this.fields_count = count;
		this.fields = new Array(count);
	};
	
	this.set_attributes_count = function(count) {
		this.attributes_count = count;
		this.attributes = new Array(count);
	};
};