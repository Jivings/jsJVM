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
 * Represents the bulk of the JavaScript Implementation of the Java Virtual Machine 
 */
function JVM() {
	
	this.classLoader = new ClassLoader();
	
	
	this.load = function(classes) {
		Console.write('Loading classes...');
		try {
		//$.each(classes, function(i, binary_stream) {
			this.classLoader.load_class(classes);
		//});
		}
		catch(err) {
			Console.write(err);
		}
	};
	
	
	
	// OPCODE Loop
	this.start = function() {
		
	};
}