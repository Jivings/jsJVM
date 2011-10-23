var classes = {};
var classes_size = 0;
var V8 = false;

$('#files').change(function(evt){
	var files = evt.target.files;
	for( var i = 0; i < files.length; i++ ) {
		$('#classes').append('<p><input name="classes" value="'+files[i].name+'" type="radio" class="radio" id="radio-'+i+'"/><label for="radio-'+i+'">'+files[i].name+'</label></p>');
		classes[i] = files[i];
		classes_size++;
	};
});

$('#run').click(function(){
	var main = $('input[name="classes"]:checked').val();
	var jvm = new JVM()
		.load(classes, classes_size, main)
		.start();
});

$('#run-debug').click(function(){
	var main = $('input[name="classes"]:checked').val();
	Console._debug = true;
	var jvm = new JVM()
		.load(classes, classes_size, main)
		.start();
});

$(function() {
        
    /* Cannot use $.bind() since jQuery does not normalize native events. */
    $('#dropzone')
        .get(0)
        .addEventListener('drop', upload, false);
});
