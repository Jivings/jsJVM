
class this.Console
  
     
  constructor : (document) ->
    @$console = $('<div id="console" />')
    .css({
      'background-color': 'black',
      'bottom': '0',
      'color': 'white',
      'max-height': '400px',
      'min-height': '100px',
      'overflow': 'scroll',
      'position': 'absolute',
      'width': '100%'
    })
    $('body').append @$console
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
    @debug = true
    @progress = 0
    
  println : (string, level = 'normal') ->
    @print('<p>' + string + '</p>', level)
    
  print : (string, level = 'normal') ->
    if (level is 'debug' and @debug is true) or level isnt 'debug'
      @$console.append('<pre>' + string + '</pre>')
  
  writeConstant : (index, tag, value) ->
    
    @print "<p class='constant'># #{index} #{@tags[tag]}<span class='value'>#{value}</span></p>" 
