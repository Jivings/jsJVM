
class this.Console
  
     
  constructor : (@stdout, @stderr, verbosity = 'warn') ->
    @tags = 
      1 : 'Asciz'
      3 : 'Integer'
      4 : 'Float'
      5 : 'Long'
      6 : 'Double'
      7 : 'Class'
      8 : 'String Reference'
      9 : 'Field Reference'
      10 : 'Method'
      11 : 'Interface Method'
      12 : 'NameAndType'
    @verbosity = @verbosity_level[verbosity]
    @progress = 0
    
  println : (string, level) ->
    @print('<p>' + string + '</p>', level)
    
  print : (string, level = 0) ->
    if level <= @verbosity then @stdout.write string
  
  writeConstant : (index, tag, value, level) ->
    @print "<p class='constant'># #{index} #{@tags[tag]} <span class='value'>#{value}</span></p>", level 

  verbosity_level : 
    warn : 0
    info : 1
    debug : 2
