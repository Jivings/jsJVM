(function() {
  this.InternalJNI = (function() {
    function InternalJNI(JVM) {
      this.JVM = JVM;
    }
    InternalJNI.prototype.RegisterNatives = function(jclass, methods) {
      var method, name, _results;
      _results = [];
      for (name in methods) {
        method = methods[name];
        _results.push(jclass.methods[name] = this.JVM[method]);
      }
      return _results;
    };
    InternalJNI.prototype.GetObjectClass = function() {};
    return InternalJNI;
  })();
}).call(this);
