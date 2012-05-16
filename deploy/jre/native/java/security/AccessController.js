function() {

    this.doPrivileged = function(env, action, context) {
        env.JVM_DoPrivileged(action, null, true);
    };
}
