//document.getElementById('files').addEventListener('change',
	//		handleFileSelect, false);
var classes = {};
var classes_size = 0;

$('#files').change(function(evt){
	var files = evt.target.files;
	for( var i = 0; i < files.length; i++ ) {
		$('#classes').append('<p><input name="classes" value="'+files[i].name+'" type="radio" class="radio" id="radio-'+i+'"/><label for="radio-'+i+'">'+files[i].name+'</label></p>');
		classes[i] = files[i];
		classes_size++;
	};
});

$('#load').click(function(){
	var main = $('input[name="classes"]:checked').val();
	new JVM().load(classes, classes_size, main);
});

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