function() {
  this.nativeMethods = {
        "hashCode"  : { "name" : "JVM_IHashCode", "descriptor" : "()I" },
        "wait"      : { "name" : "JVM_MonitorWait", "descriptor" : "(J)V" },
        "notify"    : { "name" : "JVM_MonitorNotify", "descriptor" : "()V" },
        "notifyAll" : { "name" : "JVM_MonitorNotifyAll", "descriptor": "()V" },
        "clone"     : { "name" : "JVM_Clone", "descriptor" : "()Ljava/lang/Object;" }
    }
  
  this.registerNatives = function(env) {
    env.RegisterNatives(env, this, this.nativeMethods)
  }
  
  this.getClass = function(env, jObject) {
    obj = env.JVM_FromHeap(jObject.object);
    if(obj === null) {
      env.JVM_NullPointerException(env, NULL)
      return 0;
    }
    else 
      return env.JVM_GetObjectClass(jObject.object)
  }
}
