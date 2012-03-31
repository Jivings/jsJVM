function() {
	
	this.writeString = function(env, string, id) {
		var component, elementstr, elementid;

		elementstr = env.RDA.heap[id.pointer]
		elementid = env.RDA.heap[elementstr.value.pointer].join('');

		inputstr = env.RDA.heap[string.pointer]
		str = env.RDA.heap[inputstr.value.pointer].join('');

		component = document.getElementById(elementid);
		if (component != null) {
			component.innerHTML += str + '<br />';
		}
	};

    
    this.writeObject = function(env, item, id) {
        var component;
        elementstr = env.RDA.heap[id.pointer]
        elementid = env.RDA.heap[elementstr.value.pointer].join('');
        
        component = document.getElementById(elementid);
        if (component != null) {
            component.innerHTML += item.val + '<br />';
        }
    }
	
}

