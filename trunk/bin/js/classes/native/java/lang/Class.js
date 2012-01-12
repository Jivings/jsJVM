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
    "getName0"        :  [ "() " + this.STR,       "JVM_GetClassName" ],
    "getSuperclass"   :  [ "()" + this.CLS,        "NULL" ],
    "getInterfaces"   :  [ "()[" + this.CLS,       "JVM_GetClassInterfaces"],
    "getClassLoader0" :  [ "()" + this.JCL,        "JVM_GetClassLoader"],
    "isInterface"     :  [ "()Z",             "JVM_IsInterface"],
    "getSigners"      :  [ "()[" + this.OBJ,       "JVM_GetClassSigners"],
    "setSigners"      :  [ "([" + this.OBJ + ")V", "JVM_SetClassSigners"],
    "isArray"         :  [ "()Z",             "JVM_IsArrayClass"],
    "isPrimitive"     :  [ "()Z",             "JVM_IsPrimitiveClass"],
    "getComponentType":  [ "()" + this.CLS,        "JVM_GetComponentType"],
    "getModifiers"    :  [ "()I",             "JVM_GetClassModifiers"],
    "getDeclaredFields0":[ "(Z)[" + this.FLD,      "JVM_GetClassDeclaredFields" ],
    "getDeclaredMethods0":[ "(Z)[" + this.MHD,     "JVM_GetClassDeclaredMethods" ],
    "getDeclaredConstructors0":["(Z)["+this.CTR,   "JVM_GetClassDeclaredConstructors" ],
    "getProtectionDomain0" : [ "()" + this.PD,     "JVM_GetProtectionDomain" ],
    "setProtectionDomain0" : [ "(" + this.PD +")V","JVM_SetProtectionDomain" ],
    "getDeclaredClasses0"  : [ "()[" + this.CLS,   "JVM_GetDeclaredClasses" ],
    "getDeclaringClass"    : [ "()" + this.CLS,    "JVM_GetDeclaringClass" ],
    "getGenericSignature"  : [ "()" + this.STR,    "JVM_GetClassSignature" ],
    "getRawAnnotations"    : [ "()" + this.BA,     "JVM_GetClassAnnotations" ],
    "getConstantPool"    : [ "()" + this.CPL,    "JVM_GetClassConstantPool" ],
    "desiredAssertionStatus0" : [
      "(" + this.CLS + ")Z", "JVM_DesiredAssertionStatus" ],
    "getEnclosingMethod0"  : [ "()[" + this.OBJ,   "JVM_GetEnclosingMethodInfo" ]
  };
    
    
    this.registerNatives = function(env, jclass) {
      env.RegisterNatives(env, jclass, this.nativeMethods);
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
}
