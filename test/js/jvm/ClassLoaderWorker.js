(function() {
  var classLoader;
  classLoader = new ClassLoader();
  this.onmessage = function(e) {
    return postMessage('Done');
  };
}).call(this);
