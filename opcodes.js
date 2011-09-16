var opcodes = {
	iconst_0 : function(t) {
		t.stack.push(0);
	},
	iconst_1 : function(t) {
		t.stack.push(1);
	},
	iconst_2 : function(t) {
		t.stack.push(2);
	},
	iadd : function(t) {
		t.stack.push(t.stack.pop() + t.stack.pop());
	}
};
