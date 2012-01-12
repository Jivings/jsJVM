(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  this.NativeFrame = (function() {
    __extends(NativeFrame, Frame);
    function NativeFrame(method, cls, env) {
      var descriptor_index;
      this.cls = cls;
      this.env = env;
      this.name = method.name;
      try {
        this.method = this.cls["native"][method.name];
      } catch (err) {
        console.log('UnsatisfiedLinkError: ' + this.cls.real_name + '...' + method.name);
        return false;
      }
      descriptor_index = this.cls.methods[method.name].descriptor_index;
      this.descriptor = this.cls.constant_pool[descriptor_index];
      this.args = this.descriptor.substring(this.descriptor.indexOf('(') + 1, this.descriptor.indexOf(')'));
      this.returntype = this.descriptor.substring(this.descriptor.indexOf(')') + 1);
      this.op_stack = new Array();
    }
    NativeFrame.prototype.execute = function(pc, opcodes) {
      var returnval;
      returnval = this.method.call(this.cls["native"], this.env, this.cls);
      if (returnval != null) {
        this.op_stack.push(returnval);
      }
      switch (this.returntype) {
        case 'B':
        case 'C':
        case 'I':
        case 'Z':
        case 'S':
          return opcodes[171]["do"](this);
        case 'D':
          this.op_stack.push(returnval);
          return opcodes[175]["do"](this);
        case 'F':
          return opcodes[174]["do"](this);
        case 'J':
          return opcodes[173]["do"](this);
        case 'L':
        case '[':
          return opcodes[176]["do"](this);
        default:
          return opcodes[177]["do"](this);
      }
    };
    return NativeFrame;
  })();
}).call(this);
