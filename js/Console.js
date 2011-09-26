var Console = {
	console : $('#console'),
	tags : {
			1 : 'Asciz',
			3 : 'Integer',
			4 : 'Float',
			5 : 'Long',
			6 : 'Double',
			7 : 'Class',
			8 : 'String Reference',
			9 : 'Field Reference',
			10 : 'Method',
			11 : 'Interface Method',
			12 : 'NameAndType'
		},
	
	write : function(string) {
		this.console.append('<p>'+this.HTMLencode(string)+'</p>');
	},
	
	write_constant : function(index, tag, value) {
		this.console.append('<p class="constant">#' + index + ' ' + this.tags[tag] + '<span class="value">' + this.HTMLencode(value) + '</span></p>');
	},
	
	write_method : function(method) {
		this.console.append('<p class="constant"> name:'+method.name_index+'</p>');
	},
	
	HTMLencode : function(string){
		return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

	}
};