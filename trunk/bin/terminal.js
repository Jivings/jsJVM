$('.command').focus().val('');

$(document).keydown(function() {
	$('.command:last').focus();
});

$('.command').live('keyup', function(e) {
	var key = e.which;
	switch(key) {
		case 13: // enter
			var c = $(this).val();
			executeCommand(c);
			$(this).replaceWith('<span>'+c+'</span>');
			$('#terminal').append('<p class="line"><span class="prompt">$</span><input type="text" class="command" /></p>');
			$('.command:last').focus();
		case 37: // left
		case 38: // up
		case 39: // right
		case 40: // down
		default:
	}
});

var stdin = {
	stream : [],
	write : function(input) {
		this.stream.push(input);
		this.update();
	},
	// override with callback function 
	read : function() {}
}
var stderr = stdout = {
	stream : [],
	write : function(output) {
		$('#terminal').append('<pre>'+output+'</pre>')
	}
};


function executeCommand(c) {
	var options = [], classname, args = [];
	var command = c.split(" "); 
		
	if(command[0] === 'java') {
			
		for(var i = 1; i < command.length; i++) {
			opt = command[i];
			if(opt.match(/^-/)) {
				options.push(opt);
			}
			else {
				if(classname == null) {
					classname = opt;
				}
				else {
					args.push(opt);
				}
			}
		}
		
		runJava(options, classname, args);		
	}
	else if(command[0] === 'help') {
		$('#terminal').append('This terminal provides access to the JavaScript JVM implementation. The Java program can be executed in the same manner as in a regular bash shell. Type "java -help" to find out more.');
	}
	else {
		$('#terminal').append('<p>Command not found. Type "help" for a list of commands</p>');
	}
};

function runJava(options, classname, args) {
	
	var parameters = {
		'stdin' : stdin,
		'stdout' : stdout,
		'stderr' : stderr,
		'verbosity' : 'warn'
	}
	for(index in options) {
		if(options[index] === '-v' || options[index] === '-verbose') parameters.verbosity = 'info';
		else if(options[index] === '-vv') parameters.verbosity = 'debug';
		else if(options[index] === '-version') parameters.version = 'true'
		else if(options[index] === '-help' || options[index] === '-?') parameters.help = 'true';
	}
	var jvm = new JVM(parameters)
		.load(classname, args)
	
}

