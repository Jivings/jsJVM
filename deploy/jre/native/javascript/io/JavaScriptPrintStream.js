function f() {
	
	this.writeString = function(env, string, id) {
		var component, elementstr, elementid, inputstr, str;

		elementstr = env.JVM_FromHeap(id);
		elementid = env.JVM_FromHeap(elementstr.value).join('');

		inputstr = env.JVM_FromHeap(string);
		str = env.JVM_FromHeap(inputstr.value).join('');

		component = document.getElementById(elementid);
		if (component != null) {
			component.innerHTML += str + '<br />';
		}
	};

    this.writeInt = function(env, i, id) {
        var component, elementstr, elementid, inputi;

        elementstr = env.JVM_FromHeap(id);
        elementid = env.JVM_FromHeap(elementstr.value).join('');

        //inputi = env.JVM_FromHeap(i);
        

        component = document.getElementById(elementid);
		if (component != null) {
			component.innerHTML += i.val + '<br />';
		}
    };

    this.writeObject = function(env, item, id) {
        var component;
        elementstr = env.RDA.heap[id.pointer];
        elementid = env.RDA.heap[elementstr.value.pointer].join('');
        
        component = document.getElementById(elementid);
        if (component != null) {
            component.innerHTML += item.val + '<br />';
        }
    };
	
}

