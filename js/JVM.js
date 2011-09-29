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
	 * Initialise the ClassLoader
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
					classLoader.load_class(evt.target.result);
					if(i+1 == classes_size) {
						Console.out('Classes loaded successfully.');
					}
				};
				reader.readAsBinaryString(binary_stream);
			});
		} catch (err) {
			// TODO; use Java Exception Classes
			Console.error(err);
		} finally {
			
		}
		
	};

	// OPCODE Loop
	this.start = function() {
		
	};
}