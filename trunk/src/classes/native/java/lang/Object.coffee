
nativeMethods : {
    "hashCode ()I" : 'JVM_IHashCode'
    "wait (J)V" : 'JVM_MonitorWait'
    "notify ()V" : 'JVM_MonitorNotify'
    "notifyAll ()V" : 'JVM_MonitorNotifyAll'
    "clone ()Ljava/lang/Object;" : 'JVM_Clone'
}

Java_java_lang_Object_registerNatives : (env, jclass) ->
  env.RegisterNatives(env, jclass, nativeMethods)


Java_java_lang_Object_getClass : (env, jObject) -> 
  if( jObject == NULL) 
    env.JVM_NullPointerException(env, NULL)
  else 
    return env.GetObjectClass(env, jObject)
