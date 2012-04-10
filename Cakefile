JAVA_HOME = '/usr/lib/jvm/java-6-openjdk/'
fs         = require 'fs'
util       = require 'util'

{spawn, exec} = require 'child_process'

appFiles = [
  'src/jvm/JVM.coffee'
]
javaFiles = [
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
              #util.log currentFile
              appFiles.push currentFile
          else if stats.isDirectory()
            traverseFileSystem currentFile

  traverseFileSystem 'src'
  util.log "#{appFiles.length} coffee files found."
  return appFiles

task 'javaFiles', 'Compile custom Java API files', ->
  traverseFileSystem = (currentPath) ->
      files = fs.readdirSync currentPath
      for file in files
        do (file) ->
          currentFile = currentPath + '/' + file
          stats = fs.statSync(currentFile)
          if stats.isFile() and currentFile.indexOf('.java') > 1 and appFiles.join('=').indexOf("#{currentFile}=") < 0
            if workers.join('=').indexOf("#{currentFile}") < 0
                
              javaFiles.push currentFile
          else if stats.isDirectory()
            traverseFileSystem currentFile

  traverseFileSystem 'src'
  util.log "#{javaFiles.length} java files found."
  return appFiles

task 'compile', 'Compile', ->
  invoke 'javaFiles'
  len = javaFiles.length
  util.log 'Compiling...'
  for file, index in javaFiles then do (file, index) ->
      exec "javac -cp src/lib/rt -d deploy/jre/rt " + file, (err, stdout, stderr) ->
          if err 
            util.log "Error! #{err}"
          #else
          #  util.log "Compiled Java Class #{file}"



task 'dist', 'Zip that stuff', ->
  util.log "Creating tarball..."
  date = new Date()
  day = date.getDate()
  month = date.getMonth()
  year = date.getFullYear()
  # zip that awesome shit up
  exec "tar -cf builds/jvm-latest.tar deploy/*", (err, stdout, stderr) ->
      if err then util.log err
      exec "bzip2 -f builds/jvm-latest.tar", (err, stdout, stderr) ->
        if err then util.log err
        exec "cp builds/jvm-latest.tar.bz2 builds/jvm-#{day}-#{month}-#{year}.tar.bz2", (err, stdout, stderr) ->
          if err then util.log err
          else util.log "Brewed successfully."


task 'build', 'Build single application file from source files', ->
  invoke 'coffeeFiles'
  util.log 'Building...'
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile file, 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  util.log "Creating workers..."
  for file, index in workers then do (file, index) ->
      exec "coffee --compile -o deploy/jre/workers #{file}", (err, stdout, stderr) ->
        if err
          util.log 'Error compiling src.'
          util.log err
  invoke "compile"
  
  process = ->
    fs.writeFile 'deploy/jre/jvm.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile deploy/jre/jvm.coffee', (err, stdout, stderr) ->
        if err
          util.log err 
          util.log 'Error compiling coffee file.'
        else
          fs.unlink 'deploy/jre/jvm.coffee', (err) ->
            if err
              util.log 'Couldn\'t delete the app.coffee file/'
            util.log 'Done brewing coffee.'
