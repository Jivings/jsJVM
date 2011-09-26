document.getElementById('files').addEventListener('change',
			handleFileSelect, false);

function handleFileSelect(evt) {
	
	var files = evt.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		var jvm = new JVM();
		jvm.load(evt.target.result);		
	};
	reader.readAsBinaryString(file);
}