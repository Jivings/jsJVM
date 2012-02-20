function() {

  /*
   * Fill in the current stack trace in this exception.  This is
   * usually called automatically when the exception is created but it
   * may also be called explicitly by the user.  This routine returns
   * `this' so you can write 'throw e.fillInStackTrace();'
   */
  this.fillInStackTrace = function(env, throwable) {
      env.JVM_FillInStackTrace(env, throwable);
      return throwable;
  };
  
  this.getStackTraceDepth = function(env, throwable) {
      return env.JVM_GetStackTraceDepth(env, throwable);
  };

  this.getStackTraceElement = function(env, throwable, index) {
      return env.JVM_GetStackTraceElement(env, throwable, index);
  };
}
