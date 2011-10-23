function JVM_Exception(message, _file, line, offset, cause) {
	
	this.message = message;
	this.cause = cause;
	this._file = _file;
	this.line = line;
	this.offset = offset;
	
	this.toString = function() {
		return message + ' thrown in file ' + _file +  ' on line ' + line;
	};
};
