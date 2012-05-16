function() {
  this.OBJ = "Ljava/lang/Object;";
  
  this.nativeMethods = {
    "currentTimeMillis" : { "descriptor" : "()J", "name" : "JVM_CurrentTimeMillis" },
    "nanoTime"          : { "descriptor" : "()J", "name" : "JVM_NanoTime" },
    "arraycopy"         : { "descriptor" : "(" + this.OBJ + "I" + this.OBJ + "II)V", "name" : "JVM_ArrayCopy" }
  };
  
  this.registerNatives = function(env, cls) {
    env.RegisterNatives(env, this, this.nativeMethods);
  };
 
  this.identityHashCode = function(env, jobject) {
    return env.JVM_IHashCode(env, jobject);
  };
  /*
  this.PUTPROP = function(env, props, key, val) {
    if (1) {
      jkey = env.NewStringUTF(env, key); 
      jval = env.NewStringUTF(env, val); 
      r = env.CallObjectMethod(env, props, putID, jkey, jval);
      if env.ExceptionOccurred(env)) return null; 
        env.DeleteLocalRef(env, jkey); 
        env.DeleteLocalRef(env, jval); 
        env.DeleteLocalRef(env, r); 
    } 
  }
  
 this.PUTPROP_ForPlatformNString = function(env, props, key, val) {
    if (1) { 
      jkey = env.NewStringUTF(env, key);
      jval = GetStringPlatform(env, val);
      r = env.CallObjectMethod(env, props, putID, jkey, jval);
      if (env.ExceptionOccurred(env)) return NULL;
      env.DeleteLocalRef(env, jkey);
      env.DeleteLocalRef(env, jval);
      env.DeleteLocalRef(env, r);
    }
  }
  */
  this.VENDOR = "Ivings Inc.";
  this.VENDOR_URL = "http://www.ivings.org.uk";
  this.VENDOR_URL_BUG = "";
  
  this.JAVA_MAX_SUPPORTED_VERSION = 51;
  this.JAVA_MAX_SUPPORTED_MINOR_VERSION = 0;
  
  this.initProperties = function(env, cls, props) {
    /*
      
      Lots of code here that uses PUTPROP to set system properties such
      as line delimiters, java version, language, file encoding and os.
    */
    return env.JVM_InitProperties(env, props);
  };



/*
 * The following three functions implement setter methods for
 * java.lang.System.{in, out, err}. They are natively implemented
 * because they violate the semantics of the language (i.e. set final
 * variable).
 */
 
  this.setIn0 = function(env, cls, stream) {
    var fieldId;
    fieldId = env.GetStaticFieldID(env,cls,"in","Ljava/io/InputStream;");
    if (fieldId === 0) {
      return;
    }
    env.SetStaticObjectField(env,cls,fieldId,stream);
  };

  this.setOut0 = function(env, cls, stream) {
    env.SetStaticObjectField(cls,'out',stream);
  };

  this.setErr0 = function(env, cls, stream) {
    var fieldId;
    fieldId = env.GetStaticFieldID(env,cls,"err","Ljava/io/PrintStream;");
    if (fieldId === 0) { return; }
    env.SetStaticObjectField(env,cls,fieldId,stream);
  };

// Private 
/*
this.cpchars = function(dst, src, num) {
    var i;
    for (i = 0; i < n; i++) {
        dst[i] = src[i];
    }
}
*/

/** Needed? What does this really do? 
this.mapLibraryName = function(env, ign, libname) {
    var len, prefix_len, suffix_len;
    
    prefix_len = JNI_LIB_PREFIX.length;
    suffix_len = JNI_LIB_SUFFIX.length;

    jchar chars[256];
    if (libname == NULL) {
        JNU_ThrowNullPointerException(env, 0);
        return NULL;
    }
    len = (*env)->GetStringLength(env, libname);
    if (len > 240) {
        JNU_ThrowIllegalArgumentException(env, "name too long");
        return NULL;
    }
    cpchars(chars, JNI_LIB_PREFIX, prefix_len);
    (*env)->GetStringRegion(env, libname, 0, len, chars + prefix_len);
    len += prefix_len;
    cpchars(chars + len, JNI_LIB_SUFFIX, suffix_len);
    len += suffix_len;

    return (*env)->NewString(env, chars, len);
}
*/
}
