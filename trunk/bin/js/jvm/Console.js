(function() {
  this.Console = (function() {
    function Console(stdout, stderr, verbosity) {
      this.stdout = stdout;
      this.stderr = stderr;
      if (verbosity == null) {
        verbosity = 'warn';
      }
      this.tags = {
        1: 'Asciz',
        3: 'Integer',
        4: 'Float',
        5: 'Long',
        6: 'Double',
        7: 'Class',
        8: 'String Reference',
        9: 'Field Reference',
        10: 'Method',
        11: 'Interface Method',
        12: 'NameAndType'
      };
      this.verbosity = this.verbosity_level[verbosity];
      this.progress = 0;
    }
    Console.prototype.println = function(string, level) {
      return this.print('<p>' + string + '</p>', level);
    };
    Console.prototype.print = function(string, level) {
      if (level == null) {
        level = 0;
      }
      if (level <= this.verbosity) {
        return this.stdout.write(string);
      }
    };
    Console.prototype.writeConstant = function(index, tag, value, level) {
      return this.print("<p class='constant'># " + index + " " + this.tags[tag] + " <span class='value'>" + value + "</span></p>", level);
    };
    Console.prototype.verbosity_level = {
      warn: 0,
      info: 1,
      debug: 2
    };
    return Console;
  })();
}).call(this);
