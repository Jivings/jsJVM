###
Represents the bulk of the JavaScript Implementation of the Java Virtual
Machine
Defined in Global Scope.
###

class this.JVM
  constructor : (document) ->
    document.console = new Console(document);
    @classLoader = new ClassLoader();

  # Push classes to the classloader stack. Return self for chaining.
  load : (classes, classes_size, main_class_name) -> 
    classLoader = @classLoader
    reader = new FileReader();
    try
      for file of classes
        binary_stream = classes[file]
        reader.onloadend = (evt) ->
          classLoader.add evt.target.result, binary_stream.name
        reader.readAsBinaryString binary_stream 
    catch e
	  # TODO; use Java Exception Classes
      alert e

    @classLoader.start()
    this
