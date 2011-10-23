###
Represents the bulk of the JavaScript Implementation of the Java Virtual
Machine
###

class JVM
  constructor : ->
	  @classLoader = new ClassLoader();
	
  load : (classes, classes_size, main_class_name) -> 
    reader = new FileReader();
    try
      for binary_stream in classes
        reader.onloadend = (evt) ->
          classLoader.add evt.target.result, binary_stream.name
        reader.readAsBinaryString binary_stream 
    catch e
	  # TODO; use Java Exception Classes
      alert e

    @classLoader.start()