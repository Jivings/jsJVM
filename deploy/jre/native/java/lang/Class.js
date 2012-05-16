function() {
    
  this.OBJ = "Ljava/lang/Object;";
  this.CLS = "Ljava/lang/Class;";
  this.CPL = "Lsun/reflect/ConstantPool;";
  this.STR = "Ljava/lang/String;";
  this.JCL = "Ljava/lang/ClassLoader;";
  this.FLD = "Ljava/lang/reflect/Field;";
  this.MHD = "Ljava/lang/reflect/Method;";
  this.CTR = "Ljava/lang/reflect/Constructor;";
  this.PD  = "Ljava/security/ProtectionDomain;";
  this.BA  = "[B";

  this.nativeMethods = {
    "getName0"        :  { "descriptor" : "()" + this.STR,       
      "name" : "JVM_GetClassName" },
    "getSuperclass"   :  { "descriptor" : "()" + this.CLS,      
      "name" : "NULL" },
    "getInterfaces"   :  { "descriptor" : "()[" + this.CLS,       
      "name" : "JVM_GetClassInterfaces"},
    "getClassLoader0" :  { "descriptor" : "()" + this.JCL,        
      "name" : "JVM_GetClassLoader"},
    "isInterface"     :  { "descriptor" : "()Z",                  
      "name" : "JVM_IsInterface"},
    "getSigners"      :  { "descriptor" : "()[" + this.OBJ,       
      "name" : "JVM_GetClassSigners"},
    "setSigners"      :  { "descriptor" : "([" + this.OBJ + ")V", 
      "name" : "JVM_SetClassSigners"},
    "isArray"         :  { "descriptor" : "()Z",                  
      "name" : "JVM_IsArrayClass"},
    "isPrimitive"     :  { "descriptor" : "()Z",                  
      "name" : "JVM_IsPrimitiveClass"},
    "getComponentType":  { "descriptor" : "()" + this.CLS,        
      "name" : "JVM_GetComponentType"},
    "getModifiers"    :  { "descriptor" : "()I",                  
      "name" : "JVM_GetClassModifiers"},
    "getDeclaredFields0":{ "descriptor" : "(Z)[" + this.FLD,      
      "name" : "JVM_GetClassDeclaredFields" },
    "getDeclaredMethods0":{ "descriptor" : "(Z)[" + this.MHD,     
      "name" : "JVM_GetClassDeclaredMethods" },
    "getDeclaredConstructors0":{"descriptor" : "(Z)["+this.CTR,   
      "name" : "JVM_GetClassDeclaredConstructors" },
    "getProtectionDomain0" : { "descriptor" : "()" + this.PD,     
      "name" : "JVM_GetProtectionDomain" },
    "setProtectionDomain0" : { "descriptor" : "(" + this.PD +")V",
      "name" : "JVM_SetProtectionDomain" },
    "getDeclaredClasses0"  : { "descriptor" : "()[" + this.CLS,   
      "name" : "JVM_GetDeclaredClasses" },
    "getDeclaringClass"    : { "descriptor" : "()" + this.CLS,    
      "name" : "JVM_GetDeclaringClass" },
    "getGenericSignature"  : { "descriptor" : "()" + this.STR,    
      "name" : "JVM_GetClassSignature" },
    "getRawAnnotations"    : { "descriptor" : "()" + this.BA,     
      "name" : "JVM_GetClassAnnotations" },
    "getConstantPool"      : { "descriptor" : "()" + this.CPL,      
      "name" : "JVM_GetClassConstantPool" },
    "desiredAssertionStatus0" : { "descriptor" : "(" + this.CLS + ")Z", 
      "name" : "JVM_DesiredAssertionStatus" },
    "getEnclosingMethod0"  : { "descriptor" : "()[" + this.OBJ,   
      "name" : "JVM_GetEnclosingMethodInfo" }
  };
    
    
    this.registerNatives = function(env, jclass) {
      env.RegisterNatives(env, this, this.nativeMethods);
    }
    
    /*
    Java_java_lang_Class_forName0(JNIEnv *env, jclass this, jstring classname,
                              jboolean initialize, jobject loader)
    {
        char *clname;
        jclass cls = 0;
        char buf[128];
        int len;
        int unicode_len;

        if (classname == NULL) {
            JNU_ThrowNullPointerException(env, 0);
            return 0;
        }

        len = (*env)->GetStringUTFLength(env, classname);
        unicode_len = (*env)->GetStringLength(env, classname);
        if (len >= sizeof(buf)) {
            clname = malloc(len + 1);
            if (clname == NULL) {
                JNU_ThrowOutOfMemoryError(env, NULL);
                return NULL;
            }
        } else {
            clname = buf;
        }
        (*env)->GetStringUTFRegion(env, classname, 0, unicode_len, clname);

        if (VerifyFixClassname(clname) == JNI_TRUE) {
            // slashes present in clname, use name b4 translation for exception 
            (*env)->GetStringUTFRegion(env, classname, 0, unicode_len, clname);
            JNU_ThrowClassNotFoundException(env, clname);
            goto done;
        }

        if (!VerifyClassname(clname, JNI_TRUE)) {  // expects slashed name 
            JNU_ThrowClassNotFoundException(env, clname);
            goto done;
        }

        cls = JVM_FindClassFromClassLoader(env, clname, initialize,
                                           loader, JNI_FALSE);

     done:
        if (clname != buf) {
            free(clname);
        }
        return cls;
    }

    JNIEXPORT jboolean JNICALL
    Java_java_lang_Class_isInstance(JNIEnv *env, jobject cls, jobject obj)
    {
        if (obj == NULL) {
            return JNI_FALSE;
        }
        return (*env)->IsInstanceOf(env, obj, (jclass)cls);
    }

    JNIEXPORT jboolean JNICALL
    Java_java_lang_Class_isAssignableFrom(JNIEnv *env, jobject cls, jobject cls2)
    {
        if (cls2 == NULL) {
            JNU_ThrowNullPointerException(env, 0);
            return JNI_FALSE;
        }
        return (*env)->IsAssignableFrom(env, cls2, cls);
    }

    JNIEXPORT jclass JNICALL
    Java_java_lang_Class_getPrimitiveClass(JNIEnv *env,
                                           jclass cls,
                                           jstring name)
    {
        const char *utfName;
        jclass result;

        if (name == NULL) {
            JNU_ThrowNullPointerException(env, 0);
            return NULL;
        }

        utfName = (*env)->GetStringUTFChars(env, name, 0);
        if (utfName == 0)
            return NULL;

        result = JVM_FindPrimitiveClass(env, utfName);

        (*env)->ReleaseStringUTFChars(env, name, utfName);

        return result;
    }
    */
    this.getPrimitiveClass = function(env, name) {
      // get the string object from the heap
      string = env.JVM_FromHeap(name)
      name = env.JVM_FromHeap(string.value).join('')
      // TODO, make this return the class
      //return window['CONSTANT_'+name];
      return new JVM_Reference(0);
    };
}
