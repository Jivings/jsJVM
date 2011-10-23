var RDA = {
	method_area : {
		
	},
	heap : {
		permgen : {},
		oldgen : {},
		younggen : {}
	},
	threads : {}
	
};

function Thread() {
  	this.pc = {};
	this.jvm_stack = {
		frames : {
			1 : new Frame()
		}
	};
	this.c_stack = {};
};

var Frame = function() {
	this.op_stack = Array;
	this.rcp_reference = {};
	this.local_vars = {};
};

var spawn_thread = function() {
  var thread_id = 0;
  _rda.threads[thread_id] = new _thread();
  return _rda.threads[thread_id];
};