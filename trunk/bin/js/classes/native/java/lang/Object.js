function() {
  this.nativeMethods = {
        "hashCode ()I" : 'JVM_IHashCode',
        "wait (J)V" : 'JVM_MonitorWait',
        "notify ()V" : 'JVM_MonitorNotify',
        "notifyAll ()V" : 'JVM_MonitorNotifyAll',
        "clone ()Ljava/lang/Object;" : 'JVM_Clone'
    }
  
  this.registerNatives = function(env, jclass) {
      env.RegisterNatives(env, jclass, this.nativeMethods)
  }
  
  this.getClass = function(env, jObject) {
    if( jObject == NULL) {
      env.JVM_NullPointerException(env, NULL)
      return 0;
    }
    else 
      return env.GetObjectClass(env, jObject)
  }
}
