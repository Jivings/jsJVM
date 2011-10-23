/*
  Runtime Data Area 
*/
var _rda = {
	method_area : {
		
	},
	heap : {
		permgen : {},
		oldgen : {},
		younggen : {}
	},
	threads : {}
};

var _thread = function() {
  	this.pc = {};
	this.jvm_stack = {
		frames : {
			1 : new _frame()
		}
	};
	this.c_stack = {};
};

var _frame = function() {
	this.op_stack = Array;
	this.rcp_reference = {};
	this.local_vars = {};	
};

var _class = function() {
	this.constant_pool = {};
	this.method_code = {};
	this.attr_and_vals = {};
};



var spawn_thread = function() {
  var thread_id = 0;
  _rda.threads[thread_id] = new _thread();
  return _rda.threads[thread_id];
};


var parse_bytecode = function(lines) {
	var this_class = new _class();
	$.each(lines, function(line_num, line) {
		if(line.search(/^const/) != -1) {
			this_class.constant_pool = line.substring(line.indexOf('#'));
		}
	});
};
