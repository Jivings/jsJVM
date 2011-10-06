/*$(function() {
var JVM_classes = [	
			'ClassLoader',
			'JavaClass',
			'Console',
			'Test'
	]; 
	
	$.each(JVM_classes, function(i, js_class){
		$.getScript('js/'+js_class+'.js');
	});

});

 */
/**
 * Represents the bulk of the JavaScript Implementation of the Java Virtual
 * Machine
 */
function JVM() {

	this.classLoader = new ClassLoader();
	
	
	/**
	 * Push classes onto the ClassLoader Stack.
	 * Return self for chaining.
	 */
	this.load = function(classes, classes_size, main_class_name) {
		Console.out('Loading classes...');
		
		// move classLoader object into scope.		
		var classLoader = this.classLoader;
		
		try {
			
			$.each(classes, function(i, binary_stream) {
				var reader = new FileReader();
				reader.onloadend = function(evt) {
					Console.out(binary_stream.name + '..............[OK]');
					classLoader.add(evt.target.result, binary_stream.name);
				};
				reader.readAsBinaryString(binary_stream);
			});
			
		} catch (err) {
			// TODO; use Java Exception Classes
			Console.error(err);
		}
		return this;
	};

	// OPCODE Loop
	// never finish while there is something left to do.
	this.start = function() {
		this.classLoader.start();
		
	};
}