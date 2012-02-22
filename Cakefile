JAVA_HOME = '/usr/lib/jvm/java-6-openjdk/'
fs         = require 'fs'
util       = require 'util'

{spawn, exec} = require 'child_process'

appFiles = [
  'src/jvm/JVM.coffee'
]

workers = [
  'src/jvm/Thread.coffee'
]

task 'watch', 'Build project from src/*.coffee to bin/*.js', ->
  exec 'mkdir -p bin/js/'
  coffee = spawn 'coffee', ['-cw', '-o', 'bin/js', 'src']
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()  

task 'clean', 'Clean /bin/*.js files', ->
  exec 'ls bin/js/*.js', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'coffeeFiles', 'how much coffee you got?!', ->
  traverseFileSystem = (currentPath) ->
      files = fs.readdirSync currentPath
      for file in files
        do (file) ->
          currentFile = currentPath + '/' + file
          stats = fs.statSync(currentFile)
          if stats.isFile() and currentFile.indexOf('.coffee') > 1 and appFiles.join('=').indexOf("#{currentFile}=") < 0
            if workers.join('=').indexOf("#{currentFile}") < 0
              util.log currentFile
              appFiles.push currentFile
          else if stats.isDirectory()
            traverseFileSystem currentFile

  traverseFileSystem 'src'
  util.log "#{appFiles.length} coffee files found."
  return appFiles
  

task 'build', 'Build single application file from source files', ->
  invoke 'coffeeFiles'
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile file, 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  util.log "Compiling workers"
  for file, index in workers then do (file, index) ->
      util.log file
      exec "coffee --compile -o lib/workers #{file}", (err, stdout, stderr) ->
        if err
          util.log 'Something went wrong'
	 
  process = ->
    fs.writeFile 'lib/jvm.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/jvm.coffee', (err, stdout, stderr) ->
        if err
          util.log err 
          util.log 'Error compiling coffee file.'
        else
          fs.unlink 'lib/jvm.coffee', (err) ->
            if err
              util.log 'Couldn\'t delete the app.coffee file/'
            util.log 'Done building coffee file.'
