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
      alert e

    @classLoader.start()